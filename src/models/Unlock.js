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
    orderId: {
        type:String,
        required: true
    },
    paymentId: String,
    status: {
        type: String,
        default: "pending",
    },
}, { timestamps: true });

module.exports = mongoose.model("Unlock", unlockSchema);