import express from 'express';
import mongoose from 'mongoose';
import Category from '../model/Category.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createItemLimiter } from '../middleware/rateLimiter.js';
import { MOGADISHU_DISTRICTS } from '../constants/districts.js';
import { handleItemImageUpload } from '../middleware/uploadMiddleware.js';
import { saveItemImage } from '../utils/saveItemImage.js';
import { findMatches } from '../utils/matchService.js';
import { notifyMatchesForItem } from '../utils/notifyMatch.js';

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

      const item = await Model.create({
        title: title.trim(),
        category,
        district: cleanDistrict,
        village: village.trim(),
        [dateField]: parsedDate,
        contactPhone: contactPhone.trim(),
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
        item,
      });
    } catch (error) {
      console.log(`Create ${label} error:`, error);
      return res.status(500).json({ status: false, message: `Failed to post ${label}` });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { category, district, village, search, page = 1, limit = 10 } = req.query;
      const currentPage = Math.max(Number(page) || 1, 1);
      const itemsPerPage = Math.min(Math.max(Number(limit) || 10, 1), 50);
      const skip = (currentPage - 1) * itemsPerPage;
      const filter = { status: 'active' };

      if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
          return res.status(400).json({ status: false, message: 'Invalid category' });
        }
        filter.category = category;
      }

      if (district) filter.district = district.trim();
      if (village) filter.village = { $regex: village.trim(), $options: 'i' };
      if (search) filter.title = { $regex: search.trim(), $options: 'i' };

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
        items,
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

      return res.status(200).json({ status: true, items });
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

      const item = await Model.findOne({ _id: req.params.id, status: 'active' }).populate(
        'category',
        'name slug'
      );
      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Item not found or no longer available',
        });
      }

      const matches = await findMatches(item, kind);
      return res.status(200).json({
        status: true,
        matches: matches.map(({ item: matchedItem, ...rest }) => {
          const { postedBy: _postedBy, ...publicItem } = matchedItem;
          return { ...rest, item: publicItem };
        }),
      });
    } catch (error) {
      console.log(`Get ${label} matches error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to find matches' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: false, message: 'Invalid item ID' });
      }

      const item = await Model.findOne({
        _id: req.params.id,
        status: 'active',
      }).populate('category', 'name slug');

      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Item not found or no longer available',
        });
      }

      return res.status(200).json({ status: true, item });
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

      if (item.status !== 'active') {
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

      return res.status(200).json({ status: true, message: `${label} updated successfully`, item });
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

      if (item.status !== 'active') {
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

      if (item.status !== 'active') {
        return res.status(400).json({ status: false, message: 'This item is no longer active' });
      }

      item.status = 'returned';
      item.returnedAt = new Date();
      await item.save();

      return res.status(200).json({
        status: true,
        message: 'Item marked as returned successfully',
        item,
      });
    } catch (error) {
      console.log(`Mark returned ${label} error:`, error);
      return res.status(500).json({ status: false, message: 'Failed to mark item as returned' });
    }
  });

  return router;
}
