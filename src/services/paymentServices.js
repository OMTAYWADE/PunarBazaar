const razorpay = require('../utils/razorpay');
const User = require('../models/User');
const Item = require('../models/Item');
const crypto = require('crypto');
const Unlock = require('../models/Unlock');

//create order
exports.createOrder = async (itemId, userId) => {
    const item = await Item.findById(itemId).populate("user");
    if (!item) throw new Error("Item not Found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not Found");
    
    //check payment is already done or not

    const existing = await Unlock.findOne({
        user: userId,
        item: itemId,
        status: "paid"
    });

    if (existing) {
        throw new Error("Item already Purchased");
    }

    let amount = 500;

    if (item.category === "Notes") {
        if (user.college !== item.user.college) {
            amount = 1000;
        }
    }
    console.log("FINAL AMOUNT:", amount);
    let order;

    try {
        order = await razorpay.orders.create({
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `unlock_${itemId}_${userId}_${Date.now()}`
        });
        console.log("CREATING ORDER WITH:", amount * 100);
        
    } catch (err) {
        console.log("Razorpat order is not created", err);
        throw new Error("Razorpay order creation failed");
    }
    //store mapping
    await Unlock.create({
        user: userId,
        item: itemId,
        orderId: order.id,
        status: "pending"
    });
    return order;
};

exports.verifyPayment = async (data, userId, itemId) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return false;
    }
    console.log("FINDING:", razorpay_order_id, userId);

    const unlock = await Unlock.findOne({
        orderId: razorpay_order_id,
        user: userId,
        item: itemId,   
    });
    if (!unlock) {
        return false;
    }
    
    if (unlock.status === "paid") {
        return true;
    }

    unlock.paymentId = razorpay_payment_id;
    unlock.status = "paid"
    await unlock.save();
    return true;
};