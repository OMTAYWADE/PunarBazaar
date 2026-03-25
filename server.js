const express = require('express');
const app = express();

const path = require('path');
const Item = require('./models/Item');
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));  

//home
app.get("/", async (req, res) => {
    const items = await Item.find().sort({ createdAt: -1 });
    res.render("index", { items });
});

//add page
app.get("/add", (req, res) => {
    res.render("add");
});

// add items
app.post("/add", async (req, res) => {
    const { name, price, desc } = req.body;

    await Item.create({ name, price, desc });

    res.redirect("/");
});

//delete items
app.get("/delete/:id", async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

//search
app.get("/search", async (req, res) => {
    const q = req.query.q;

    if(!q){
        return res.redirect("/");
    }

    const items = await Item.find({
        name: { $regex: q, $options: "i" }
    });

    res.render("index", { items });
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});