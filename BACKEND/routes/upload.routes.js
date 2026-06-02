const express = require('express');
const router = express.Router();
const { submitDocument } = require('../controllers/upload.controller');
const { upload } = require('../config/multer');

router.post('/', upload.single('file'), submitDocument);

module.exports = router;
