const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

const authController = require('../controllers/authController');

//middleware
const { isLoggedIn,isLoggedOut,verifyToken } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateSignUp, } = require('../middleware/validate');

router.get('/signUp', isLoggedOut,authController.signUpPage);
router.post('/signUp',loginLimiter,validateSignUp,authController.signUp);

router.get('/login', isLoggedOut, authController.loginPage);
router.post('/login',loginLimiter, validateLogin, authController.login);

router.get('/logout',verifyToken, authController.logout);

router.get('/profile',verifyToken,isLoggedIn, authController.profilePage);
router.post('/profile',verifyToken, isLoggedIn, upload.single('collegeIdImage'),authController.profile);

module.exports = router;