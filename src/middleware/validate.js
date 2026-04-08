const mongoose = require('mongoose');


exports.validateObjectId = (req, res, next) => {
    const id = req.params.id || req.params.itemId || req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: "Invalid ID"});
    }
    next();
};

exports.validateSignUp = (req, res, next) => {
    let { email, password, phone, name } = req.body;
    email = email?.trim();
    name = name?.trim();
    
    if (!email || !password || !phone || !name) {
        return res.status(400).json({ message: "All field are incomplete" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    
    if (!strongPassword.test(password)) {
        return res.status(400).json({ message: "password must contain uppercase, lowercase, number & specialCharacter" });
    }
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are requried" });
    }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
    next();
};