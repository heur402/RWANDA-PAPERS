const express = require('express');
const router = express.Router();
const {
  signupAdmin,
  loginAdmin,
  getDashboardStats,
  getAdminDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  editDocument,
  adminUploadDocument,
  updateAdminProfile,
  changeAdminPassword,
  getAdminProfile,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');

// Public
router.post('/login', loginAdmin);
router.post('/signup', signupAdmin);

// Protected — profile
router.get('/me', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.put('/password', protect, changeAdminPassword);

// Protected — stats
router.get('/stats', protect, getDashboardStats);

// Protected — document management
router.post('/documents/upload', protect, upload.single('file'), adminUploadDocument);
router.get('/documents', protect, getAdminDocuments);
router.put('/documents/:id/approve', protect, approveDocument);
router.put('/documents/:id/reject', protect, rejectDocument);
router.put('/documents/:id', protect, editDocument);
router.delete('/documents/:id', protect, deleteDocument);

module.exports = router;
