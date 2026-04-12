const User = require('../models/User');
const authServices = require('../services/authServices');

// pages
exports.signUpPage = (req, res) => res.render('signUp');
exports.loginPage = (req, res) => res.render('login');

// Sign UP post
exports.signUp = async (req, res) => {
    try {

        const newUser = await authServices.createUser(req.body);
        const token = authServices.generateToken(newUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });
        res.redirect('/profile');
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

//Login post
exports.login = async (req, res) => {
    try {
        const{ user, token} = await authServices.loginUser(req.body, req.ip);
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        res.redirect('/');
    } catch (err){
        res.status(400).json({ message: err.message });
    }
};

//logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.redirect('/');  
};

//profile page
exports.profilePage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/login');
        }
        const user = await User.findById(req.user.userId);
        if (!user) return res.redirect('/login');

        const safeData = user.toObject();
        delete safeData.password
        res.render('profile', {user: safeData });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

//update profile 
exports.profile = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login');
        await authServices.updateProfile(
            req.user.userId,
            req.body,
            req.file
        );
        res.redirect('/');
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};