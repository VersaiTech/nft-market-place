const User = require("../models/UserModel");
const Wallet = require("../models/WalletModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


/**
     * @dev User registration controller.
     * @route POST /account/api/register
     * @query req.body.username, req.body.email, req.body.password
     * @returns 200 on success with the newly created user object, 400 on error with a message.
     */

const userregister = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const walletaddress = req.body.walletaddress;
    try {
            
            if (username && email && password && walletaddress) {
                // res.status(400).send("All input is required");
                const salt = bcrypt.genSaltSync(10);
                const oldUser = await User.findOne({username: username});

                if (oldUser) {
                    return res.status(409).send("User Already Exist. Please Login");
                }

                const pwdhash = bcrypt.hashSync(password, salt);
                const newuser = new User({username: username, email: email, password: pwdhash, wallet:walletaddress});
                if (walletaddress) {
                    let wallet = await Wallet.findOne({walletaddress:walletaddress});
                    if(wallet)
                    {
                        return res.status(409).send("User Already Exist. Please Login");
                    }
                    wallet = new Wallet({walletaddress:walletaddress});
                    await wallet.save();
                    newuser.walletaddress=wallet;
                    await newuser.save();
                }
                await newuser.save();
                const user1 = await User.findOne({username: username},{__v:0,_id:0,walletaddress:0, password:0});
                return res.status(200).json({success: "User Created", user:user1});
        }
        else if(walletaddress && username)
        {
        const oldUser = await User.findOne({username: username});
        if (oldUser) {
            return res.status(409).send("User with username already exists");
        }

        const newuser = new User({username: username, wallet:walletaddress});
        if (walletaddress) {
            let wallet = await Wallet.findOne({walletaddress:walletaddress});
            if(wallet)
            {
                return res.status(409).send("User Already Exist. Please Login");
            }
            wallet = new Wallet({walletaddress:walletaddress});
            await wallet.save();
            newuser.walletaddress=wallet;
            await newuser.save();
        }
        await newuser.save();
        const user1 = await User.findOne({username: username},{__v:0,_id:0,walletaddress:0, password:0});
        return res.status(200).json({success: "User Created", user:user1});
    }
    } catch (err) {
        if (err.code == 11000) {
            return res.status(409).send({message:"User Already Exist. Please Login"});
        }
        return res.status(400).json({message: err.message});
    }
    

};

/**
     * @dev User login controller.
     * @route POST /account/api/login
     * @query req.body.username, req.body.password
     * @returns 200 on success with an access token and username, 400 on invalid credentials, 401 on error with a message.
     */

const userlogin = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password; 
    const walletaddress = req.body.walletaddress;           
    try {
        if (username && password) {
            //return res.status(400).send("All input is required");
            const user = await User.findOne({username: username},{_id:0,_v:0});
            if (user && (bcrypt.compareSync(password, user.password))) {

                const accesstoken = jwt.sign({
                    username: username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
                const refreshtoken = jwt.sign({
                    username: username
                }, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '1h'});

                res.cookie('jwt', refreshtoken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000
                });
                const user1 = await User.findOne({username: username},{__v:0,_id:0,walletaddress:0, password:0});
                return res.status(200).json({message:"LoggedIn Successfully", accesstoken: accesstoken, user: user1});
            }
            return res.status(400).json({message: "Invalid Credentials"});
        }
        else if(walletaddress){
            let wallet =await Wallet.findOne({walletaddress:walletaddress});
            if(!wallet)
            {
                return res.status(400).json({message:"Not Registered!"});
            }
            const user1 = await User.findOne({wallet: walletaddress},{__v:0,_id:0, password:0, walletaddress:0});
            if(!user1) 
            {
                return res.status(400).json({message:"Not Registered!"});
            }
            return res.status(200).json({message:"Logged In Successfully!",user:user1});
        } 
    } catch (err) {
        return res.status(401).send({message: err.message});  
    }

};

/**
     * @dev Authentication middleware.
     * @route POST /account/api/auth/User
     * @query req.body.accesstoken
     * @returns 200 on success with a message, 400 on invalid token, 403 on error with a message.
     */

