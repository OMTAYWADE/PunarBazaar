const User = require('../models/User');

exports.checkPendingPayment = async (req, res, next) => {
    const user = await User.findById(req.session.userId);

    if (user.pendingPayment > 0) {
        return res.send("clean your pending payment first");
    }
    next();
}