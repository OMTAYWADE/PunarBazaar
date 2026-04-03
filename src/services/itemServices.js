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
    if (!name || !price) throw new Error("Missing fields");
    
    if (category === "Notes" && price > 10) {
        throw new Error("Notes price must be 10 rupess or below");
    }
    
    const image = file ? '/uploads/' + file.filename : "";
    await redisClient.del(`search:*`);
    return await Item.create({
        name, price, category, desc, image, user: userId,
    });
};

exports.deleteItems = async (userId, itemId) => {
    const item = await Item.findById(itemId);
    
    if (!item.user.equals(userId)) throw new Error("Not Authorized");
    
    await redisClient.del(`search:*`);
    return await Item.findByIdAndDelete(itemId);
};

exports.getItemDetails = async (itemId) => {
    const item = await Item.findById(itemId).populate("user");
    
    if (!item) throw new Error("Item Not found");
    
    const recommended = await Item.find({
        category: item.category,
        _id: { $ne: itemId },
    }).limit(4);
    
    return { item, recommended };
};

exports.addToWishList = async (userId, itemId) => {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {throw new Error("Invalid Item Id");}
    const user = await User.findById(userId);
    
    // avoid duplicate
    return await User.findByIdAndUpdate(userId, {
        $addToSet: { wishList: itemId }
    }, {new: true});
};

exports.getItemsBySearch = async (query) => {
    const key = `search:${search}:${page}:${limit}:${sortType}`;
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
        console.log('From Redis Cache');
        return JSON.parse(cachedData);
    }

    const search = query.search || "";
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const skip = (page - 1) * limit
    const sortType = query.sort || "latest";
    const sortOptions = sortType === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

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
