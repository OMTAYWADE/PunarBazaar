const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: String,
    price: {
        type: Number,
        required: true,
        max: 200000
    },
    desc: String,
    image: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: String,
        required: true,
        default: "Other",
    },
    tags: [String],
    
    isFeatured: {
        type: Boolean,
        default: false,
    },
    
    featuredUntil: {
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
    },
    upiId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    }
});

itemSchema.index=({
    name: "text",
    desc: "text",
    category: "text",
    tags:"text",
})

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;