const razorpay = require('../utils/razorpay');
const User = require('../models/User');
const Item = require('../models/Item');
const crypto = require('crypto');
const Unlock = require('../models/Unlock');

//create order
exports.createOrder = async (itemId, userId) => {
    const item = await Item.findById(itemId).populate("user");

    let amount = 500;

    if (type === "note") {
        const user = await User.findById(userId);

        if (user.college !== item.user.college) {
            amount = 1000;
        }
    }  

    const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: "unlock_" + Date.now()
    });
    return order;
};

exports.verifyPayment = async (data, userId) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itemId } = data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body).digest("hex"); 

    if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid Payment");
    }

    await Unlock.create({
        user: userId,
        item: itemId,
        paymentId: razorpay_order_id,
        status: "paid"
    });
    return true;
}