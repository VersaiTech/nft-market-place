const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    
    tx_id: {
       customerid: { 
        type: String,
    },
        productid: {
         type : String,
        }
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    tx_type: {
        type: String,
        enum: ["card"]
    },
    product: {
        type: Object
    },
    price: {
        type: Number
    },
    quantity: {
        type: Number
    },
    customername: {
        type: String
    },
    billingdetails: {
        type: Object
    },
    state: {
        type: String,
        enum: ["Started", "Pending", "Completed","Canceled"]
    },
    tx_status:{
        type: String,
        enum: ["Intiated", "Processing", "Success","Failed"]
    },
    startedat: {
        type: Date,
        default: Date.now()
    }
    
}, {timestamp: true});


const Tx = mongoose.model('Tx', TransactionSchema);

module.exports = Tx;