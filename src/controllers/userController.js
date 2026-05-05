const Unlock = require('../models/Unlock');
const Item = require('../models/Item');
const userServices = require('../services/userServices');
const BookOrder = require('../models/BookOrder');

exports.dashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const purchases = await Unlock.find({ user: userId, status: "paid" }).populate({ path: "item", populate: { path: "user", select: "name college phone" } });
        const sales = await Item.find({ user: userId }).sort({ createdAt: -1 });

        const bookOrders = await BookOrder.find({ seller: userId }).populate("buyer").populate("book");

        res.render('dashboard', { purchases, sales, bookOrders });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.rateSeller = async (req, res) => {
    try {
        const { rating } = req.body;
        const result = await userServices.rateSeller(req.user.userId, req.params.id, rating);
        res.json(result);
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};