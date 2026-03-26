const express = require('express');
const router = express.Router();

//controllers
const itemControllers = require('../controllers/itemController');
const upload = require('../utils/upload');

//middleware
const { isLoggedIn } = require('../middleware/authMiddleware');
const { isProfileComplete } = require('../middleware/profileComplete');
const { checkPendingPayment } = require('../middleware/paymentPending');

router.get('/', itemControllers.getAllItems);
router.get('/addItems',isLoggedIn,isProfileComplete, checkPendingPayment, itemControllers.addItemPage);
router.post('/addItems',isLoggedIn, isProfileComplete,checkPendingPayment, upload.single('image'), itemControllers.createItem);
router.get('/delete/:id',isLoggedIn, itemControllers.deleteItems);
router.get('/search', itemControllers.searchItems);
router.get('/item/:id', itemControllers.getItemDetails);
router.get('/category/:name', itemControllers.getByCategory);


router.get('/wishList/add/:id', isLoggedIn, itemControllers.addToWishList);
router.get('/wishList', isLoggedIn, itemControllers.getWishList);

router.get('/feature/:id', isLoggedIn, itemControllers.featureItem);

router.get('/unlock/:ItemId', isLoggedIn, itemControllers.createOrder);
router.post('/verifyPayment', isLoggedIn, itemControllers.verifyPayment);

module.exports = router;