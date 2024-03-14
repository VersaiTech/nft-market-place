const mongoose = require("mongoose");

/**

@typedef Event
@property {string} event_type - The type of event ("minted", "listed", "sale", "transfer")
@property {string} from - The sender's address
@property {string} to - The receiver's address
@property {number} price - The price of the event
@property {number} quantity - The quantity of the event
*/

const EventModelSchema = new mongoose.Schema({

    event_type: {
        type: String,
        enum: ["minted", "listed","auctioned","sale", "transfer"]
    },
    from: {
        type: String
    },
    to: {
        type: String
    },
    networkId: {
        type: Number,
        required:true,
    },
    price: {
        type: Number
    },
    quantity: {
        type: Number
    },
    eventTime:{
        type: Date,
        default: Date.now()
    }
})

const Events = mongoose.model('Events', EventModelSchema);

module.exports = Events;
