const mongoose = require("mongoose");
const ethers = require("ethers");

                /**

                @typedef Wallet
                @property {string} walletaddress.required - The unique address of the wallet
                @property {Array.<ObjectId>} collections - The collections associated with the wallet
                @property {number} nonce - The nonce of the wallet
                @property {string} signature - The signature of the wallet
                @property {Date} createdAt - The date of the wallet creation (automatically added by Mongoose)
                @property {Date} updatedAt - The date of the wallet's last update (automatically added by Mongoose)
                */

const WalletSchema = new mongoose.Schema({
    walletaddress: {
        type: String,
        required: true,
        unique: true
    },
    networkId: {
        type: Number,
    },
    collections: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Collection"
        }
    ],
    nonce: {
        type: Number
    },
    signature: {
        type: String,
    },
    liked_nfts:[
        {
        type: mongoose.SchemaTypes.ObjectId,
        ref:"NFT"
    }
]
}, {timestamp: true});

/**

Verify signature of a message and return the address
@function verifySignature
@memberof Wallet
@param {string} signature - The signature of the wallet
@param {string} message - The message to verify the signature of
@returns {string} The address associated with the verified signature
*/

WalletSchema.methods.verifySignature = (signature, message) => {

    const msgHash = ethers.utils.hashMessage(message);
    const sign = ethers.utils.splitSignature(signature);
    const address = ethers.utils.recoverAddress(msgHash, sign);
    return address;
}

const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;
