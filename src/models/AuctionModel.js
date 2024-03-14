const mongoose = require("mongoose");

/**

@typedef Auction
@property {number} auctionid.required - The unique ID of the auction
@property {string} auctiontype.required - The type of auction. Can be "English" or "Dutch"
@property {Date} startsat - The start date and time of the auction. Defaults to current date and time.
@property {Date} endsat.required - The end date and time of the auction.
@property {mongoose.SchemaTypes.ObjectId} auctionitem.required - The ID of the NFT being auctioned.
@property {mongoose.Schema.ObjectId} seller.required - The ID of the wallet of the seller.
@property {mongoose.Schema.ObjectId} winner - The ID of the wallet of the winner, if the auction has ended.
@property {number} highestbid - The highest bid amount, if any.
@property {Array.<mongoose.Schema.ObjectId>} bidders - An array of the IDs of the wallets that have placed bids.
@property {Date} createdAt - The date and time when the auction was created.
*/

const AuctionSchema = new mongoose.Schema({
    auctionid: {
        type: Number,
        required: true
    },
    auctiontype: {
        type: String,
        required: true,
        enum: ["English", "Dutch"]
    },
    startsat: {
        type: Date,
        default: Date.now()
    },
    endsat: {
        type: Date
    },
    nftaddress: {
        type:String,
        required:true
    },
    nftId:{
        type:Number,
        required:true
    },
    networkId: {
        type: Number,
        required:true, 
    },
    currentPrice:{
        type:Number
    }, 
    startPrice:{
        type: Number,
        required: true,
    },
    endPrice:{
        type: Number
    },
    seller: {
        type:String
    },
    owner:{
        type: String
    },
    winner: {
        type:String
    },
    highestbid: {
        type: Number
    },
    isCompleted:{
        type: Boolean,
        default: false
    },
    state: {
        type: String,
        required: true,
        enum: ["Created", "Sold","Inactive"]
    }
}, {timestamp: true});


const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = Auction;