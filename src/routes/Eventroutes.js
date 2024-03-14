const express = require("express");
const Eventroutes = express.Router();
const AssetController = require("../controllers/assetController");
const EventAssetController = require("../controllers/onchainEventController");
const AccountController = require("../controllers/accountController");


//Stream API for smartcontract events
Eventroutes.get("/onchainevents/:nftaddress/:tokenid",EventAssetController.getEventsOfSingleNFT)


module.exports = Eventroutes;