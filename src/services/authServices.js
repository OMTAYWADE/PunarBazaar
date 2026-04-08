const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
    return jwt.sign(
        { userId: user._id},
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

    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const hashed = await bcrypt.hash(password, 12);
    
    return await User.create({
        name,
        password: hashed,
        email: normalizedEmail, phone, role: "user"
    });
};

exports.loginUser = async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) throw new Error("User Not Found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Wrong Password");

    user = user.toObject();
    delete user.password;

    const token = this.generateToken(user);

    return {user, token};
};

exports.updateProfile = async (userId,data, file) => {
    const allowedField = ["name", "phone", "college", "branch", "year", "division"];
    let updateData = {};

    allowedField.forEach(field => {
        if (data[field] !== undefined) {updateData[field] = data[field];}
    });
    if (file?.path) {
        updateData.collegeIdImage = file.path; 
        updateData.verificationStatus = "pending";
    }   
    return await User.findByIdAndUpdate(userId, updateData, { new: true});
};