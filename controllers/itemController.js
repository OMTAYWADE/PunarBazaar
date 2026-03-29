const Item = require('../models/Item.js');
const User = require('../models/User.js');

// home page
exports.getAllItems = async (req, res) => {
    let items;
    if (req.session.userId) {
        const user = await User.findById(req.session.userId);

        const sameCollege = await Item.find().populate("user").sort({ createdAt: -1 });

        const filteredSame = sameCollege.filter(item =>
            item.user?.college === user.college
            
        );

        const others = sameCollege.filter(item =>
            item.user?.college !== user.college
        )
        items = [...filteredSame, ...others];
    }
    // remove expiry items
    await Item.updateMany(
        { featuredUntill: { $lt: new Date() } },
        { isFeatured: false }
    );

    items = await Item.find().populate("user").sort({ isFeatured: -1, createdAt: -1 });
    res.render('home', { items });
    
   
};

// add items page route
exports.addItemPage = (req, res) => {
    res.render('addItems');
};



// create item using input box
exports.createItem = async (req, res) => {
    const { name, price, desc, category } = req.body;
    let image = req.file ? '/uploads/' + req.file.filename : "";

    if (category === "Notes") {
        if (price > 10) {
            return res.send("Notes price must be 10 rupess or below");
        }
    }

    await Item.create({
        name, price, category, desc, image, user: req.session.userId,
    })

    res.redirect("/");
};

// delete items by his id
exports.deleteItems = async (req, res) => {
    const item = await Item.findById(req.params.id);

    //check ownership
    if (item.user != req.session.userId) {
        return res.redirect("Not authorised");
    }
    await Item.findByIdAndDelete(req.params.id);   
    res.redirect('/');
};

// searching with insentitive case
exports.searchItems = async (req, res) => {
    const q = req.query.q;

    const items = await Item.find({
        name: { $regex: q, $options: "i" }
    }).populate("user")

    res.render('home', { items });
};

exports.getItemDetails = async(req, res) => {
    const item = await Item.findById(req.params.id).populate("user");
    console.log("Item ID:", req.params.id);
console.log("Item:", item);
    if (!item) return res.send("Item Not found");
    
    const user = await User.findById(req.session.userId);

    const recommended = await Item.find({
        category: item.category,
        _id: { $ne: item._id },
    }).limit(4).populate("user");

    const Unlock = require('../models/Unlock.js');
    const unlock = await Unlock.findOne({
        user: req.session.userId,
        item: item._id,
        status: "paid"
    });

    // notes for same college for free and paid for others
    const isSameCollege = user?.college === item.user?.college;
    let isUnlocked = false
    
    //for different college restriction
    if ((item.type === "note" || item.type === "book") && item.user.college !== user.college) {
        return res.send("Only Same college stuents can access this");
    }


    if (item.type === "note") {
        if (isSameCollege) {
            isUnlocked = true;
        } else {
            const unlock = await Unlock.findOne({
                user: req.session.userId,
                item: item._id,
                status: "paid"
            });

            isUnlocked = !!unlock;
        }
    }

    res.render("details", { item, recommended , isUnlocked, razorpayKey: process.env.RAZORPAY_KEY});
};

exports.getByCategory = async (req, res) => {
    const category = req.params.name;

    const items = await Item.find({ category }).populate("user").sort({ createdAt: -1 });
    res.render('home', { items });
}

exports.addToWishList = async (req, res) => {
    const user = await User.findById(req.session.userId);

    // avoid duplicate
    if (!user.wishList.includes(req.params.id)) {
        user.wishList.push(req.params.id);
        await user.save();
    }

    res.redirect("back");
}

exports.getWishList = async (req, res) => {
    const user = await User.findById(req.session.userId).populate({
        path: "wishList",
        populate: { path: "user" }

    });
    res.render('wishList', { items: user.wishList });
};

exports.featureItem = async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (item.user != req.session.userId) {
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
const razorpay = require('../utils/razorpay.js');
exports.createOrder = async (req, res) => {
    const item = await Item.findById(req.params.itemId);
    const options = {
        amount: 500, // 5 rupess(in paise)
        currency: "INR",
        receipt: "unlock_" + Date.now()
    };

    if (item.type === "note") {
        const user = await User.findById(req.session.userId);

        if (user.college !== item.user.college) {
            options.amount = 1000;
        }
    }

    const order = await razorpay.orders.create(options);

    res.json(order);
}

//verify payment
const crypto = require('crypto');
const Unlock = require('../models/Unlock.js');

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, itemId, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")
    
    if (expectedSignature === razorpay_signature) {
            
        await Unlock.create({
            user: req.session.userId,
            item: itemId,
            paymentId: razorpay_payment_id,
            status: "paid",
        });
        return res.json({ success: true });
    }
    res.json({ success: false });
}
