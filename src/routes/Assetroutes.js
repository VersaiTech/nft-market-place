/**

@typedef {import('express').Router} Router
@typedef {import('../controllers/assetController')} AssetController
@typedef {import('../controllers/accountController')} AccountController
*/

const express = require("express");
const Assetroutes = express.Router();
const AssetController = require("../controllers/assetController");
const EventAssetController = require("../controllers/onchainEventController");
const AccountController = require("../controllers/accountController");
const PaymentController = require("../controllers/paymentController");

/**

@module Assetroutes
@description Defines the routes for the NFT API
*/

Assetroutes.get("/assets/api/AllAssets", AssetController.getAllAssets);
Assetroutes.get("/assets/api/AllCollectionsofCategory", AssetController.getAllcollectionsofCategory);
Assetroutes.get("/assets/api/AllCollections", AssetController.getAllCollections);
Assetroutes.post("/assets/api/CreateCollection", AssetController.createCollections); 
Assetroutes.get("/assets/api/SingleCollection", AssetController.getSingleCollection);
Assetroutes.get("/assets/api/Trending", AssetController.getAssetsByHighPrice);
Assetroutes.get("/assets/api/AssetsByCollection", AssetController.getAssetsByAddress); 
Assetroutes.get("/assets/api/SingleAsset", AssetController.getSingleAsset);
Assetroutes.get("/assets/api/UserAssets", AssetController.getMyAssets);
Assetroutes.get("/assets/api/UserAllAssets", AssetController.getMyAllAssets);
Assetroutes.get("/assets/api/UserAllCollections", AssetController.getMyAllCollections);
Assetroutes.get("/assets/api/UsersCollectedItems",AssetController.getMyCollectedItems);

Assetroutes.post("/assets/api/BuyAssets", AssetController.buyAssets);
Assetroutes.post("/assets/api/CreateAsset", AssetController.createAssets);
Assetroutes.post("/assets/api/SellAsset", AssetController.createMarketItem);


Assetroutes.post("/assets/api/StartAuction", AssetController.startAuction);
Assetroutes.post("/assets/api/EndAuction", AssetController.endAuction);
Assetroutes.post("/assets/api/BidAuction", AssetController.bidAuction);

Assetroutes.post("/assets/api/PriceAuction", AssetController.priceAuction);

Assetroutes.post("/assets/api/updateLikes", AssetController.updateLikes);
Assetroutes.get("/assets/api/getFavorites",AssetController.getFavorites);
Assetroutes.get("/assets/api/getResults",AssetController.searchAPI);

Assetroutes.post("/assets/api/payment/Checkout",PaymentController.checkOut);
Assetroutes.post("/assets/api/payment/CreateCustomer",PaymentController.createCustomer);
Assetroutes.post("/assets/api/payment/createPayment",PaymentController.createPayment);
Assetroutes.post("/assets/api/payment/confirmPayment",PaymentController.confirmPaymentIntent);
Assetroutes.get("/assets/api/payment/getMaticPrice",PaymentController.getPriceOfMaticUSD);

Assetroutes.post("/assets/api/buyForUser", AssetController.buyNFTUsingFiat);

module.exports = Assetroutes;