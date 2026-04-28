const bookOrderServices = require('../services/bookOrderServices');

exports.createBookOrder = async (req, res) => {
    const result = await bookOrderServices.createBookOrder(req.user._id, req.params.id, req.body.quantity || 1);
    res.jsom(result);
};

exports.markReady = async (req, res) => {
    const result = await bookOrderServices.markReady(req.param.id);
    res.json(result);
};