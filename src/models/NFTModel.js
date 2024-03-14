const mongoose = require("mongoose");

/**

@typedef NFT
@property {string} nftid - Unique identifier for the NFT.
@property {string} name.required - The name of the NFT.
@property {string} description - A short description of the NFT.
@property {string} metadata - A JSON metadata file describing the NFT.
@property {string} nfttype - The type of the NFT.
@property {string} externallink - An external URL for additional information.
@property {number} price - The price of the NFT.
@property {boolean} available - Whether or not the NFT is available for purchase.
@property {object} traits - An object containing traits that describe the NFT.
@property {string} address - The address of the NFT contract.
@property {number} likes - The number of likes the NFT has.
@property {number} views - The number of views the NFT has.
@property {string} owner - The address of the current owner of the NFT.
@property {Array.<Events>} events - An array of Events associated with the NFT.
@property {Array.<Tx>} transactions - An array of transactions associated with the NFT.
@property {Date} createdAt - The date the NFT was created.
*/
const NFTSchema = new mongoose.Schema({
    nftid: {
        type: String
    },
    name: {
        type: String,
       // required: true
    },
    description: {
        type: String
    },
    networkId: {
        type: Number,
        required:true,
    },
    metadata: {
        type: String
    },
    nfttype: {
        type: String
    },
    externallink: {
        type: String
    },
    price: {
        type: Number
    },
    available: {
        type: Boolean
    },
    traits: {
        type: Object
    },
    address: {
        type:String
    },
    likes: {
        type: String
    },
    views: {
        type: Number
    },
    owner: {
        type: String
    },
    seller:{
        type: String
    },
    events: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Events"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    users_like:[
        {
        type: mongoose.SchemaTypes.ObjectId,
        ref:"Wallet"
    }],
    state: {
        type: String,
       // required: true,
        enum: ["CreatedAtAuction", "SoldAtAuction","Inactive", "CreatedAtMarketplace","SoldAtMarketplace"]
    },
    earnings:{
        type: String
    }

}, {timestamp: true})

const NFT = mongoose.model('NFT', NFTSchema);

module.exports = NFT;
