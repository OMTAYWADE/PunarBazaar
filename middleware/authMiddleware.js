exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {

        // if API request
        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            return res.status(401).json({ error: "Not logged in" });
        }

        // normal page
        console.log('User Session: ', req.session.userId);
        
        return res.redirect('/login');
    }

    next();
};

exports.isLoggedOut = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
}