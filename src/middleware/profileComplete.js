const User = require('../models/User');

exports.isProfileComplete = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.redirect('/login');
        }
        const user = await User.findById(req.user.userId);
        if (!user) return res.redirect('/login');

        const requiredFields = ["phone", "college", "branch", "year"];
        const isComplete = requiredFields.every(field => user[field]);
    
        if (!isComplete) {
            return res.redirect('/profile');
        }
        next();
    } catch (err) {
        return res.status(500).send("Error checking profile");
    }
};