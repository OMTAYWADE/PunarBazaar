const mongoose = require('mongoose');

const connectdb = mongoose.connect("process.env.MONGODB_URL")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

module.exports = connectdb;