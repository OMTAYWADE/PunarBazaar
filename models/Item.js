const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: String,
    price: String,
    desc: String,
    image: String,
    category: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        required: true,
        default: "Other",
    },
    
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],

    ifFeatured: {
        type: Boolean,
        default: false,
    },
    
    featuredUntill: {
        type: Date,
        default: null
    },

    isFree: {
        type: Boolean,
        default: false
    },

    type: {
        type: String,
        enum: ["note", "book", "product"],
        default: "product"
    }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;