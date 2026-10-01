import mongoose from 'mongoose';
import './User';

const CommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ article: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ isApproved: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
