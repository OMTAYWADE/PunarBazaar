const Item = require('../models/Item');
const Unlock = require('../models/Unlock');
const User = require('../models/User');

exports.rateSeller = async (userId, itemId, rating) => {
    const unlocks = Unlock.findOne({ user: userId, item: itemId });
    
    if (!unlocks || !unlocks.status !== "confirmed") {
        return { success: false, message: "Not allowed" };
    }

    if (unlocks.buyerRated) {
        return { success: false, message: "already rated" };
    }

    const item = await Item.findById(itemId).populate("user");
    const seller = await User.findById(item.user._id);

    seller.trustScore = (seller.trustScore || 0) + rating * 2;
    await seller.save();

    unlocks.buyerRated = true;
    await unlocks.save();

    return { sucess: true };
};