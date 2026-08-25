import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js';
import Notification from '../model/Notification.js';
import { serializeNotification } from '../utils/notifications.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ updatedAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      read: false,
    });

    return res.status(200).json({
      status: true,
      unreadCount,
      notifications: notifications.map(serializeNotification),
    });
  } catch (error) {
    console.log('List notifications error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load notifications' });
  }
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { read: true });
    return res.status(200).json({ status: true, unreadCount: 0 });
  } catch (error) {
    console.log('Read all notifications error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update notifications' });
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      read: false,
    });

    return res.status(200).json({
      status: true,
      unreadCount,
      notification: serializeNotification(notification),
    });
  } catch (error) {
    console.log('Read notification error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update notification' });
  }
});

export default router;
