const mongoose = require('mongoose');

exports.validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.send("Invalid ID");
    }
    next();
};

exports.validateSignUp = (req, res, next) => {
    const { email, password, phone, name } = req.body;
    
    if (!email || !password || !phone || !name) {
        return res.status(400).json({ message: "All field are incomplete" });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ message: "Invalid email" });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{6,}$/;

    if (!strongPassword.test(password)) {
        return res.status(400).json({ message: "password must contain uppercase, lowercase, number & specialCharacter" });
    }
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "All field are incomplete" });
    }
    next();
};