const authUser = (req, res, next) => {
    const accesstoken = req.body.accesstoken;
    try {

        const verifiedusername = jwt.verify(accesstoken, process.env.JWT_SECRET_KEY);
        if (! verifiedusername) {
            return res.status(401).json({message: "Not a Valid token"});
        }
        req.user = verifiedusername.username;

        res.status(200).json({message: "Authenticated"});

        return next();

    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

/**
    * @dev Refresh token controller.
    * @route GET /account/api/auth/Userrefresh
    * @query req.cookies.jwt
    * @returns 200 on success with a new access token, 400 on invalid token, 403 on error with a message.
    */

const authrefresh = (req, res) => {
    const refreshtoken = req.cookies.jwt;
    try {
        const verifieddata = jwt.verify(refreshtoken, process.env.JWT_REFRESH_SECRET_KEY);
        if (! verifieddata) {
            return res.status(400).json({msg: "Not a Valid token"});
        }
        const accesstoken = jwt.sign({
            username: verifieddata.username
        }, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
        return res.status(200).json({accesstoken: accesstoken});
    } catch (err) {
        return res.status(403).json({message: err.message});
    }
}


/**
    * @dev Password reset controller.
    * @route PUT /account/api/:user/resetpassword
    * @query req.query.user
    * @returns 200 on success with a message, 400 on invalid user, 404 on error with a message.
    */

const userresetpwd = async (req, res) => {
    const username = req.query.user;
    try {
        const foundUser = await User.findOne({username: username});
        if (! foundUser) {
            return res.status(400).send('User with that username' + username + 'does not exist');
        }
        const salt = bcrypt.genSaltSync(10);
        const email = foundUser.email;
        const temppwd = Math.random().toString(36).substring(0, 8); //
        const pwdhash = bcrypt.hashSync(temppwd, salt);

        await foundUser.updateOne({
            username: username
        }, {
            $set: {
                password: pwdhash
            }
        });
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Password Reset',
            text: "Your new password is" + temppwd + ",Please login and change it as soon as possible."
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            message: "Email sent to" + email + "with new password."
        });
    } catch (err) {
        res.status(400).json({message: err.message});
    };
}

/**
    * @dev User logout controller.
    * @route POST /account/api/logout
    * @query req.query.user
    * @returns 200 on success with a message and the user object, 400 on invalid user, 404 on error with a message.
    */

const userlogout = async (req, res) => {
    try {
        res.clearCookie('jwt');
        return res.status(200).json({message: "Successfully Logged out"});
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * @dev Get user information by username
    * @route GET /account/api/:user/profile
    * @param {Object} req - Express request object
    * @param {string} req.query.user - Username of the user
    * @param {Object} res - Express response object
    * @returns {Object} Returns JSON object containing the user's username and email if found, otherwise returns an error message.
    */

const getUserInfo = async (req, res) => {
    const username = req.query.user;
    const walletId = req.query.walletId;
    try {
        const foundUser = await User.findOne({username: username});
        if (! foundUser) {
            return res.status(404).json({
                error: "User with Username" + username + "is not found in database"
            });
        }
        const wallet = Wallet.findOne({_id:Wallet(walletId)});
        return res.status(200).json({username: foundUser.username, email: foundUser.email, wallet:wallet});
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * @dev Update user information by username
    * @route PUT /account/api/:user/config
    * @param {Object} req - Express request object
    * @param {string} req.query.user - Username of the user
    * @param {string} req.body.email - Email address to be updated
    * @param {Object} res - Express response object
    * @returns {Object} Returns JSON object containing a success message if user info is updated, otherwise returns an error message.
    */

const UpdateUserInfo = async (req, res) => {
    const username = req.query.user;
    const email = req.body.email;
    const walletaddress = req.body.walletaddress;
    const chainId = req.query.chainId;
    try {
        const foundUser = await User.findOne({username: username,networkId:chainId});
        if (! foundUser) {
            res.status(404).send({
                error: "User with Username" + username + "is not found in database"
            });
        }
        if (email) {
            await User.updateOne({
                username: username
            }, {
                $set: {
                    email: email
                }
            });
        }
        if (walletaddress) {
            const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
            if (!foundWallet) {
                return res.status(400).json({message: "Wallet not Found in Database,Sign in through wallet and integrate"});
            }
            foundUser.walletaddress.push(foundWallet);
            await foundUser.save();
        }
        return res.status(200).json({message: "Info Updated Successfully"});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};


/**
    * @dev Set wallet address for a user
    * @route POST /api/wallet/:walletaddress
    * @param {Object} req - Express request object
    * @param {string} req.query.walletaddress - Wallet address to be set
    * @param {Object} res - Express response object
    * @returns {Object} Returns JSON object containing a success message and the new wallet address if set successfully, otherwise returns an error message.
    */

const setWalletInfo = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;
    try {
        const oldwalletaddress = await Wallet.findOne({networkId:chainId,walletaddress: walletaddress},{_id:0});

        if (oldwalletaddress) {
            return res.status(200).json({message: "Existed Wallet", walletaddress: oldwalletaddress})
        }
        const newwalletaddress = new Wallet({walletaddress: walletaddress,networkId:chainId, nonce: null, signature: null});
        await newwalletaddress.save();
        return res.status(200).json({message: "success", walletaddress: newwalletaddress});

    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * @dev Get nonce for a wallet address
    * @route GET /api/wallet/:walletaddress/nonce
    * @param {Object} req - Express request object
    * @param {string} req.query.walletaddress - Wallet address to get nonce for
    * @param {Object} res - Express response object
    * @returns {Object} Returns JSON object containing the nonce value if found, otherwise returns an error message.
    */

const getNonce = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;
    try {
        const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
        if (! foundWallet) {
            res.status(404).json({
                message: "User with WalletAddress" + walletaddress + "is not found in database"
            });
        }
        const nonce = Math.floor(Math.random() * 100000);
        await Wallet.updateOne({
            walletaddress: walletaddress,
            networkId:chainId
        }, {
            $set: {
                nonce: nonce
            }
        })
        return res.status(200).json({nonce: nonce});
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

/**
    * @dev Process wallet signature for authentication
    * @route POST /api/wallet/:walletaddress/signature
    * @param {Object} req - Express request object
    * @param {string} req.query.walletaddress - Wallet address to process signature for
    * @param {string} req.body.signature - Signature to be processed
    * @param {string} req.body.message - Message to be verified with the signature
    * @param {Object} res - Express response object
    * @returns {Object} Returns JSON object containing the access token and wallet address if signature is valid, otherwise returns an error message.
    */

const processSignature = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const signature = req.body.signature;
    const message = req.body.message;
    const chainId = req.query.chainId;
    try {
        const foundWallet = await Wallet.findOne({networkId:chainId,walletaddress: walletaddress});
        if (! foundWallet) {
            res.status(404).send({error: `User with WalletAddress ${walletaddress} is not found in database`});
        }
        const address = foundWallet.verifySignature(signature, message);
        if (! address) {
            res.status(200).json({messge: err.message});
        }
        if (address === walletaddress) {
            const accesstoken = jwt.sign({
                walletaddress: walletaddress,
                nonce: foundWallet.nonce
            }, process.env.JWT_SECRET_KEY, {expiresIn: '15m'});
            const refreshtoken = jwt.sign({
                walletaddress: walletaddress
            }, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '1h'});

            await Wallet.updateOne({
                walletaddress: walletaddress,
                networkId:chainId
            }, {
                $set: {
                    walletaddress: walletaddress,
                    nonce: foundWallet.nonce,
                    signature: signature
                }
            }, {upsert: true});
            res.cookie('walletjwt', refreshtoken, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            return res.status(200).json({accesstoken: accesstoken, walletaddress: walletaddress});

        } else {
            res.status(400).send({error: "Invalid Signature"});
        }

    } catch (err) {
        if (err.code == 11000) {
            return res.status(409).send("Signature Already Processed");
        }
        res.status(400).json({error: err.message});
    }

};

/**
    * @dev Authenticate wallet by verifying access token
    * @route POST /api/wallet/auth
    * @param {Object} req - Express request object
    * @param {string} req.body.accesstoken - Access token to be verified
    * @param {Object} res - Express response object
    * @param {Function} next - Express next function
    * @returns {Object} Returns JSON object containing a success message if access token is verified, otherwise returns an error message.
    */

const authWallet = async (req, res, next) => {
    const accesstoken = req.body.accesstoken;
    try {
        if (! accesstoken) {
            return res.status(401).json({message: "Not Authorized"});
        }
        const verifiedwallet = jwt.verify(accesstoken, process.env.JWT_SECRET_KEY);
        if (! verifiedwallet) {
            return res.status(401).json({message: "Not a valid token"});
        }
        req.walletaddress = verifiedwallet.walletaddress;
        res.status(200).json({message: "Authenticated"});
        return next();
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};


/**
    * Refreshes wallet JWT token
    *
    * @dev Refreshes wallet JWT token using the refresh token from the request cookie.
    * @route POST /api/wallet/refresh
    * @returns {object} An object containing the new access token.
    * @throws {object} Returns an error object if an error occurs.
    */

const authWalletrefresh = (req, res) => {
    const refreshtoken = req.cookies.jwt;
    try {
        const verifieddata = jwt.verify(refreshtoken, process.env.JWT_REFRESH_SECRET_KEY);
        if (! verifieddata) {
            return res.status(400).json({message: "Not a Valid token"});
        }
        const accesstoken = jwt.sign({
            walletaddress: verifieddata.walletaddress
        }, process.env.JWT_SECRET_KEY, {expiresIn: '2h'});
        return res.status(200).json({accesstoken: accesstoken});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

/**
    * Logs out a wallet user
    *
    * @dev Logs out a wallet user by updating the user's nonce and signature and clearing the JWT cookie.
    * @route POST /api/wallet/logout/:walletaddress
    * @param {string} walletaddress - The wallet address of the user to logout.
    * @returns {object} An object containing a success message.
    * @throws {object} Returns an error object if an error occurs.
    */

const walletlogout = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;
    try {

        const foundWallet = await Wallet.findOne({networkId:chainId,walletaddress: walletaddress});
        if (! foundWallet) {
            return res.status(404).json({
                message: "User with WalletAddress" + walletaddress + "is not found in database"
            });
        }
        await Wallet.updateOne({
            networkId:chainId,
            walletaddress: foundWallet.walletaddress
        }, {
            $set: {
                nonce: null,
                signature: null
            }
        }, {});
        res.clearCookie('walletjwt');
        return res.status(200).json({message: "Successfully Logged out"});
    } catch (err) {
        return res.status(404).json({message: err.message});
    }
}

/**
    * Gets all assets belonging to a user
    *
    * @dev Gets all assets belonging to a user by querying the user's username.
    * @route GET /api/user/:user/assets
    * @param {string} user - The username of the user to get assets for.
    * @returns {object} An object containing all assets belonging to the user.
    * @throws {object} Returns an error object if an error occurs.
    */

const getMyAllAssets = async (req, res) => {
    const username = req.query.user;
    const chainId = req.query.chainId;
    try {
        const foundAssets = await User.find({username: username,networkId:chainId}).populate({
            path: "walletaddress",
            populate: {
                path: "collections",
                select: "items"
            }
        });
        if (! foundAssets) {
            return res.status(404).json({message: "No Assets found"})
        };
        return res.status(200).json({assets: foundAssets});

    } catch (err) {
        res.status(400).json({message: err.message});
    }
};


/**
    * Gets all collections belonging to a user
    *
    * @dev Gets all collections belonging to a user by querying the user's username and populating the user's wallet address and collections.
    * @route GET /api/user/:user/collections
    * @param {string} user - The username of the user to get collections for.
    * @returns {object} An object containing all collections belonging to the user.
    * @throws {object} Returns an error object if an error occurs.
    */

const getMyAllCollections = async (req, res) => {
    const username = req.query.user;
    const chainId = req.query.chainId;
    try {
        const foundCollections = await User.findOne({username: username,networkId:chainId}).populate({
            path: "walletaddress",
            populate: {
                path: "collections"
            }
        })
        if (! foundCollections) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({Collections: foundCollections});
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * Gets all favorite assets belonging to a user
    *
    * @dev Gets all favorite assets belonging to a user by querying the user's username and populating the user's NFTs with likes.
    * @route GET /api/user/:user/favorites
    * @param {string} user - The username of the user to get favorite assets for.
    * @returns {object} An object containing all favorite assets belonging to the user.
    * @throws {object} Returns an error object if an error occurs.
    */
const getMyAllFavouriteAssets = async (req, res) => {
    const username = req.query.user;
    const chainId = req.query.chainId;
    try {
        const foundfavourites = await User.findOne({username: username,networkId:chainId}).populate("walletaddress").populate("collections").populate("items")
        if (! foundfavourites) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({assets: foundfavourites});
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * Gets all creations belonging to a user
    *
    * @dev Gets all creations belonging to a user by querying the user's username, populating the user's wallet address, and populating the user's NFTs with collections and items.
    * @route GET /api/user/:user/creations
    * @param {string} user - The username of the user to get creations for.
    * @returns {object} An object containing all creations belonging to the user.
    * @throws {object} Returns an error object if an error occurs.
    */

const getMyAllCreations = async (req, res) => {
    const username = req.query.user;
    const chainId = req.query.chainId;
    try {
        const foundAssets = await User.findOne({username: username,networkId:chainId}).populate({
            path: "walletaddress",
            populate: {
                path: "collections",
                select: "items"
            }
        });
        if (! foundAssets) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(foundAssets);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

/**
    * @dev Returns all auctions for the current user based on their wallet address
    * @route GET /api/my/auctions/:user
    * @param {string} user - The username of the current user
    * @returns {Object} Returns JSON object containing all auctions for the current user
    */

const getMyAllAuctions = async (req, res) => {   //Shubham Singh
    const username = req.query.user;
    const chainId = req.query.chainId;
    try {
        const foundAuctions = await User.find({username: username,networkId:chainId}).populate({
            path: "walletaddress",
            populate: {
                path: "collections",
                select: "auctionItems"
            }
        });
        if (! foundAuctions) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json(foundAuctions[0]["walletaddress"]);

                    
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * @dev generates the user's API key
    * @route GET /account/:user/api/:apikey
    * @returns {Object} Returns JSON object indicating whether generation was successful or not and APIKEY
    */

const generateapikey = async (req, res,next) => {
    const username = req.query.username;
    try {
      const foundUser = await User.findOne({username:username});
      if(!foundUser){
        res.status(400).json({message:"User not found"});
      }
      const apiKey = Math.random().toString(36).substring(4, 14);
      await User.updateOne({username:username},{$set:{apikey:apiKey}});
      return next()
    } catch (err) {
      res.status(400).json({message: err.message});
    }
  };

/**
    * @dev Authenticates the user's API key
    * @route POST /account/api/:user/apiinfo/:apikey/auth
    * @returns {Object} Returns JSON object indicating whether authentication was successful or not
    */

const authapikey = async (req, res, next) => {
    const username = req.query.user;
    const api_key = req.query.apikey;
    try {
        const foundUser = await User.findOne({username:username});
        if (!foundUser) {
            res.status(404).send({error: `User with Username ${username} is not found in database`});
        }
        if(api_key === foundUser.apikey){
        res.status(200).json({message: "Authenticated Successfully"});
        return next();
        }
        res.status(401).json({message:"Invalid API Key"});
        return null;
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

/**
    * @dev Returns the API key for a specific user
    * @route GET /api/user/:username/apikey
    * @param {string} username - The username of the user
    * @returns {Object} Returns JSON object containing the API key for the specified user
    */

const getapiinfo = async (req, res) => {
    const username = req.query.username;
    try {
        const foundUser = await User.findOne({username: username});
        console.log(foundUser);
        // if (!foundUser) {
        //     return res.status(404).send({
        //         error: "User with Username" + "username" + "is not found in database"
        //     });
        // }
       return res.status(200).json({apikey: foundUser.apikey});
    } catch (err) {
        res.status(404).json({message: "Server Error"});
    }
};

const getMyAllActivities = async(req,res)=>{
    const walletaddress = req.query.walletaddress;
    try{
        const wallet = await Wallet.findOne({walletaddress:walletaddress}).populate({path: "collections", select:"collections", populate:{path:"items",select:"items",populate:{path:"events", select:{_id:0,__v:0}}} });
        if(!wallet)
        {
            return res.status(404).json({message:"Wallet not find"});
        }
        let events = [];
        
        for(var i=0;i<wallet["collections"].length;i++)
        {
            for(var j=0;j<wallet["collections"][i]["items"].length;j++)
            {
                for(var k=0;k<wallet["collections"][i]["items"][j]["events"].length;k++)
                {
                    events = [...events,wallet["collections"][i]["items"][j]["events"][k]];
                }
            }
        }
        return res.status(200).json({events:events});
    } catch(err){
        return res.status(500).json({message: "Server Error"});
    }
}

const updateUserProfile = async (req,res)=>{
    const {profile_url,username}=req.body;

    try {
        const user = await User.findOne({username:username});
        if(!user)
        {
            return res.status(404).json({message:"User not found"});
        }

        user.profile_url=profile_url;
        await user.save();

        return res.status(200).json({message:"Updated Successfully",user:user});
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:error.message});
    }
}

const isUsernameAvailable = async(req,res)=>{
    const username = req.body;
    try {
        const isTrue = await User.findOne({username:username});
        if(isTrue)
            return res.status(400).json({message:"Username already exists", available: false});
        
        return res.status(200).json({message:"Username available", available: true});
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
}

module.exports = {
    userresetpwd,
    walletlogout,
    authrefresh,
    authWalletrefresh,
    userregister,
    userlogin,
    userlogout,
    authUser,
    authWallet,
    walletlogout,
    getUserInfo,
    UpdateUserInfo,
    setWalletInfo,
    getNonce,
    processSignature,
    generateapikey,
    authapikey,
    getapiinfo,
    getMyAllAssets,
    getMyAllAuctions,
    getMyAllCollections,
    getMyAllFavouriteAssets,
    getMyAllCreations,
    getMyAllAuctions,
    getMyAllActivities,
    updateUserProfile,
    isUsernameAvailable
}
