import express from 'express';
import mongoose from 'mongoose';
import Category from '../model/Category.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';
import { createItemLimiter } from '../middleware/rateLimiter.js';
import { MOGADISHU_DISTRICTS } from '../constants/districts.js';
import { resolveCoords } from '../constants/geo.js';
import { handleItemImageUpload } from '../middleware/uploadMiddleware.js';
import { saveItemImage } from '../utils/saveItemImage.js';
import { findMatches } from '../utils/matchService.js';
import { notifyMatchesForItem } from '../utils/notifyMatch.js';
import Claim from '../model/Claim.js';
import User from '../model/UserModel.js';
import { posterId, sanitizeListing } from '../utils/listingPrivacy.js';
import { notifyClaim, notifyClaimResult } from '../utils/notifyClaim.js';

function cleanMarks(value) {
  return String(value || '').trim().slice(0, 400);
}

function serializeClaim(claim) {
  const claimant = claim.claimant;
  return {
    id: String(claim._id),
    status: claim.status,
    description: claim.description,
    createdAt: claim.createdAt,
    claimant: claimant
      ? {
          id: String(claimant._id || claimant),
          name: claimant.name || '',
        }
      : null,
  };
}

function publicMatchItem(matchedItem) {
  const { postedBy: _postedBy, contactPhone: _phone, identifyingMarks: _marks, ...publicItem } =
    matchedItem;
  return publicItem;
}

async function storeUploadedImage(req, res) {
  if (!req.file) return '';
  try {
    return await saveItemImage(req.file);
  } catch (error) {
    console.log('Image upload error:', error);
    res.status(500).json({ status: false, message: 'Failed to upload image' });
    return null;
  }
}

function listingStatusFilter(value) {
  if (!value || value === 'open') return { $in: ['active', 'matched'] };
  if (value === 'pending') return 'active';
  if (value === 'closed') return { $in: ['returned', 'expired', 'cancelled'] };
  if (['active', 'matched', 'returned', 'expired', 'cancelled'].includes(value)) return value;
  return { $in: ['active', 'matched'] };
}

