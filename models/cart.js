const mongoose = require("mongoose");
const cartSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    totalQuantity: {
        required: true,
        type: Number,
    },
    totalPrice: {
        required: true,
        type: Number,
    },
    selectedProduct: {
        required: true,
        type: Array(),
    },
    createAt: {
        type: Date,
        expires: "7d",//  60 * 60 * 24 * 7
    }
});
module.exports = mongoose.model("Cart", cartSchema);