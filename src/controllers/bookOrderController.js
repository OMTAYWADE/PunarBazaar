const bookOrderServices = require('../services/bookOrderServices');

exports.createBookOrder = async (req, res) => {
    const result = await bookOrderServices.createBookOrder( req.params.id,req.user._id, req.body.quantity || 1);
    res.json(result);
};

exports.markReady = async (req, res) => {
    const result = await bookOrderServices.markReady(req.params.id);
    res.json(result);
};