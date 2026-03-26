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

    await User.create({
        name,
        password: hashed,
        email, contact
    });
    res.redirect('/profile');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.send("User Not Found");

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Wrong Password");
    req.session.userId = user._id;
    res.redirect('/add');
};

exports.logout = async (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

exports.profilePage = async(req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('profile', {user});
} 

exports.profile = async (req, res) => {
    const { phone, college, branch, division, year } = req.body;

    await User.findByIdAndUpdate(req.session.userId, {
        phone, college, branch, division, year
    });
    let updateData = { phone, college, branch, division, year };

    if (req.file) {
        updateData.collegeIdImage = "/uploads/" + req.file.filename;
        updateData.verificationStatus = "pending";
    }
    await User.findByIdAndUpdate(req.session.userId, updateData);
    res.redirect('/login');
};