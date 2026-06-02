const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getDashboardStats,
  getAdminDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  editDocument,
  getAdminProfile,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.post('/login', loginAdmin);

// Protected
router.get('/me', protect, getAdminProfile);
router.get('/stats', protect, getDashboardStats);
router.get('/documents', protect, getAdminDocuments);
router.put('/documents/:id/approve', protect, approveDocument);
router.put('/documents/:id/reject', protect, rejectDocument);
router.put('/documents/:id', protect, editDocument);
router.delete('/documents/:id', protect, deleteDocument);

module.exports = router;
