const User = require('../models/User');
const authServices = require('../services/authServices');

// Sign UP page
exports.signUpPage = (req, res) => res.render('signUp');

//Login page
exports.loginPage = (req, res) => res.render('login');

// Sign UP post
exports.signUp = async (req, res) => {
    try {
        const newUser = await authServices.createUser(req.body);
        req.session.userId = newUser._id
        res.redirect('/profile');
    } catch (err) {
        res.send(err.message);
    }
};

//Login post
exports.login = async (req, res) => {
    try {
        const user = await authServices.loginUser(req.body);
        req.session.userId = user._id;
        res.redirect('/');
    } catch (err){
        res.send(err.message);
    }
};

//logout
exports.logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

//profile page
exports.profilePage = async(req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('profile', {user});
} 

//update profile 
exports.profile = async (req, res) => {
    try {
        await authServices.updateProfile(
            req.session.userId,
            req.body,
            req, file
        );
        res.redirect('/profile');
    } catch (err) {
        res.send("Profile update Error");
    }
};