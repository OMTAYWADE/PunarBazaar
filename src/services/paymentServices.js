const razorpay = require('../utils/razorpay');
const User = require('../models/User');
const Item = require('../models/Item');
const crypto = require('crypto');
const Unlock = require('../models/Unlock');

//create order
exports.createOrder = async (itemId, userId) => {
    const item = await Item.findById(itemId).populate("user");
    if (!item) throw new Error("Item not Found");

    let amount = 500;

    if (item.type === "note") {
        const user = await User.findById(userId);

        if (user.college !== item.user.college) {
            amount = 1000;
        }
    }  

    const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `unlock_${itemId}_${userId}_${Date.now()}`
    });

    //store mapping
    await Unlock.create({
        user: userId,
        item: itemId,
        orderId: order._id,
        status: "pending"
    });
    return order;
};

exports.verifyPayment = async (data, userId) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid Payment");
    }

    const unlock = await Unlock.findOne({
        orderId: razorpay_order_id,
        user: userId
    });
    if (!unlock) {
        throw new Error("Order not found");
    }

    if (unlock.status === "paid") {
        return true;
    }

    unlock.paymentId = razorpay_payment_id;
    unlock.status = "paid"
    await Unlock.save();
    return true;
};