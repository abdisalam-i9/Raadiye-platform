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
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
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
    identifyingMarks: {
      type: String,
      default: '',
      trim: true,
      maxlength: 400,
    },
    status: {
      type: String,
      enum: ['active', 'matched', 'returned', 'expired', 'cancelled'],
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
foundItemSchema.index({ category: 1, status: 1, createdAt: -1 });
foundItemSchema.index({ district: 1, status: 1 });
foundItemSchema.index({ foundDate: -1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

export default FoundItem;
