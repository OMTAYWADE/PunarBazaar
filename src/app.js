const express = require('express');
const app = express();
require('dotenv').config({ path: '../.env' });
const cors = require('cors');

//view engine
app.set('view engine', 'ejs');

const connectDB = require('./config/db');
connectDB().catch(err => {
    console.error("DB connection Failed", err);
    process.exit(1);
});

app.set('trust proxy', 1);

//cors 
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const allowed = [
            "http://localhost:8000",
            "https://punarbazaar.onrender.com",
        ];

        if (allowed.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin: ', origin);
            callback(null, false);
        }
    },
    credentials: true
}));    

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//token 
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
app.use(cookieParser());
app.use((req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        req.user = null;
        return next();
    }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch {
            req.user = null;
        }
    next();
});


//static
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

//global user
const User = require('./models/User');
app.use(async (req, res, next) => {
    try {
        if (req.user?.userId) {
            const user = await User.findById(req.user.userId).select('-password');
            res.locals.currentUser = user;
        } else {
            res.locals.currentUser = null;
        }
        next();
    } catch (err) {
        next();
    }
});

//method-override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//routes
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', itemRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({message: "Something went wrong"});
});

module.exports = app;