const express = require('express');
const app = express();
require('dotenv').config();

// session
const session = require('express-session');
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

//user available in all views
const User = require('./models/User');
app.use(async (req, res, next) => {
    try{
    if (req.session.userId) {
        res.locals.currentUser = await User.findById(req.session.userId);
    } else {
        res.locals.currentUser = null;
    }
    next();
}
    catch (err) {
        next();
}
});

//mongoDb
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));  
app.use('/uploads', express.static('public/uploads'));
app.use(express.json());

// routes varibles
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', itemRoutes);
app.use('/', authRoutes);

//error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong")
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});