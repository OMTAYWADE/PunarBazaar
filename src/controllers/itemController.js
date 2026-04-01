const Razorpay = require('razorpay');
const Item = require('../models/Item.js');
const Unlock = require('../models/Unlock.js');
const User = require('../models/User.js');

const itemServices = require('../services/itemServices.js');
const paymentServices = require('../services/paymentServices');

// home page
exports.getAllItems = async (req, res) => {
try{
    // remove expiry items
    const items = await itemServices.getAllItems(req.user?.userId);
    res.render('home', { items });
} catch (err) {
    res.send(err.message);
}
    
};

// add items page route
exports.addItemPage = (req, res) => {
    res.render('addItems');
};


// create item using input box
exports.createItem = async (req, res) => {
    try {
    
        await itemServices.createItem(req.body, req.user?.userId, req.file);
        console.log("USER:", req.user);
        res.redirect("/");
    } catch (err) {
        res.send(err.message);
    }
};

// delete items by his id
exports.deleteItems = async (req, res) => {
    try {
        await itemServices.deleteItems(req.user?.userId, req.params.id);   
        res.redirect('/'); 
    } catch (err) {
        res.send(err.message);
    }
};

// searching with insentitive case
exports.searchItems = async (req, res) => {
    const q = req.query.q;

    const items = await Item.find({
        $text:{$search: q}
    }).populate("user")

    res.render('home', { items });
};

//details
exports.getItemDetails = async (req, res) => {
    try {
        const { item, recommended } = await itemServices.getItemDetails(req.params.id);
        let isUnlocked = false;

        if (req.user?.userId) {
            const unlock = await Unlock.findOne({
                user: req.user?.userId,
                item: req.params.id
            });

            if(unlock) isUnlocked = true
        }

        res.render('details', { item, recommended, isUnlocked,  razorpayKey: process.env.RAZORPAY_KEY });
    } catch (err) {
        res.send(err.message);
    } 
};

//wishList
exports.addToWishList = async (req, res) => {
    try {
        await itemServices.addToWishList(  req.user?.userId, req.params.id,)

        res.redirect("back");
    } catch (err) {
        res.send("Error adding to wishList");
    }
}

//get wishList
exports.getWishList = async (req, res) => {
    const user = await User.findById(req.user?.userId).populate({
        path: "wishList",
        populate: { path: "user" }

    });
    res.render('wishList', { items: user.wishList });
};

exports.featureItem = async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (item.user != req.user?.userId) {
        res.send("Not Authorized");
    }
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 2);

    await Item.findByIdAndUpdate(req.params.id, {
        isFeatured: true,
        featuredUntil: expiry,
    });

    res.redirect("/");
}   
// create razor pay order
exports.createOrder = async (req, res) => {
    try {
        const order = await paymentServices.createOrder(req.params.id, req.user?.userId);
        res.json(order);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

//verify payment
exports.verifyPayment = async (req, res) => {
    try {
        let success = await paymentServices.verifyPayment(req.body, req.user?.userId);
        res.json({ success });
    } catch (err) {
        res.json({ success: false });
    }
};
