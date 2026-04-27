const User = require('../models/User');
const authServices = require('../services/authServices');

// pages
exports.signUpPage = (req, res) => res.render('signUp');
exports.loginPage = (req, res) => res.render('login');

// Sign UP post
exports.signUp = async (req, res) => {
    try {

        const result = await authServices.createUser(req.body);
        if (!result.success) {
            return res.redirect('/login?error='+ encodeURIComponent(result.message));
        }
                console.log("STEP 1: User created");

        const token = authServices.generateToken(result.user);

                console.log("STEP 2: Token generated");

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });
                console.log("STEP 3: Cookie set");

        return res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/signup?error=Something went wrong');
    }
};

//Login post
exports.login = async (req, res) => {
    try {
        const result = await authServices.loginUser(req.body, req.ip);
        if (!result.success) {
            return res.status(400).json(result);
        }
        const { user, token } = result;
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });
        console.log("Login Sucessfull");
        return res.json({success: true, message: "Login SuccessFull"});
    } catch (err){
        res.status(500).json({ message: "Something went wrong" });
    }
};

//logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.redirect('/');  
};

//profile page
exports.profilePage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/login')
        }
        const user = await User.findById(req.user.userId);
        if (!user) return res.redirect('/login');

        const safeData = user.toObject();
        delete safeData.password
        res.render('profile', {user: safeData });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

//update profile 
exports.profile = async (req, res) => {
    try {
        if (!req.user) return res.json({ success: false, message: "Login required" });
        await authServices.updateProfile(
            req.user.userId,
            req.body,
            req.file
        );
        res.json({ success: true, message: "Profile updated" });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};