const express = require('express');
const router = express.Router();

//controllers
const itemControllers = require('../../controllers/itemController');
const upload = require('../../utils/upload');

//middleware
const { isLoggedIn } = require('../../middleware/authMiddleware');
const { isProfileComplete } = require('../../middleware/profileComplete');
const {checkPendingPayment}  = require('../../middleware/paymentPending');
const {validateObject} = require('../../middleware/validateObject');

router.get('/', itemControllers.getAllItems);
router.get('/addItems',isLoggedIn,isProfileComplete, checkPendingPayment, itemControllers.addItemPage);
router.post('/addItems',isLoggedIn, isProfileComplete,checkPendingPayment, upload.single('image'), itemControllers.createItem);
router.get('/delete/:id',isLoggedIn, itemControllers.deleteItems);
router.get('/search', itemControllers.searchItems);
router.get('/item/:id', itemControllers.getItemDetails);
// router.get('/category/:name', itemControllers.getByCategory);


router.get('/wishlist/add/:id', isLoggedIn,validateObject, itemControllers.addToWishList);
router.get('/wishlist', isLoggedIn, itemControllers.getWishList);

router.get('/feature/:id', isLoggedIn, itemControllers.featureItem);

router.get('/unlock/:id', isLoggedIn, itemControllers.createOrder);
router.post('/verifyPayment', isLoggedIn, itemControllers.verifyPayment);
console.log("validateObject:", validateObject);
console.log("checkPendingPayment:", checkPendingPayment);
console.log("getAllItems:", itemControllers.getAllItems);

module.exports = router;