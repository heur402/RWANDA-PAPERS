const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const Document = require('../models/Document.model');
const Download = require('../models/Download.model');
const Category = require('../models/Category.model');

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register a new admin
// @route   POST /api/admin/signup
// @access  Public (first admin) — Protected for subsequent admins
const signupAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token: generateToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDocuments,
      totalDownloads,
      pendingUploads,
      approvedUploads,
      rejectedUploads,
      recentDownloads,
    ] = await Promise.all([
      Document.countDocuments(),
      Download.countDocuments(),
      Document.countDocuments({ status: 'pending' }),
      Document.countDocuments({ status: 'approved' }),
      Document.countDocuments({ status: 'rejected' }),
      Download.find().sort({ downloadedAt: -1 }).limit(10).populate('documentId', 'title'),
    ]);

    // Most downloaded documents
    const mostDownloaded = await Document.find({ status: 'approved' })
      .sort({ downloads: -1 })
      .limit(5)
      .populate('category', 'name');

    res.json({
      success: true,
      data: {
        totalDocuments,
        totalDownloads,
        pendingUploads,
        approvedUploads,
        rejectedUploads,
        recentDownloads,
        mostDownloaded,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents (admin view)
// @route   GET /api/admin/documents
// @access  Private
const getAdminDocuments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a document
// @route   PUT /api/admin/documents/:id/approve
// @access  Private
const approveDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('category', 'name');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document approved', data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a document
// @route   PUT /api/admin/documents/:id/reject
// @access  Private
const rejectDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('category', 'name');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document rejected', data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/admin/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Optionally delete associated download records
    await Download.deleteMany({ documentId: req.params.id });

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a document
// @route   PUT /api/admin/documents/:id
// @access  Private
const editDocument = async (req, res, next) => {
  try {
    const { title, description, subject, category, year } = req.body;

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { title, description, subject, category, year },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document updated', data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private
const getAdminProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.admin });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signupAdmin,
  loginAdmin,
  getDashboardStats,
  getAdminDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  editDocument,
  getAdminProfile,
};
