import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
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
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

claimSchema.index(
  { item: 1, itemKind: 1, claimant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
claimSchema.index({ item: 1, status: 1 });

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
