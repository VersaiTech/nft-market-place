const mongoose = require("mongoose");
/**

@typedef Collection
@property {string} collection_name.required - The name of the collection.
@property {number} collection_id.required - The id of the collection.
@property {string} [collection_desc] - The description of the collection.
@property {string} [collection_address] - The address of the collection.
@property {string} [category] - The category of the collection.
@property {Array.<string>} items - The items of the collection.
@property {Date} createdAt - The date and time the collection was created.
*/

const CollectionSchema = new mongoose.Schema({
    collection_logoURI:{
        type: String,
        required: true
    },
    collection_FeaturedURI:{
        type: String,
    },
    collection_BannerURI:{
        type: String
    },
    collection_name: {
        type: String,
        required: true
    },
    networkId: {
        type: Number,
        required:true,
    },
    collection_symbol:{
        type:String,
        required:true
    },
    collection_links:{
        type: String //Make it a string array
    },
    collection_URL:{
        type: String
    },
    collection_recipient:{
        type:String,
        required:true
    },
    collection_desc: {
        type: String
    },
    collection_address: {
        type: String
    },
    category: {
        type: String
    },
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NFT"
        }
    ],
    auctionItems:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction"
        }
    ],
    creation_date:{
        type: Date,
        default: Date.now
    },
    items_present:{
        type: Number,
        default: 0
    },
    creator_earnings:{
        type: String
    }
}, {timestamp: true})

const Collection = mongoose.model('Collection', CollectionSchema);


module.exports = Collection;
