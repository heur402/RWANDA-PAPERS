const Document = require('../models/Document.model');
const Download = require('../models/Download.model');
const path = require('path');
const fs = require('fs');

// @desc    Get all approved documents with search & pagination
// @route   GET /api/documents
// @access  Public
const getDocuments = async (req, res, next) => {
  try {
    const { search, category, subject, year, page = 1, limit = 12 } = req.query;
    const query = { status: 'approved' };

    if (category) query.category = category;
    if (year) query.year = Number(year);
    if (subject) query.subject = { $regex: subject, $options: 'i' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Public
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      status: 'approved',
    }).populate('category', 'name description');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a document (track + serve)
// @route   GET /api/documents/:id/download
// @access  Public
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      status: 'approved',
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Track download
    await Download.create({
      documentId: document._id,
      ipAddress: req.ip || '',
    });

    // Increment download count
    await Document.findByIdAndUpdate(document._id, { $inc: { downloads: 1 } });

    // Serve the file
    const filePath = path.join(__dirname, '../uploads', path.basename(document.fileUrl));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(filePath, `${document.title}.${document.fileType}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured / most downloaded documents
// @route   GET /api/documents/featured
// @access  Public
const getFeaturedDocuments = async (req, res, next) => {
  try {
    const featured = await Document.find({ status: 'approved' })
      .populate('category', 'name')
      .sort({ downloads: -1 })
      .limit(6);

    res.json({ success: true, data: featured });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest documents
// @route   GET /api/documents/latest
// @access  Public
const getLatestDocuments = async (req, res, next) => {
  try {
    const latest = await Document.find({ status: 'approved' })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ success: true, data: latest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocument,
  downloadDocument,
  getFeaturedDocuments,
  getLatestDocuments,
};
