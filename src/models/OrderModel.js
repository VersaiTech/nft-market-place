const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    customerid: {
        type: String,
        unique: true
    },
    orderId: {
        type: Object
    },
    payment: {
        type: Object
    },

    state: {
        type: String,
        enum: ["Created", "Authorized", "Success", "Failed"]
    },
    startedat: {
        type: Date,
        default: Date.now()
    }

}, {timestamp: true});


const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders;