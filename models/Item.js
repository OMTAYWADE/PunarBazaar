const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: String,
    price: String,
    desc: String,
    image: String,
    category: String,
    user: String,
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;