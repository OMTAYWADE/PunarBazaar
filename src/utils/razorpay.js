const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error('Razorpay keys are missing in environment variables');
    
}
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

module.exports = instance;