const Item = require('../models/Item.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');

const redisClient = require('../config/redis.js');
const Unlock = require('../models/Unlock.js');

exports.getAllItems = async (userId) => {
    await Item.updateMany(
        { featuredUntil: { $lt: new Date() } },
        { isFeatured: false }
    );

    let purchasedIds = [];

    
    if (userId) {
        const unlocks = await Unlock.find({
            user: userId,
            status: "confirmed"
        });
        
        purchasedIds = unlocks.map(u => u.item.toString());
    }

    let items = await Item.find({_id: { $nin: purchasedIds}, status: {$ne: "sold"}}).limit(20).sort({ isFeatured: -1, createdAt: -1 }).populate("user", "name college");

    if (!userId) return items;

    const user = await User.findById(userId);

    const same = items.filter(i => i.user?.college === user.college);
    const other = items.filter(i => i.user?.college !== user.college);

    return [...same, ...other];
};

exports.createItem = async (data, userId, file) => {
    const { name, price, desc, category, upiId } = data;
    if (!name || !price || !upiId) {
        return {success: false, message: "Please fill all required fields"};
    }
  const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
        return { success: false, message: "Invalid price format" };
    }

    if (numericPrice <= 0 || numericPrice > 2000) {
        return { success: false, message: "Price must be between ₹1 and ₹2000" };
    }
const categoryMap = {
    "Notes": "note",
    "Books": "book",
    "Electronics": "electronics",
    "Item-Set": "item-set",
    "Other": "other"
};

const finalType = categoryMap[category] || "other";
    
    if (finalType === "note" && numericPrice > 50) {
        return {success: false, message: "Notes should be priced fairly (below ₹50 recommended)"};
    }
    
    const image = file?.path || "";

    const keys = await redisClient.keys("search:*");
    if (keys.length) {
        await redisClient.del(keys);
    }
    const item = await Item.create({
        name, price: numericPrice, type:finalType, desc, image, user: userId, upiId
    });
    return { success: true, item };
};

exports.deleteItems = async (userId, itemId) => {
    const item = await Item.findById(itemId);
    if (!item) {
        return { success: false, message: "Item not found" };
    }
    
    if (!item.user.equals(userId)) {
        return { success: false, message: "You are not allowed to delete this item" };
    }

    const keys = await redisClient.keys("search:*");
    if (keys.length > 0) await redisClient.del(keys);
    await Item.findByIdAndDelete(itemId);
    return { success: true };
}

exports.getItemDetails = async (itemId, userId) => {
    const item = await Item.findById(itemId).populate("user");

    if (!item) {
        return { success: false, message: "Item not found" };
    }

    const isOwner = item.user._id.toString() === userId;

    let unlock = null;

    
    if (userId) {
        if (isOwner) {
            unlock = await Unlock.findOne({
                item: itemId,
                status: "paid"
            });
        } else {
            unlock = await Unlock.findOne({
                item: itemId,
                user: userId
            });
        }
    }
    console.log("IS OWNER:", isOwner);
console.log("UNLOCK:", unlock);
    
    const recommended = await Item.find({
        type: item.type,
        _id: { $ne: itemId },
    }).limit(4);
    
    return {success: true, item, recommended, unlock, isOwner};
};

exports.getItemsBySearch = async (query) => {
    
    const search = query.search || "";
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit
    const sortType = query.sort || "latest";
    const sortOptions = sortType === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    
    const key = `search:${search}:${page}:${limit}:${sortType}`;
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
        console.log('From Redis Cache');
        return JSON.parse(cachedData);
    }
    const filter = {};

    let purchasedIds = [];

if (query.userId) {
    const unlocks = await Unlock.find({
        user: query.userId,
        status: "paid"
    });

    purchasedIds = unlocks.map(u => u.item.toString());
}

filter._id = { $nin: purchasedIds };

    if (search) {
        filter.$text = { $search: search };
    }
    
    if (query.user) {
        filter.user = query.user;
    }

    if (query.status) {
        filter.status = query.status;
    }
    
    const items = await Item.find(filter).skip(skip).limit(limit).sort(sortOptions).populate("user");
    const ans = { items };
    
    const total = await Item.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    await redisClient.setEx(key, 60, JSON.stringify(ans));
    return { ans, page, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages };
};

exports.getItemsByCategory = async (category, userId) => {
    const normalized = (category || "").toLowerCase();

    const categoryMap = {
        books: "Books",
        electronics: "Electronics",
        notes: "Notes",
        instruments: "Instruments",
        "item-set": "Item-Set",
        others: "Other"
    };

    let purchasedIds = [];

    if (userId) {
        const unlocks = await Unlock.find({ user: userId, status: "paid" });
        purchasedIds = unlocks.map(u => u.item.toString());
    }

    let query = {
        _id: { $nin: purchasedIds }
    };

    if (normalized !== "all") {
        
        const dbCategory = categoryMap[normalized];
        
        if (!dbCategory) {
            return [];
        }
        query.category = dbCategory;
    }
    const items = await Item.find(query).sort({ createdAt: -1 }).populate("user", "name college");

    return items;
};

exports.createDeal = async (itemId, userId) => {

    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item not found");

    const existing = await Unlock.findOne({
        user: userId,
        item: itemId,
    });

    if (existing) {
        return { success: false, message: "Already started" };
    }

    const count = await Unlock.countDocuments({ item: itemId, status: { $in: ["pending", "paid"] } });

    if (count >= 5) {
        return { success: false, message: "Deal limit reached" };
    }

    await Unlock.create({
        user: userId,
        item: itemId,
        status: "pending"
    });
    return { success: true };
};

exports.markPaid = async (itemId, userId) => {
    const unlock = await Unlock.findOne({
        item: itemId,
        user: userId,
    });

    if (!unlock) {
        return { success: false, message: "No deal Found" };
    }

    unlock.status = "paid";
    await unlock.save();
    return { success: true };
};

exports.confirmPayment = async ( itemId, sellerId) => {
    const unlock = await Unlock.findOne({
        item: itemId,
        status: "paid"
    }).populate("item");

    if (!unlock) {
        return { success: false, message: " No paid deal" };
    }

    if (!unlock.item.user.equals(sellerId)) {
        return { success: false, message: "Unauthorized" };
    }

    unlock.status = "confirmed";
    await unlock.save();

    await Unlock.updateMany({
        item: itemId,
        _id: { $ne: unlock._id }
    }, { status: "rejected" });
    
    await Item.findByIdAndUpdate(itemId, { status: "sold" });

    return { success: true, message: "Trade is Done. ThankYou visit Again" };
};