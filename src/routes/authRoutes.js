const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

const authController = require('../controllers/authController');

//middleware
const { isLoggedIn } = require('../middleware/authMiddleware');
const { isLoggedOut } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

router.get('/signUp', isLoggedOut,authController.signUpPage);
router.post('/signUp',loginLimiter,authController.signUp);

router.get('/login', isLoggedOut, authController.loginPage);
router.post('/login',loginLimiter, authController.login);

router.get('/logout', authController.logout);

router.get('/profile',isLoggedIn, authController.profilePage);
router.post('/profile', isLoggedIn, upload.single('collegeIdImage'),authController.profile);

module.exports = router;