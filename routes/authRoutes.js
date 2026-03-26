const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { route } = require('./itemRoutes');

//middleware
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/signUp', authController.signUpPage);
router.post('/signUp', authController.signUp);

router.get('/login', authController.loginPage);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/profile',isLoggedIn, authController.profilePage);
router.post('/profile', isLoggedIn, authController.profile);

module.exports = router;