const User = require('../models/User');
const authServices = require('../services/authServices');

exports.signUpPage = (req, res) => res.render('signUp');

//Login page
exports.loginPage = (req, res) => res.render('login');

// Sign UP post
exports.signUp = async (req, res) => {
    try {
        const newUser = await authServices.createUser(req.body);
        const token = authServices.generateToken(newUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
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
            secure: true,
            sameSite: "none"
        });

        res.redirect('/');
    } catch (err){
        res.send(err.message);
    }
};

//logout
exports.logout = async (req, res) => {
    req.clearCookie("token");
    res.redirect('/');  
};

//profile page
exports.profilePage = async(req, res) => {
    const user = await User.findById(req.user?.userId);
    res.render('profile', {user});
} 

//update profile 
exports.profile = async (req, res) => {
    try {
        await authServices.updateProfile(
            req.user?.userId,
            req.body,
            req.file
        );
        res.redirect('/profile');
    } catch (err) {
        res.send("Profile update Error");
    }
};