const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; //{userId}
        next();
    } catch (err) {
        return res.redirect('/login');
    }
}
exports.isLoggedIn = (req, res, next) => {
    if (!req.user || !req.user.userId) {
        return res.redirect('/login');
    }
    next();

};

exports.isLoggedOut = (req, res, next) => {
    if (req.user && req.user.userId) {
        return res.redirect('/');
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    
}