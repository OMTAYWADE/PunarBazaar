const mongoose = require('mongoose');

const bookOrderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "ready", "completed"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('BookOrder', bookOrderSchema);