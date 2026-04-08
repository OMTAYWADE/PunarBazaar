const express = require('express');
const router = express.Router();

//controllers
const itemControllers = require('../controllers/itemController');
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
// router.get('/category/:name', itemControllers.getByCategory);

router.get('/feature/:id',verifyToken, isLoggedIn,validateObjectId, itemControllers.featureItem);
router.post('/unlock/:id',verifyToken, isLoggedIn,validateObjectId, itemControllers.createOrder);

router.post('/verifyPayment',verifyToken, isLoggedIn, itemControllers.verifyPayment);

module.exports = router;