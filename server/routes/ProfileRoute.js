import express from 'express';
import mongoose from 'mongoose';
import User from '../model/UserModel.js';
import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';
import { MOGADISHU_DISTRICTS } from '../constants/districts.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleItemImageUpload } from '../middleware/uploadMiddleware.js';
import { saveItemImage } from '../utils/saveItemImage.js';

const router = express.Router();

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    bio: user.bio || '',
    avatar: user.avatar || '',
    district: user.district || '',
    createdAt: user.createdAt,
  };
}

function privateUser(user) {
  return {
    ...publicUser(user),
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

async function listingSummary(userId, { includeClosed = false } = {}) {
  const status = includeClosed ? undefined : { $in: ['active', 'matched'] };
  const foundFilter = { postedBy: userId };
  const lostFilter = { postedBy: userId };
  if (status) {
    foundFilter.status = status;
    lostFilter.status = status;
  }

  const [found, lost] = await Promise.all([
    FoundItem.find(foundFilter).populate('category', 'name slug').sort({ createdAt: -1 }).limit(12),
    LostItem.find(lostFilter).populate('category', 'name slug').sort({ createdAt: -1 }).limit(12),
  ]);

  return {
    foundCount: await FoundItem.countDocuments(foundFilter),
    lostCount: await LostItem.countDocuments(lostFilter),
    found,
    lost,
  };
}

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const listings = await listingSummary(user._id, { includeClosed: true });
    return res.status(200).json({ status: true, user: privateUser(user), listings });
  } catch (error) {
    console.log('Get me error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load profile' });
  }
});

router.put('/me', authMiddleware, handleItemImageUpload, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const { name, phone, bio, district } = req.body;

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (cleanName.length < 3) {
        return res.status(400).json({ status: false, message: 'Name must be at least 3 characters' });
      }
      user.name = cleanName;
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (cleanPhone.length < 9) {
        return res.status(400).json({ status: false, message: 'Please provide a valid phone number' });
      }
      user.phone = cleanPhone;
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim().slice(0, 400);
    }

    if (district !== undefined) {
      const cleanDistrict = String(district).trim();
      if (cleanDistrict && !MOGADISHU_DISTRICTS.includes(cleanDistrict)) {
        return res.status(400).json({ status: false, message: 'Invalid district' });
      }
      user.district = cleanDistrict;
    }

    if (req.file) {
      try {
        user.avatar = await saveItemImage(req.file, { folder: 'avatars' });
      } catch (error) {
        console.log('Avatar upload error:', error);
        return res.status(500).json({ status: false, message: 'Failed to upload image' });
      }
    }

    await user.save();
    return res.status(200).json({
      status: true,
      message: 'Profile updated',
      user: privateUser(user),
    });
  } catch (error) {
    console.log('Update me error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update profile' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid user ID' });
    }

    const user = await User.findOne({ _id: req.params.id, isActive: true }).select(
      'name bio avatar district createdAt'
    );
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const listings = await listingSummary(user._id);
    return res.status(200).json({ status: true, user: publicUser(user), listings });
  } catch (error) {
    console.log('Get user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load profile' });
  }
});

export default router;
