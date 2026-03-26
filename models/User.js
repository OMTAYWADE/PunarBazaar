const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: {
        type: String,
        unique: true,
    },
    phone: String,
    college: String,
    branch: String,
    year: String,
    division: String,

    isVerified: {
        type: Boolean,
        default: false
    },

    trustScore: {
        type: Number,
        default: 50,
    },
    collegeIdImage: String,
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);