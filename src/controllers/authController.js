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
            sameSite: "lax"
        });
        res.redirect('/profile');
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

//Login post
exports.login = async (req, res) => {
    try {
        const user = await authServices.loginUser(req.body);
        const token = authServices.generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
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
        res.render('profile', { user });
    } catch (err) {
        res.status(500).send("Error loading profile");
    }
};

//update profile 
exports.profile = async (req, res) => {
    try {
        await authServices.updateProfile(
            req.user?.userId,
            req.body,
            req.file
        );
        res.redirect('/addItems');
    } catch (err) {
        res.status(500).send("Profile update error");
    }
};