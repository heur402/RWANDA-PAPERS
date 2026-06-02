const multer    = require('multer');
const cloudinary = require('./cloudinary');
const { Readable } = require('stream');

// Use memory storage — file bytes go to buffer, we then stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

/**
 * uploadToCloudinary(buffer) → Promise<{ url, publicId }>
 *
 * Streams a file buffer to Cloudinary and returns the secure URL + public_id.
 * Use after multer middleware has populated req.file.buffer.
 */
const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        'rwanda-papers/documents',
        resource_type: 'raw',
        public_id:     publicId,
        // Keep original extension
        format: originalName.split('.').pop().toLowerCase(),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };
