const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.post('/unlock', verifyToken, isAdmin, adminController.unblockedUser);
module.exports = router;