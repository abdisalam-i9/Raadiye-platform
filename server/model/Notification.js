import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['match'],
      default: 'match',
    },
    sourceKind: {
      type: String,
      enum: ['found', 'lost'],
      required: true,
    },
    sourceItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sourceTitle: {
      type: String,
      default: '',
    },
    matchedKind: {
      type: String,
      enum: ['found', 'lost'],
      required: true,
    },
    matchedItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    matchedTitle: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, sourceItem: 1, matchedItem: 1 }, { unique: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
