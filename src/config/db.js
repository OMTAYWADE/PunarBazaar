const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("MONGO_URI:", process.env.MONGO_URI);
        const conn = await mongoose.connect("mongodb+srv://Anonymous_market:Trust_Build@cluster0.5evh6y7.mongodb.net/?appName=punarbazaar");

        console.log("✅ MongoDB Connected");
        console.log("DB NAME:", conn.connection.name); // ✅ CORRECT

    } catch (err) {
        console.error("DB ERROR:", err);
        process.exit(1);
    }
};

module.exports = connectDB;