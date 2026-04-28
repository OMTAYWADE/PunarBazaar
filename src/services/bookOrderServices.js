const BookOrder = require('../models/BookOrder');
const Item = require('../models/Item');

exports.createBookOrder = async (itemId, userId, qty) => {
    const item = await Item.findById(itemId);
    if (!item) {
        return { success: false, message: "Book not Found" };
    }

    const order = await BookOrder.create({
        buyer: userId,
        seller: item.user,
        book: item._id,
        quantity: qty,
    });
    return ({ success: true, order });
};

exports.markReady = async (orderId) => {
    const order = await BookOrder.findById(orderId).populate("buyer").populate("book");

    if (!order) {
        return { success: false, message: "order not found" };
    }

    order.status = "ready";
    await order.save();

    const message = `Hi ${order.buyer.name}, your book "${order.book.name}" is ready 📦`;

    const waLink = `https://wa.me/${order.buyer.phone}?text=${encodeURIComponent(message)}`;

    return { success: true, waLink };
};