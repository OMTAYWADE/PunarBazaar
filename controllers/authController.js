const User = require('../models/User');
const bcrypt = require('bcrypt');
const Item = require('../models/Item');

// Sign UP
exports.signUpPage = (req, res) => {
    res.render('signUp');
};

//Login
exports.loginPage = (req, res) => {
    res.render('login');
};

exports.signUp = async (req, res) => {
    const { name, password, email, contact } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        password: hashed,
        email, contact
    });
    res.session.userId = newUser._id
    res.redirect('/profile');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.send("User Not Found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Wrong Password");
    req.session.userId = user._id;
    res.redirect('/');
};

exports.logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.profilePage = async(req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('profile', {user});
} 

exports.profile = async (req, res) => {
    let updateData = { phone, college, branch, division, year };

    if (req.file) {
        updateData.collegeIdImage = "/uploads/" + req.file.filename;
        updateData.verificationStatus = "pending";
    }
    await User.findByIdAndUpdate(req.session.userId, updateData);
    res.redirect('/profile');
};