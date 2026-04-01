const jwt = require('jsonwebtoken');
exports.isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.redirect('/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/login')
    }

};

exports.isLoggedOut = (req, res, next) => {
    if (req.user.userId) {
        return res.redirect('/');
    }
    next();
}