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
      enum: ['match', 'message', 'claim'],
      required: true,
    },
    sourceKind: {
      type: String,
      enum: ['found', 'lost'],
    },
    sourceItem: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sourceTitle: {
      type: String,
      default: '',
    },
    matchedKind: {
      type: String,
      enum: ['found', 'lost'],
    },
    matchedItem: {
      type: mongoose.Schema.Types.ObjectId,
    },
    matchedTitle: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    senderName: {
      type: String,
      default: '',
    },
    preview: {
      type: String,
      default: '',
    },
    itemTitle: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, updatedAt: -1 });
notificationSchema.index({ user: 1, type: 1, chat: 1, read: 1 });
notificationSchema.index(
  { user: 1, sourceItem: 1, matchedItem: 1 },
  {
    unique: true,
    name: 'uniq_match_user_pair',
    partialFilterExpression: { type: 'match' },
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
