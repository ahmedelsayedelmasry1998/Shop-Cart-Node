const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
    user: {
        required: true,
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
    },
    cart: {
        required: true,
        type: Object,
    },
    address: {
        required: true,
        type: String,
    },
    name: {
        required: true,
        type: String,
    },
    contact: {
        required: true,
        type: String,
    },
    orderPrice: {
        required: true,
        type: String,
    },
});
module.exports = mongoose.model("Order", orderSchema);