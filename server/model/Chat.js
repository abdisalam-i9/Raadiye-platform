import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    itemKind: {
      type: String,
      enum: ['found', 'lost'],
      required: true,
    },
    itemTitle: {
      type: String,
      default: '',
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2,
        message: 'Chat must have exactly 2 participants',
      },
    },
    pairKey: {
      type: String,
      required: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastMessageText: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

chatSchema.index({ item: 1, itemKind: 1, pairKey: 1 }, { unique: true });
chatSchema.index({ participants: 1, lastMessageAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
