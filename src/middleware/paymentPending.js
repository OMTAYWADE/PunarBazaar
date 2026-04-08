const User = require('../models/User');

exports.checkPendingPayment = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const user = await User.findById(req.user.userId);
        if (!user) res.status(404).json({ message: "User not Found" });

        if ((user.pendingPayment || 0) > 0) {
            return res.status(403).json({ message: "Please clean your pending platform changes to continue" });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ message: "Error checking payment Status" });
    }
};