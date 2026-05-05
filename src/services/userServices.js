const Item = require('../models/Item');
const Unlock = require('../models/Unlock');
const User = require('../models/User');

exports.rateSeller = async (userId, itemId, rating) => {
    const unlocks = await Unlock.findOne({ user: userId, item: itemId });
    
    if (!unlocks || unlocks.status !== "confirmed") {
        return { success: false, message: "Not allowed" };
    }

    if (unlocks.buyerRated) {
        return { success: false, message: "already rated" };
    }

    const item = await Item.findById(itemId).populate("user");

    if (!item) {
        return { success: false, message: "Item not found" };
    }
    const seller = await User.findById(item.user._id);

   seller.totalRating = (seller.totalRating || 0) + rating;
seller.ratingCount = (seller.ratingCount || 0) + 1;
seller.trustScore = seller.totalRating / seller.ratingCount;
    await seller.save();

    unlocks.buyerRated = true;
    await unlocks.save();

    return { sucess: true };
};