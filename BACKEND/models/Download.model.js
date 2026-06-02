const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: false }
);

downloadSchema.index({ documentId: 1 });
downloadSchema.index({ downloadedAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
