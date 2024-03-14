const mongoose = require('mongoose');

/**

Mongoose schema for the User collection.
@typedef {Object} UserSchema
@property {string} username - The unique username of the user.
@property {string} email - The email address of the user.
@property {string} password - The password of the user.
@property {Array.<ObjectId>} walletaddress - The array of wallet addresses associated with the user.
@property {string} apikey - The API key of the user.
@property {Timestamps} timestamp - The timestamp when the record was created or updated.
*/

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    walletaddress: 
        {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: "Wallet"
        },
    wallet:{
        type:String,
        unique: true
    },
    networkId: {
        type: Number,
        },
    apikey : {
        type:String
    },
    tx_details:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Tx"
    },
    profile_url:{
        type: String
    }  
}, {timestamp: true});

const User = mongoose.model('User', UserSchema);

module.exports = User;