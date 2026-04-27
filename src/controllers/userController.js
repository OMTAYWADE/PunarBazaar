const Unlock = require('../models/Unlock');
const Item = require('../models/Item');
const userServices = require('../services/userServices');

exports.dashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const purchases = await Unlock.find({ user: userId, status: "paid" }).populate({ path: "item", populate: { path: "user", select: "name college phone" } });
        const sales = await Item.find({ user: userId }).sort({ createdAt: -1 });

        res.render('dashboard', { purchases, sales });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.rateSeller = async (req, res) => {
    try {
        const result = await userServices.rateSeller(req.user.userId, req.params.id, req.body);
        res.json(result);
        
    } catch (err) {
        res.json(err.message);
    }
};