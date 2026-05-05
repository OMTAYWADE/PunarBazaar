const mongoose = require('mongoose');

const unlockSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    paymentId: String,
    status: {
        type: String,
        enum: ["pending", "paid", "confirmed", "rejected"],
        default: "pending",
    },
    buyerRated: {type: Boolean, default: false}
}, { timestamps: true });

module.exports = mongoose.model("Unlock", unlockSchema);