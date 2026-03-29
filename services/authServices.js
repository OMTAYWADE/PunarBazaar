const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createUser = async (data) => {
    const { email, password, phone, name } = data;
    
    if (!email || !password) throw new Error("Missing fields");
    
    const existingUser = await User.findOne({ email });
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
    if (!user) return res.send("User Not Found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Wrong Password");
    return user;
};

exports.updateProfile = async (userId,data, file) => {
    let updateData = { ...data };
     if (file) {
        updateData.collegeIdImage = "/uploads/" + req.file.filename;
        updateData.verificationStatus = "pending";
    }
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};