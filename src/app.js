const express = require('express');
const app = express();
require('dotenv').config();

const connectDB = require('./config/db');
console.log(connectDB);
connectDB();

const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const cookieParser = require('cookie-parser');

app.use(cookieParser());

//static
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

//view engine
app.set('view engine', 'ejs');

//global user
const User = require('../src/models/User');
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            res.locals.currentUser = await User.findById(req.session.userId);
        } else {
            res.locals.currentUser = null;
        }
        next();
    } catch (err) {
        next();
    }
});

//routes
const itemRoutes = require('../src/routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', itemRoutes);
app.use('/', authRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong");
});

module.exports = app;