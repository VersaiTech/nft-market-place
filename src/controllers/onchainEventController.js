const User = require("../models/UserModel");
const Wallet = require("../models/WalletModel");
const Collection = require("../models/CollectionModel");
const Tx = require("../models/TransactionModel");
const NFT = require("../models/NFTModel");
const Auction = require("../models/AuctionModel");
const Events = require("../models/EventModel");
const Info = require("../models/EventModel");
const {Web3Provider} = require("@ethersproject/providers");
const {Contract} = require("@ethersproject/contracts");
const {parseUnits} = require("@ethersproject/units");


const getEventsOfSingleNFT = async (req, res) => {
    const tokenId = req.query.tokenId;
    const nftaddress = req.query.nftaddress;
    const chainId = req.query.chainId;

    try {

        const foundevents = await NFT.findOne({nftid: tokenId, address:nftaddress, networkId: chainId }).populate("events");
        if (! foundevents) {
            res.status(400).json({message: err.message});
        }
        return res.status(200).json({events: foundevents});
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};


module.exports = {
    getEventsOfSingleNFT
};
