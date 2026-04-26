const express = require('express');
const router = express.Router();

//controllers
const itemControllers = require('../controllers/itemController');
const userController = require('../controllers/userController');
const upload = require('../utils/upload');

//middleware
const { isLoggedIn, verifyToken } = require('../middleware/authMiddleware');
const { isProfileComplete } = require('../middleware/profileComplete');
const {checkPendingPayment}  = require('../middleware/paymentPending');
const {validateObjectId} = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

//public
router.get('/', itemControllers.getAllItems);
router.get('/search',apiLimiter, itemControllers.searchItems);
router.get('/item/:id', apiLimiter, validateObjectId, itemControllers.getItemDetails);

//protected
router.get('/addItems',verifyToken, isLoggedIn,isProfileComplete, itemControllers.addItemPage);
router.post('/addItems',apiLimiter,verifyToken, isLoggedIn, isProfileComplete,checkPendingPayment, upload.single('image'), itemControllers.createItem);

router.delete('/item/:id',verifyToken,isLoggedIn, validateObjectId, itemControllers.deleteItems);

router.get('/feature/:id',verifyToken, isLoggedIn,validateObjectId, itemControllers.featureItem);
router.post('/createOrder/:id',verifyToken, isLoggedIn,validateObjectId, itemControllers.createOrder);

router.post('/verifyPayment',verifyToken, isLoggedIn, itemControllers.verifyPayment);

router.post('/markPaid/:id', verifyToken, isLoggedIn, itemControllers.markAsPaid);
router.post('/confirmPayment/:id', verifyToken, isLoggedIn, itemControllers.confirmPayment);

router.get('/category/:category', itemControllers.getItemsByCategory);

router.get('/dashboard', verifyToken, isLoggedIn, userController.dashboard);

module.exports = router;