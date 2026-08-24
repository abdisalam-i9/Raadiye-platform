import mongoose from 'mongoose';
import { MOGADISHU_DISTRICTS } from '../constants/districts.js';

const foundItemSchema = new mongoose.Schema(
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
    foundDate: {
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

foundItemSchema.index({ status: 1, createdAt: -1 });
foundItemSchema.index({ postedBy: 1, createdAt: -1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

export default FoundItem;
