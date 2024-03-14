/**

@typedef {import('express').Router} Router
@typedef {import('../controllers/assetController')} AssetController
@typedef {import('../controllers/onchainEventController')} OnChainEventController
@typedef {import('../controllers/accountController')} AccountController
*/

const express = require("express");
const Accountroutes = express.Router();
const AssetController = require("../controllers/assetController");
const AccountController = require("../controllers/accountController");

/**

Authentication API routes
@name Authentication API
@memberof module:routes/Accountroutes
@namespace AuthenticationAPIRoutes
*/

Accountroutes.post("/account/api/UserRegister", AccountController.userregister) 
Accountroutes.post("/account/api/auth/User", AccountController.authUser) 
Accountroutes.get("/account/api/auth/Userrefresh", AccountController.authrefresh) 

Accountroutes.post("/account/api/Userlogin", AccountController.userlogin) 
Accountroutes.post("/account/api/Userlogout",AccountController.userlogout) 


Accountroutes.get("/account/api/APIinfo", AccountController.generateapikey,AccountController.getapiinfo)
Accountroutes.post("/account/api/APIinfo/authAPI",AccountController.authapikey)

Accountroutes.get("/account/api/UserInfo", AccountController.getUserInfo) 
Accountroutes.put("/account/api/UpdateUserInfo",  AccountController.UpdateUserInfo) 
Accountroutes.get("/account/api/UserResetpwd", AccountController.userresetpwd) 

Accountroutes.post("/account/api/setWalletInfo", AccountController.setWalletInfo)
Accountroutes.get("/account/api/Nonce", AccountController.getNonce) 
Accountroutes.post("/account/api/Signature", AccountController.processSignature) 
Accountroutes.get("/account/api/auth/Wallet", AccountController.authWallet) 
Accountroutes.get("/account/api/auth/WalletRefresh", AccountController.authWalletrefresh)
Accountroutes.post("/account/api/auth/Walletlogout", AccountController.walletlogout)
Accountroutes.post("/account/api/updateUserProfile",AccountController.updateUserProfile)
Accountroutes.get("/account/api/isUser",AccountController.isUsernameAvailable);

Accountroutes.get("/account/api/UserAllAssets",  AccountController.getMyAllAssets)
Accountroutes.get("/account/api/assets/UserAllCollections", AccountController.getMyAllCollections) 
Accountroutes.get("/account/api/assets/UserAllFavouriteAssets", AccountController.getMyAllFavouriteAssets)
Accountroutes.get("/account/api/assets/UserAllCreations",  AccountController.getMyAllCreations) 
Accountroutes.get("/account/api/assets/UserAllAuctions",  AccountController.getMyAllAuctions) 
Accountroutes.get("/account/api/assets/UserAllActivities",  AccountController.getMyAllActivities) 


module.exports = Accountroutes;