function isOpenStatus(status) {
  return status === 'active' || status === 'matched';
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function createListingRouter({ Model, dateField, label, kind }) {
  const router = express.Router();

  router.post('/', createItemLimiter, authMiddleware, handleItemImageUpload, async (req, res) => {
    try {
      const { title, category, district, village, contactPhone } = req.body;
      const dateValue = req.body[dateField];

      if (!title || !category || !district || !village || !dateValue || !contactPhone) {
        return res.status(400).json({
          status: false,
          message: `Title, category, district, village, ${dateField} and contact phone are required`,
        });
      }

      const cleanDistrict = district.trim();
      if (!MOGADISHU_DISTRICTS.includes(cleanDistrict)) {
        return res.status(400).json({ status: false, message: 'Invalid district' });
      }

      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ status: false, message: 'Invalid category' });
      }

      const categoryExists = await Category.findOne({ _id: category, isActive: true });
      if (!categoryExists) {
        return res.status(400).json({ status: false, message: 'Category not found or inactive' });
      }

      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ status: false, message: `Invalid ${dateField}` });
      }

      const uploadedImage = await storeUploadedImage(req, res);
      if (uploadedImage === null) return undefined;

      const coords = resolveCoords(cleanDistrict, req.body.lat, req.body.lng);

      const item = await Model.create({
        title: title.trim(),
        category,
        district: cleanDistrict,
        village: village.trim(),
        lat: coords.lat,
        lng: coords.lng,
        [dateField]: parsedDate,
        contactPhone: contactPhone.trim(),
        identifyingMarks: cleanMarks(req.body.identifyingMarks),
        image: uploadedImage,
        status: 'active',
        postedBy: req.user.userId,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      await item.populate('category', 'name slug');

      notifyMatchesForItem({
        item,
        kind,
        io: req.app.get('io'),
      }).catch((error) => console.log('Match notify error:', error));

      return res.status(201).json({
        status: true,
        message: `${label} posted successfully`,
        item: sanitizeListing(item, { user: req.user }),
      });
    } catch (error) {
      console.log(`Create ${label} error:`, error);
      return res.status(500).json({ status: false, message: `Failed to post ${label}` });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { category, district, village, search, status, dateFrom, dateTo, page = 1, limit = 10 } =
        req.query;
      const currentPage = Math.max(Number(page) || 1, 1);
      const itemsPerPage = Math.min(Math.max(Number(limit) || 10, 1), 50);
      const skip = (currentPage - 1) * itemsPerPage;
      const filter = { status: listingStatusFilter(status) };

      if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
          return res.status(400).json({ status: false, message: 'Invalid category' });
        }
        filter.category = category;
      }

      if (district) filter.district = district.trim();
      if (village) filter.village = { $regex: village.trim(), $options: 'i' };
      if (search) filter.title = { $regex: search.trim(), $options: 'i' };

      if (dateFrom || dateTo) {
        filter[dateField] = {};
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (!Number.isNaN(from.getTime())) filter[dateField].$gte = from;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          if (!Number.isNaN(to.getTime())) filter[dateField].$lte = endOfDay(to);
        }
        if (!Object.keys(filter[dateField]).length) delete filter[dateField];
      }

      const [items, totalItems] = await Promise.all([
        Model.find(filter)
          .populate('category', 'name slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(itemsPerPage),
        Model.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalItems / itemsPerPage);

      return res.status(200).json({
        status: true,
        items: items.map((item) => sanitizeListing(item, { publicList: true })),
        pagination: {
          currentPage,
          itemsPerPage,
          totalItems,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      });
    } catch (error) {
      console.log(`Get ${label} list error:`, error);
      return res.status(500).json({ status: false, message: `Failed to get ${label}s` });
    }
  });

  router.get('/my-items', authMiddleware, async (req, res) => {
    try {
      const items = await Model.find({ postedBy: req.user.userId })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: true,
        items: items.map((item) => sanitizeListing(item, { user: req.user })),
      });
    } catch (error) {
      console.log(`Get my ${label}s error:`, error);
      return res.status(500).json({ status: false, message: `Failed to get your ${label}s` });
    }
  });

  router.get('/:id/matches', async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findOne({
        _id: req.params.id,
        status: { $in: ['active', 'matched'] },
      }).populate('category', 'name slug');
      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Item not found or no longer available',
        });
      }

      const matches = await findMatches(item, kind);
      return res.status(200).json({
        status: true,
        matches: matches.map(({ item: matchedItem, ...rest }) => ({
          ...rest,
          item: publicMatchItem(matchedItem),
        })),
      });
    } catch (error) {
      console.log(`Get ${label} matches error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to find matches' });
    }
  });

  router.post('/:id/claims', authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const description = String(req.body.description || '').trim();
      if (description.length < 12) {
        return res.status(400).json({
          status: false,
          message: 'Describe private marks in at least 12 characters',
        });
      }
      if (description.length > 400) {
        return res.status(400).json({ status: false, message: 'Claim description is too long' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }
      if (!isOpenStatus(item.status)) {
        return res.status(400).json({ status: false, message: 'This item is no longer available' });
      }
      if (posterId(item) === String(req.user.userId)) {
        return res.status(400).json({ status: false, message: 'You cannot claim your own listing' });
      }

      const existingAccepted = await Claim.findOne({
        item: item._id,
        itemKind: kind,
        claimant: req.user.userId,
        status: 'accepted',
      });
      if (existingAccepted) {
        return res.status(400).json({ status: false, message: 'This claim was already accepted' });
      }

      const existingPending = await Claim.findOne({
        item: item._id,
        itemKind: kind,
        claimant: req.user.userId,
        status: 'pending',
      });
      if (existingPending) {
        return res.status(400).json({
          status: false,
          message: 'You already have a pending claim for this item',
        });
      }

      const claim = await Claim.create({
        item: item._id,
        itemKind: kind,
        claimant: req.user.userId,
        description,
        status: 'pending',
      });

      const claimant = await User.findById(req.user.userId).select('name');
      notifyClaim({
        ownerId: posterId(item),
        claimantName: claimant?.name || '',
        item,
        kind,
        io: req.app.get('io'),
      }).catch((error) => console.log('Claim notify error:', error));

      await claim.populate('claimant', 'name');
      return res.status(201).json({
        status: true,
        message: 'Claim submitted',
        claim: serializeClaim(claim),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          status: false,
          message: 'You already have a pending claim for this item',
        });
      }
      console.log(`Create ${label} claim error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to submit claim' });
    }
  });

  router.get('/:id/claims', authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      const isOwner = posterId(item) === String(req.user.userId);
      const isAdmin = req.user.role === 'admin';
      const filter = { item: item._id, itemKind: kind };
      if (!isOwner && !isAdmin) {
        filter.claimant = req.user.userId;
      }

      const claims = await Claim.find(filter)
        .populate('claimant', 'name')
        .sort({ createdAt: -1 });
      const order = { pending: 0, accepted: 1, rejected: 2 };
      claims.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

      return res.status(200).json({
        status: true,
        claims: claims.map(serializeClaim),
      });
    } catch (error) {
      console.log(`Get ${label} claims error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to load claims' });
    }
  });

  router.patch('/:id/claims/:claimId', authMiddleware, async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(req.params.id) ||
        !mongoose.Types.ObjectId.isValid(req.params.claimId)
      ) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const nextStatus = req.body.status;
      if (!['accepted', 'rejected'].includes(nextStatus)) {
        return res.status(400).json({ status: false, message: 'Invalid claim status' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      const isOwner = posterId(item) === String(req.user.userId);
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ status: false, message: 'Only the poster can review claims' });
      }

      const claim = await Claim.findOne({
        _id: req.params.claimId,
        item: item._id,
        itemKind: kind,
      }).populate('claimant', 'name');
      if (!claim) {
        return res.status(404).json({ status: false, message: 'Claim not found' });
      }
      if (claim.status !== 'pending') {
        return res.status(400).json({ status: false, message: 'This claim was already reviewed' });
      }

      claim.status = nextStatus;
      await claim.save();

      const io = req.app.get('io');
      if (nextStatus === 'accepted') {
        if (item.status === 'active') {
          item.status = 'matched';
          await item.save();
        }

        const others = await Claim.find({
          item: item._id,
          itemKind: kind,
          status: 'pending',
          _id: { $ne: claim._id },
        });
        await Promise.all(
          others.map(async (other) => {
            other.status = 'rejected';
            await other.save();
            notifyClaimResult({
              claimantId: other.claimant,
              item,
              kind,
              accepted: false,
              io,
            }).catch((error) => console.log('Claim result notify error:', error));
          })
        );
      }

      notifyClaimResult({
        claimantId: claim.claimant?._id || claim.claimant,
        item,
        kind,
        accepted: nextStatus === 'accepted',
        io,
      }).catch((error) => console.log('Claim result notify error:', error));

      return res.status(200).json({
        status: true,
        message: nextStatus === 'accepted' ? 'Claim accepted' : 'Claim rejected',
        claim: serializeClaim(claim),
        item: sanitizeListing(item, { user: req.user }),
      });
    } catch (error) {
      console.log(`Update ${label} claim error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to update claim' });
    }
  });

  router.get('/:id', optionalAuth, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('postedBy', 'name avatar district bio');

      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Item not found or no longer available',
        });
      }

      let myClaim = null;
      let canSeePhone = false;
      if (req.user?.userId) {
        const claim = await Claim.findOne({
          item: item._id,
          itemKind: kind,
          claimant: req.user.userId,
        }).sort({ createdAt: -1 });
        if (claim) {
          myClaim = serializeClaim(claim);
          if (claim.status === 'accepted') canSeePhone = true;
        }
      }

      return res.status(200).json({
        status: true,
        item: sanitizeListing(item, { user: req.user, canSeePhone }),
        myClaim,
      });
    } catch (error) {
      console.log(`Get ${label} error:`, error);
      return res.status(500).json({ status: false, message: `Failed to get ${label}` });
    }
  });

  router.put('/:id', authMiddleware, handleItemImageUpload, async (req, res) => {
    try {
      const { title, category, district, village, contactPhone } = req.body;
      const dateValue = req.body[dateField];

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      if (item.postedBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ status: false, message: 'You can only edit your own posts' });
      }

      if (!isOpenStatus(item.status)) {
        return res.status(400).json({ status: false, message: 'This item can no longer be edited' });
      }

      if (title !== undefined) {
        const cleanTitle = title.trim();
        if (!cleanTitle) {
          return res.status(400).json({ status: false, message: 'Title cannot be empty' });
        }
        item.title = cleanTitle;
      }

      if (category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
          return res.status(400).json({ status: false, message: 'Invalid category' });
        }
        const categoryExists = await Category.findOne({ _id: category, isActive: true });
        if (!categoryExists) {
          return res.status(400).json({ status: false, message: 'Category not found or inactive' });
        }
        item.category = category;
      }

      if (district !== undefined) {
        const cleanDistrict = district.trim();
        if (!MOGADISHU_DISTRICTS.includes(cleanDistrict)) {
          return res.status(400).json({ status: false, message: 'Invalid district' });
        }
        item.district = cleanDistrict;
      }

      if (village !== undefined) {
        const cleanVillage = village.trim();
        if (!cleanVillage) {
          return res.status(400).json({ status: false, message: 'Village cannot be empty' });
        }
        item.village = cleanVillage;
      }

      if (req.body.lat !== undefined || req.body.lng !== undefined || district !== undefined) {
        const coords = resolveCoords(item.district, req.body.lat ?? item.lat, req.body.lng ?? item.lng);
        item.lat = coords.lat;
        item.lng = coords.lng;
      }

      if (dateValue !== undefined) {
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ status: false, message: `Invalid ${dateField}` });
        }
        item[dateField] = parsedDate;
      }

      if (contactPhone !== undefined) {
        const cleanPhone = contactPhone.trim();
        if (cleanPhone.length < 7) {
          return res.status(400).json({ status: false, message: 'Invalid contact phone' });
        }
        item.contactPhone = cleanPhone;
      }

      if (req.body.identifyingMarks !== undefined) {
        item.identifyingMarks = cleanMarks(req.body.identifyingMarks);
      }

      if (req.file) {
        const uploadedImage = await storeUploadedImage(req, res);
        if (uploadedImage === null) return undefined;
        item.image = uploadedImage;
      }

      await item.save();
      await item.populate('category', 'name slug');

      notifyMatchesForItem({
        item,
        kind,
        io: req.app.get('io'),
      }).catch((error) => console.log('Match notify error:', error));

      return res.status(200).json({
        status: true,
        message: `${label} updated successfully`,
        item: sanitizeListing(item, { user: req.user }),
      });
    } catch (error) {
      console.log(`Update ${label} error:`, error);
      return res.status(500).json({ status: false, message: `Failed to update ${label}` });
    }
  });

  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      if (item.postedBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ status: false, message: 'You can only cancel your own posts' });
      }

      if (!isOpenStatus(item.status)) {
        return res.status(400).json({ status: false, message: 'This item is no longer active' });
      }

      item.status = 'cancelled';
      await item.save();

      return res.status(200).json({ status: true, message: `${label} cancelled successfully` });
    } catch (error) {
      console.log(`Cancel ${label} error:`, error);
      return res.status(500).json({ status: false, message: `Failed to cancel ${label}` });
    }
  });

  router.patch('/:id/matched', authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      if (item.postedBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          status: false,
          message: 'You can only update your own posts',
        });
      }

      if (item.status !== 'active') {
        return res.status(400).json({
          status: false,
          message: 'Only an open listing can be marked as matched',
        });
      }

      item.status = 'matched';
      await item.save();
      await item.populate('category', 'name slug');

      return res.status(200).json({
        status: true,
        message: 'Item marked as matched',
        item: sanitizeListing(item, { user: req.user }),
      });
    } catch (error) {
      console.log(`Mark matched ${label} error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to mark item as matched' });
    }
  });

  router.patch('/:id/returned', authMiddleware, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ status: false, message: 'Item not found' });
      }

      if (item.postedBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          status: false,
          message: 'You can only update your own posts',
        });
      }

      if (!isOpenStatus(item.status)) {
        return res.status(400).json({ status: false, message: 'This item is no longer active' });
      }

      item.status = 'returned';
      item.returnedAt = new Date();
      await item.save();

      return res.status(200).json({
        status: true,
        message: 'Item marked as returned successfully',
        item: sanitizeListing(item, { user: req.user }),
      });
    } catch (error) {
      console.log(`Mark returned ${label} error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to mark item as returned' });
    }
  });

  return router;
}
