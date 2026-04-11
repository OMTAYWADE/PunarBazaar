const express = require('express');
const router = express.Router();

const redisClient = require('../config/redis');

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.post('/admin/unlock', verifyToken, isAdmin, adminController.unblockedUser);