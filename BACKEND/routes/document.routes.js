const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocument,
  downloadDocument,
  getFeaturedDocuments,
  getLatestDocuments,
} = require('../controllers/document.controller');

router.get('/featured', getFeaturedDocuments);
router.get('/latest', getLatestDocuments);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;
