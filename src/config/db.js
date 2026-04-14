const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
        console.log("DB NAME:", conn.connection.name); // ✅ CORRECT

    } catch (err) {
        console.error("DB ERROR:", err);
        process.exit(1);
    }
};

module.exports = connectDB;