const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

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
        return { success: false, message: "Please fill all the required fields" };
}
    
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return { success: false, message: "Email already registered" };
    }

    if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters" };
    }

    const hashed = await bcrypt.hash(password, 12);
    
    const user = await User.create({
        name,
        password: hashed,
        email: normalizedEmail, phone, role: "user"
    });
    return { success: true, user };
};

exports.loginUser = async ({ email, password }, ip) => {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) return { success: false, message: "User not Found"}

    const attemptKey = `login:attempts:${email}`;
    const blockKey = `login:block:${email}`;
    const ipKey = `login:ip:${ip}`;

    const isBlocked = await redisClient.get(blockKey);
    if (isBlocked) return { success: false, message: "Account blocked. Try again tomorrow" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const attempts = await redisClient.incr(attemptKey);

        if (attempts === 1) {
            await redisClient.expire(attemptKey, 60 * 60 * 24);
        }

        if (attempts >= 5) {
            await redisClient.setEx(blockKey, 60 * 60 * 24, "blocked");
            return { success: false, message: `Invalid credentials. Attempts left: ${5 - attempts}` };
        }
        return { success: false, message: "Account blocked due to multiple failed attempts. Try tomorrow." };
    }
    await redisClient.del(attemptKey);

    user = user.toObject();
    delete user.password;

    const token = this.generateToken(user);

    return {success: true, user: {id: user._id, email: user.email}, token};
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