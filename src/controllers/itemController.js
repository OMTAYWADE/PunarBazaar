const Razorpay = require('razorpay');
const Item = require('../models/Item.js');
const Unlock = require('../models/Unlock.js');
const User = require('../models/User.js');

const itemServices = require('../services/itemServices.js');
// home page
exports.getAllItems = async (req, res) => {
    try {
    if (!req.user) {
    return res.redirect('/login');
}
    // remove expiry items
    const items = await itemServices.getAllItems(req.user?.userId);
    res.render('home', { items, success: req.query.signup === "success" });
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
        res.status(500).send(err.message);
    }
};

// delete items by his id
exports.deleteItems = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Login Required" });
}
        const result = await itemServices.deleteItems(req.user.userId, req.params.id);   
        if (!result.success) {
            return res.status(400).json(result);    
        }
        return res.json({ success: true, message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// searching with insentitive case
exports.searchItems = async (req, res) => {
    const q = req.query.q;

    const items = await Item.find({
        $text:{$search: q}
    }).populate("user")

    res.render('home', { items, success: req.query.signup === "success"});
};

//details
exports.getItemDetails = async (req, res) => {
    try {
        const result = await itemServices.getItemDetails(req.params.id, req.user.userId);

        if (!result.success) {
            return res.status(404).json({success: false, message: result.message});
        }
        const item =result.item;
        const recommended = result.recommended;

        const unlock = result.unlock;
        const isOwner = result.isOwner;

        res.render('details', { item, recommended, unlock, isOwner });
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
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

exports.featureItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (item.user.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 2);

        await Item.findByIdAndUpdate(req.params.id, {
            isFeatured: true,
            featuredUntil: expiry,
        });

        res.redirect('/');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDeal = async (req, res) => {
    try {
        const result = await itemServices.createDeal(req.params.id, req.user.userId);
        return res.json(result);
    } catch (err) {
        console.error("CREATE DEAL ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to start deal"
        });
    }
};

exports.markAsPaid = async (req, res) => {
    try {
        const result = await itemServices.markPaid(
            req.params.id,
            req.user.userId
        );

        return res.json(result);
        
    } catch (err) {
        console.error("MARK PAID ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to update payment"
        });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const result = await itemServices.confirmPayment(req.params.id, req.user.userId);

        return res.json(result);

    } catch (err) {
         console.error("CONFIRM ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to confirm deal"
        });
    }
};

exports.getItemsByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        const items = await itemServices.getItemsByCategory(category, req.user?.userId);
        res.render('home', { items, success: req.query.signup === "success"});
    } catch (err) {
        res.status(500).json(err.message);
    }
};
