import express from 'express';
import User from '../model/UserModel.js';
import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';
import Notification from '../model/Notification.js';
import Chat from '../model/Chat.js';
import Category from '../model/Category.js';
import Claim from '../model/Claim.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

async function countsByStatus(Model) {
  const rows = await Model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const result = { active: 0, matched: 0, returned: 0, expired: 0, cancelled: 0, total: 0 };
  rows.forEach((row) => {
    result[row._id] = row.count;
    result.total += row.count;
  });
  result.open = (result.active || 0) + (result.matched || 0);
  result.closed = (result.returned || 0) + (result.expired || 0) + (result.cancelled || 0);
  result.pending = result.active || 0;
  return result;
}

router.get('/stats', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [users, verifiedUsers, newUsers, found, lost, notifications, chats, categories, pendingClaims, acceptedClaims, totalClaims] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ createdAt: { $gte: weekAgo } }),
        countsByStatus(FoundItem),
        countsByStatus(LostItem),
        Notification.countDocuments(),
        Chat.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Claim.countDocuments({ status: 'pending' }),
        Claim.countDocuments({ status: 'accepted' }),
        Claim.countDocuments(),
      ]);

    const [foundByDistrict, lostByDistrict, foundByCategory, lostByCategory] = await Promise.all([
      FoundItem.aggregate([
        { $match: { status: { $in: ['active', 'matched'] } } },
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      LostItem.aggregate([
        { $match: { status: { $in: ['active', 'matched'] } } },
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      FoundItem.aggregate([
        { $match: { status: { $in: ['active', 'matched'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      LostItem.aggregate([
        { $match: { status: { $in: ['active', 'matched'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const categoryIds = [...foundByCategory, ...lostByCategory]
      .map((row) => row._id)
      .filter(Boolean);
    const categoryDocs = await Category.find({ _id: { $in: categoryIds } }).select('name');
    const categoryNames = Object.fromEntries(categoryDocs.map((doc) => [String(doc._id), doc.name]));

    return res.status(200).json({
      status: true,
      stats: {
        users: { total: users, verified: verifiedUsers, new7d: newUsers },
        found,
        lost,
        notifications,
        chats,
        categories,
        claims: { pending: pendingClaims, accepted: acceptedClaims, total: totalClaims },
        districts: {
          found: foundByDistrict.map((row) => ({ name: row._id, count: row.count })),
          lost: lostByDistrict.map((row) => ({ name: row._id, count: row.count })),
        },
        topCategories: {
          found: foundByCategory.map((row) => ({
            name: categoryNames[String(row._id)] || 'Other',
            count: row.count,
          })),
          lost: lostByCategory.map((row) => ({
            name: categoryNames[String(row._id)] || 'Other',
            count: row.count,
          })),
        },
      },
    });
  } catch (error) {
    console.log('Admin stats error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load analytics' });
  }
});

export default router;
