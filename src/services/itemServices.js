const Item = require('../models/Item.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');

const redisClient = require('../config/redis.js');

exports.getAllItems = async (userId) => {
    await Item.updateMany(
        { featuredUntil: { $lt: new Date() } },
        { isFeatured: false }
    );
    let items = await Item.find().limit(20).sort({ isFeatured: -1, createdAt: -1 }).populate("user", "name college");
    if (!userId) return items;

    const user = await User.findById(userId);

    const same = items.filter(i => i.user?.college === user.college);
    const other = items.filter(i => i.user?.college !== user.college);

    return [...same, ...other];
};

exports.createItem = async (data, userId, file) => {
    const { name, price, desc, category } = data;
    if (!name || !price) {
        return {success: false, message: "Please fill all required fields"};
    }

    if (price <= 0 || price > 200000) {
        return {success: false, message: "Price must be between ₹1 and ₹2000"};
    }
    
    if (category === "Notes" && price > 1000) {
        return {success: false, message: "Notes should be priced fairly (below ₹10 recommended)"};
    }
    
    const image = file?.path || "";
    await redisClient.del(`search:*`);
    const item = await Item.create({
        name, price, category, desc, image, user: userId,
    });
    return { success: true, item };
};

exports.deleteItems = async (userId, itemId) => {
    const item = await Item.findById(itemId);
    if (!item) {
        return { success: false, message: "Item not found" };
    }
    
    if (!item.user.equals(userId)) {
        return { success: true, message: "You are not allowed to delete this item" };
    }
    await redisClient.del(`search:*`);
    await Item.findByIdAndDelete(itemId);
    return { success: true };
}

exports.getItemDetails = async (itemId) => {
    const item = await Item.findById(itemId).populate("user");
    
    if (!item) {
        return { success: false, message: "Item not found" };
    }
    
    const recommended = await Item.find({
        category: item.category,
        _id: { $ne: itemId },
    }).limit(4);
    
    return {success: true, item, recommended };
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
