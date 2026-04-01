const User = require('../models/User');

exports.isProfileComplete = async (req, res, next) => {
    const user = await User.findById(req.session.userId);
    
    if (!user.phone || !user.college || !user.branch || !user.year) {
        return res.redirect('/profile');
    }
    next();
}