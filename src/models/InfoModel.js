const mongoose = require("mongoose");


const InfoSchema = new mongoose.Schema({
    itemid: {
        type: Number
    },
    nftaddress: {
        type: String
    },
    tokenid: {
        type: Number
    },
    networkId: {
        type: Number,
    },
    seller: {
        type: String
    },
    owner: {
        type: String
    },
    price: {
        type: String
    },
    state: {
        type: String,
        enum:["Created","Sold","Inactive"]
    },
    startsAt:{
        type: Date,
        default:Date.now()
    },
    endsAt:{
        type: Date
    }
    
}, {timestamp: true})

const Info = mongoose.model('Info', InfoSchema);

module.exports = Info;
