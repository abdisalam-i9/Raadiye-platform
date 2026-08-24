import mongoose from 'mongoose';
import { MOGADISHU_DISTRICTS } from '../constants/districts.js';

const lostItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    district: {
      type: String,
      required: true,
      enum: MOGADISHU_DISTRICTS,
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    lostDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'returned', 'expired', 'cancelled'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

lostItemSchema.index({ status: 1, createdAt: -1 });
lostItemSchema.index({ postedBy: 1, createdAt: -1 });

const LostItem = mongoose.model('LostItem', lostItemSchema);

export default LostItem;
