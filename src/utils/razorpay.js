const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error('Razorpay keys are missing in environment variables');
    
}
const instance = new Razorpay({
    key_id: "rzp_test_SVtLWAFVv9iBtk",
    key_secret: "xYO2sfdTqg5DNwPqrwFvOCjy"
});
console.log("KEY:", process.env.RAZORPAY_KEY);
console.log("SECRET:", process.env.RAZORPAY_SECRET);

module.exports = instance;