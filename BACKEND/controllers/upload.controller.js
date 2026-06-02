const Document = require('../models/Document.model');
const path = require('path');

// @desc    Public upload (visitor submission)
// @route   POST /api/uploads
// @access  Public
const submitDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, description, subject, category, year, contributorName } = req.body;

    if (!title || !subject || !category || !year) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, category and year are required',
      });
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const fileType = ext === 'pdf' ? 'pdf' : 'docx';

    const document = await Document.create({
      title,
      description: description || '',
      subject,
      category,
      year: Number(year),
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      contributorName: contributorName || 'Anonymous',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Document submitted successfully. It will appear after admin review.',
      data: { id: document._id, title: document.title, status: document.status },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitDocument };
