const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    downloads: {
      type: Number,
      default: 0,
    },
    contributorName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
  },
  { timestamps: true }
);

// Index for search
documentSchema.index({ title: 'text', subject: 'text', description: 'text' });
documentSchema.index({ category: 1, year: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);
