const Razorpay = require('razorpay');
const Item = require('../models/Item.js');
const Unlock = require('../models/Unlock.js');
const User = require('../models/User.js');

const itemServices = require('../services/itemServices.js');
const paymentServices = require('../services/paymentServices');

// home page
exports.getAllItems = async (req, res) => {
    try {
    if (!req.user) {
    return res.redirect('/login');
}
    // remove expiry items
    const items = await itemServices.getAllItems(req.user?.userId);
    res.render('home', { items });
} catch (err) {
    res.send(err.message);
}
    
};

// add items page route
exports.addItemPage = (req, res) => {
   try{
       res.render('addItems');
   } catch (err) {
       console.log(err);
       res.send(err.message);
   }
};


// create item using input box
exports.createItem = async (req, res) => {
    try {
    if (!req.user) {
    return res.redirect('/login');
    }
        const result = await itemServices.createItem(req.body, req.user?.userId, req.file);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.redirect("/");
    } catch (err) {
    }
    res.send(err.message);
};

// delete items by his id
exports.deleteItems = async (req, res) => {
    try {
        if (!req.user) {
    return res.redirect('/login');
}
        const result = await itemServices.deleteItems(req.user?.userId, req.params.id);   
        if (!result.success) {
            return res.status(400).json(result);    
        }
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
        const result = await itemServices.getItemDetails(req.params.id);

        if(!result.success)
        let isUnlocked = false;
        let isOwner = false;

        if (req.user?.userId) {
            const unlock = await Unlock.findOne({
                user: req.user?.userId,
                item: item._id,
                status:"paid"
            });

            if(unlock){
                isUnlocked = true;

            }

            if (item.user._id.toString() === req.user.userId.toString()) {
                isOwner = true;
            }
        }

        res.render('details', { item, recommended, isUnlocked,isOwner,  razorpayKey: process.env.RAZORPAY_KEY });
    } catch (err) {
        res.send(err.message);
    } 
};

exports.getSearchItems = async (req, res, next) => {
    
    try{
        const result = await itemServices.getItemsBySearch(req.query);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

//wishList
exports.addToWishList = async (req, res) => {
    try {
        if (!req.user) {
    return res.redirect('/login');
}
        await itemServices.addToWishList(req.user?.userId, req.params.id);

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
    if (!req.user) return res.redirect('/login');

    const item = await Item.findById(req.params.id);

    if (item.user.toString() !== req.user?.userId) {
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
          console.log("Create Order req.body: ", req.body);
        console.log("TOKEN USER:", req.user);
        console.log("ITEM ID:", req.params.id);
        
       if (!req.user) return res.status(401).json({ error: "Login required" });

          const order = await paymentServices.createOrder(req.params.id, req.user.userId);
                if (!order || !order.id) {
            return res.status(500).json({ error: "Order not created" }); // ✅ STOP HERE
        }
        console.log('Order checking: ', order);

        res.json(order);
      } catch (err) {
           console.log("🔥 FULL ERROR:", err); 
        res.status(500).json({error: err.message});
    }
};

//verify payment
exports.verifyPayment = async (req, res) => {
    try {

        console.log("VERIFY BODY:", req.body);
        
        let success = await paymentServices.verifyPayment(req.body, req.user?.userId, req.body.itemId);
        res.json({ success });
    } catch (err) {
        console.log('"Verify Error: ', err);
        res.json({ success: false });
    }
};