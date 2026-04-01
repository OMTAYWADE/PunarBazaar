const jwt = require('jsonwebtoken');
exports.isLoggedIn = (req, res, next) => {
    if (!req.user || !req.user.userId) {
       return res.redirect('/login')
    }
    next();

};

exports.isLoggedOut = (req, res, next) => {
    if (req.user) {
        return res.redirect('/');
    }
    next();
}