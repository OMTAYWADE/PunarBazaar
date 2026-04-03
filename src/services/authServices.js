const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.createUser = async (data) => {
    const { email, password, phone, name } = data;

    if (!email || !password || !name) {
    throw new Error("Required fields missing");
}
    
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) throw new Error("Email Already Exsit");
    const hashed = await bcrypt.hash(password, 10);

    return await User.create({
        name,
        password: hashed,
        email, phone
    });
};

exports.loginUser = async ({ email, password }) => {
    let user = await User.findOne({ email });
    if (!user) throw new Error("User Not Found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Wrong Password");

    return user;
};

exports.updateProfile = async (userId,data, file) => {
    const allowedField = ["name", "phone"];
    let updateData = {};

    allowedField.forEach(field => {
        if (data[field]) updateData[field] = data[field];
    });
    if (file) {
        updateData.collegeIdImage = file.path;
        updateData.verificationStatus = "pending";
    }   
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};