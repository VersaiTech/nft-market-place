const User = require("../models/UserModel");
const Wallet = require("../models/WalletModel");
const Collection = require("../models/CollectionModel");
const Tx = require("../models/TransactionModel");
const NFT = require("../models/NFTModel");
const Auction = require("../models/AuctionModel");
const Events = require("../models/EventModel");
const Info = require("../models/InfoModel");

var increment = 1000;

/**
                * Get all NFTs available on the marketplace
                * @dev This controller retrieves all NFTs from the NFT model and removes the '_id' and 'createdAt' fields from the result
                * @route GET /nfts
                * @returns {Object} - An array of NFTs
                */

const getAllAssets = async (req, res) => {
    const chainId = req.query.chainId;
    try {
        const nfts = await NFT.find({networkId:chainId}, {
            _id: 0,
            createdAt: 0
        }).lean();
        if (! nfts) {
            return res.status(404).json({message: "NFTs not Found"});
        }
        return res.status(200).json({nfts:nfts});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};


/**
                * Get all NFTs that belong to a specific contract address
                * @dev This controller retrieves all NFTs from the NFT model that match the given contract address
                * @route GET /nfts/:nftaddress
                * @param {string} req.query.nftaddress - The contract address to filter NFTs by
                * @returns {Object} - An array of NFTs
                */

const getAssetsByAddress = async (req, res) => {
    const nftaddress = req.query.nftaddress;
    const chainId = req.query.chainId;
    try {
        const foundAssets = await NFT.find({
            address: nftaddress,networkId:chainId
        }, {
            _id: 0,
            createdAt: 0
        }).lean();
        if (! foundAssets) {
            return res.status(404).json({message: "NFTs not Found"});
        }
        return res.status(200).json({assets:foundAssets});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};


/**
                * Get a single collection by its category and name
                * @dev This controller retrieves a collection from the Collection model that matches the given category and name
                * @route GET /collections/category/:categoryname/:collectionaddress
                * @param {string} req.query.categoryname - The name of the category to filter collections by
                * @param {string} req.query.collectionaddress - The name of the collection to retrieve
                * @returns {Object} - The retrieved collection
                */

const getSingleCollectionofcategory = async (req, res) => {
    const categoryname = req.query.categoryname;
    const collection_address = req.query.collectionaddress;
    const chainId = req.query.chainId;
    try {
        const foundCollection = await Collection.find({
            category: categoryname,
            collection_address: collection_address,
            networkId:chainId
        }, {
            _id: 0,
            createdAt: 0
        }).lean();
        if (! foundCollection) {
            return res.status(404).json({message: "Collection not found"});
        }
        return res.status(200).json({collection:foundCollection});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

/**
                * Get all collections available on the marketplace
                * @dev This controller retrieves all collections from the Collection model
                * @route GET /collections
                * @returns {Object} - An array of collections
                */

const getAllCollections = async (req, res) => {
    const chainId = req.query.chainId;
    try {
        const Collections = await Collection.find({networkId:chainId}, {
            _id: 0,
            createdAt: 0
        }).lean();
        if (! Collections) {
            return res.status(404).json({message: "No Collections"});
        }
        return res.status(200).json({collection:Collections});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * Get a single collection by its name
                * @dev This controller retrieves a collection from the Collection model that matches the given name
                * @route GET /collections/:collectionaddress
                * @param {string} req.query.collectionaddress - The name of the collection to retrieve
                * @returns {Object} - The retrieved collection
                */


const getSingleCollection = async (req, res) => {
    const collectionaddress = req.query.collectionaddress;
    const chainId = req.query.chainId;
    var populateQuery = [{path:'items'},{path:'auctionItems'}];
    try {
        const foundCollection = await Collection.findOne({
            collection_address: collectionaddress,networkId:chainId
        }, {
            _id: 0,
            createdAt: 0
        }).populate(populateQuery).lean();
        if (! foundCollection) {
            return res.status(404).json({message: "Collection not Found"});
        }
        return res.status(200).json({collection:foundCollection});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};


/**
                * Get all collections that belong to a specific category
                * @dev This controller retrieves all collections from the Collection model that match the given category name
                * @route GET /collections/category/:categoryname
                * @param {string} req.query.categoryname - The name of the category to filter collections by
                * @returns {Object} - An array of collections
                */

const getAllcollectionsofCategory = async (req, res) => {
    const categoryname = req.query.categoryname;
    const chainId = req.query.chainId;
    try {
        const Collections = await Collection.find({
            category: categoryname,networkId:chainId
        }, {
            items:1,
            auctionItems:1
        }).populate("items").populate("auctionItems").lean();
        if (! Collections) {
            return res.status(404).json({message: "Collections not Found in this Category"});
        }
        return res.status(200).json({collection:Collections});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * Get a single NFT by its contract address and token ID
                * @dev This controller retrieves an NFT from the NFT model that matches the given contract address and token ID
                * @route GET /nfts/:nftaddress/:tokenid
                * @param {string} req.query.nftaddress - The contract address of the NFT to retrieve
                * @param {string} req.query.tokenid - The token ID of the NFT to retrieve
                * @returns {Object} - The retrieved NFT
                */

const getSingleAsset = async (req, res) => {
    const nftaddress = req.query.nftaddress;
    const tokenId = req.query.tokenid;
    const chainId = req.query.chainId;
	console.log(req.query);
    try {
        const foundAsset = await NFT.findOne({
            address: nftaddress,
            nftid: tokenId,
            networkId:chainId
        }, {
            _id: 0,
            createdAt: 0
        }).lean();
        console.log(foundAsset);
        const foundInfo = await Info.findOne({ 
            nftaddress: nftaddress,
            tokenid: tokenId,
            networkId:chainId});
        
        const foundAuction = await Auction.findOne({
            nftaddress: nftaddress,
            nftId: tokenId,
            networkId: chainId
        })
        if (! foundAsset) {
            return res.status(404).json({message: "NFT not Found"});
        }

        return res.status(200).json({assets:foundAsset, marketItemDetails: foundInfo, auctionItemDetails: foundAuction });
    } catch (err) {
	    console.log(err);
        return res.status(400).json({message: err.message});
    }
};

/**
                * @dev Retrieves all the owners of the NFTs in a single collection using the collection address
                * @route GET /collections/:nftaddress/owners
                * @param {Object} req - Express request object
                * @param {Object} res - Express response object
                * @returns {Object} Returns JSON object containing an array of NFT owners
                */


const getSingleCollectionOwners = async (req, res) => {
    const collection_address = req.query.collectionaddress;
    const chainId = req.query.chainId;
    try {
        const foundowners = await Collection.findOne({collection_address: collection_address,networkId:chainId}).populate({path: "items", select: "owner"});
        if (! foundowners) {
            return res.status(404).json({message: "Collection not Found"});
        }
        return res.status(200).json({owner:foundowners});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * @dev Retrieves all the assets owned by a specific wallet address
                * @route GET /assets/:walletaddress
                * @param {Object} req - Express request object
                * @param {Object} res - Express response object
                * @returns {Object} Returns JSON object containing an array of NFT assets
                */

const getMyAssets = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;
    try {
        const foundAssets = await NFT.find({networkId:chainId}).where("owner").equals(walletaddress);
        if (! foundAssets) {
            return res.status(404).json({message: "Assets not Found"});
        }
        return res.status(200).json({assets:foundAssets});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * @dev Retrieves a single NFT asset owned by a specific wallet address using the NFT address and token ID
                * @route GET /assets/:walletaddress/:nftaddress/:tokenid
                * @param {Object} req - Express request object
                * @param {Object} res - Express response object
                * @returns {Object} Returns JSON object containing the requested NFT asset
                */

const getMySingleAsset = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const nftaddress = req.query.nftaddress;
    const tokenId = req.query.tokenid;
    const chainId = req.query.chainId;
    try {

        const foundAsset = await Wallet.findOne({walletaddress: walletaddress}).populate({
            path: "collections",
            populate: {
                path: "items",
                match: {
                    address: nftaddress,
                    nftid: tokenId
                }
            }
        });
        var assets = [];
        for (var x = 0; x < foundAsset["collections"].length; x++) {
            var item = foundAsset["collections"][x]["items"];
            if (item.length > 0) 
                assets.push(... item);
        }
        if (! assets) {
            return res.status(404).json({message: "NFT not found"});
        }
        return res.status(200).json({assets:assets});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * @dev Creates a new NFT asset and adds it to a collection
                * @route POST /assets/:walletaddress
                * @param {Object} req - Express request object containing the NFT asset data
                * @param {Object} res - Express response object
                * @returns {Object} Returns JSON object containing the created NFT asset
                */

const createAssets = async (req, res) => {

    const walletaddress = req.query.walletaddress;
    const URI = req.body.URI;
    const extlink = req.body.extlink;
    const desc = req.body.desc;
    const collectionname = req.body.collectionname;
    const collection_address = req.body.collectionaddress;
    const traits = req.body.traits;
    const tokenId = req.body.tokenId;
    const creator = req.body.creator;
    const name = req.body.name;
    
    const chainId = req.query.chainId;
    try {
        const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
        if (! foundWallet) {
            return res.status(400).json({message: "Wallet not found"});
        }
        const foundCollection = await Collection.findOne({networkId:chainId,collection_address: collection_address});
        if (! foundCollection) {
            return res.status(400).json({message: "Collection not found"});
        }
        const newnft = new NFT({
            nftid: tokenId,
            name: name,
            descriptin: desc,
            networkId:chainId,
            metadata: URI,
            nfttype: "ERC721",
            externallink: extlink,
            price: null,
            available: false,
            traits: traits,
            address: foundCollection.collection_address,
            likes: null,
            views: null,
            owner: creator,
            state: "Inactive"
        });
        await newnft.save();
        const newEvent = new Events({
            event_type: "minted",
            from: "0x0000",
            to: creator,
            networkId:chainId,
            price: null,
            quantity: 1,
            eventTime: Date.now()
        });
        await newEvent.save();
        newnft.events.push(newEvent);
        await newnft.save();
        var current_count = foundCollection.items_present;
        foundCollection.items_present = current_count+1;
        foundCollection.items.push(newnft);
        await foundCollection.save();
        await foundWallet.save();
        const newInfo = new Info({
            itemid: null,
            nftaddress: foundCollection.collection_address,
            tokenid: tokenId,
            networkId:chainId,
            seller: null,
            owner: creator,
            price: null,
            state: "Inactive", 
        });
        await newInfo.save();
        return res.status(200).json({nft: newnft, event: newEvent, info: newInfo});
    } catch (err) {
        console.log(err);
        return res.status(400).json({message: err.message});
    }
};

/**

            @dev Creates a new collection for a given wallet address.
            @param {Object} req - The HTTP request object.
            @param {Object} res - The HTTP response object.
            @param {string} req.query.walletaddress - The wallet address for which the collection is being created.
            @param {string} req.body.name - The name of the collection.
            @param {string} req.body.symbol - The symbol for the collection.
            @param {string} req.body.royaltyrecipient - The wallet address of the royalty recipient for the collection.
            @param {string} req.body.description - The description of the collection.
            @param {string} req.body.collectionaddress - The address of the collection.
            @param {string} req.body.category - The category of the collection.
            @returns {Object} Returns a JSON object with a message indicating whether the collection was successfully created or not, and the new collection object.
            @throws {Object} Returns a JSON object with an error message if there was an error creating the collection.
            */


const createCollections = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const collectionname = req.body.collectionname;
    const symbol = req.body.symbol;
    const royaltyrecipient = req.body.royaltyrecipient;
    const description = req.body.description;
    const collection_address = req.body.collectionaddress;
    const category = req.body.category;
    const logoURI = req.body.logoURI;
    const featuredURI = req.body.featuredURI;
    const bannerURI = req.body.bannerURI;
    const URL = req.body.URL;
    const links = req.body.links;
    const chainId = req.query.chainId;
    const creator_earnings = req.body.creator_earnings;
    try {
        const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
        if (! foundWallet) {
            return res.status(404).json({message: "Wallet not Found"});
        }
        const foundCollection = await Collection.findOne({networkId:chainId,collection_address: collection_address});
        if (foundCollection) {
            return res.status(409).json({message: "Collection already Exists"});
        }
        const newcollection = new Collection({
            collection_logoURI: logoURI,
            collection_BannerURI: bannerURI,
            collection_FeaturedURI: featuredURI,
            collection_name: collectionname,
            collection_symbol: symbol,
            collection_recipient: royaltyrecipient,
            networkId:chainId,
            collection_desc: description,
            collection_address: collection_address,
            collection_URL: URL,
            collection_links: links,
            category: category,
            creation_date: Date.now(),
            creator_earnings: creator_earnings,
            items_present:0
        });
        await newcollection.save();
        foundWallet.collections.push(newcollection);
        await foundWallet.save();
        return res.status(200).json({message: "Collection Created", collection: newcollection})
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}
/**
                * Create a market item for a given NFT token
                * @dev Creates a market item on the marketplace contract with the given contract address, token ID, and price, updates the owner and price of the NFT in the database, and creates an event for the listing.
                * @param {string} req.query.walletaddress - The wallet address of the user creating the market item.
                * @param {string} req.query.nftaddress - The address of the NFT contract.
                * @param {string} req.query.tokenid - The ID of the NFT token.
                * @param {Object} req.body - The request body.
                * @param {string} req.body.price - The price of the NFT token in gwei.
                * @returns {Object} Returns a JSON object with a success message and the updated market item.
                * @throws {Error} Throws an error if the wallet address is not found or if there is an error creating the market item.
                * @route POST /market/create/:walletaddress/:nftaddress/:tokenid
                */

const createMarketItem = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const nftaddress = req.query.nftaddress;
    const tokenId = req.query.tokenid;
    const price = req.body.price;
    const owner = req.body.owner;
    const ItemId = req.body.ItemId;
    const seller = req.body.seller;
    //const startsAt = req.body.startTime;
    const duration = req.body.duration;
    const marketplaceaddress = req.body.marketplaceaddress;
    const chainId = req.query.chainId;
    try {
        const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
        if (! foundWallet) {
            return res.status(404).json({message: "Wallet Not found!"});
        }
        const newmarketitem = await NFT.updateOne({
            address: nftaddress,
            nftid: tokenId,
            networkId:chainId
        }, {
            $set: {
                price: price,
                owner: marketplaceaddress,
                state: "CreatedAtMarketplace",
                available: true
            }
        })
        const newEvent = new Events({
            event_type: "listed",
            from: owner,
            to: marketplaceaddress,
            networkId:chainId,
            price: price,
            quantity: 1,
            eventTime: Date.now()
        });
        await newEvent.save();
        const foundnft = await NFT.findOne({networkId:chainId,address: nftaddress, nftid: tokenId});
        foundnft.events.push(newEvent);
        await foundnft.save();
        const result = await Info.updateOne({
            nftaddress: nftaddress,
            tokenid: tokenId,
            networkId:chainId
        }, {
            $set: {
                itemid: ItemId,
                seller: seller,
                price: price,
                owner: marketplaceaddress,
                state: "Created",
                startsAt: Date.now(),
                duration: duration
            }
        });
        const info = await Info.findOne({             
            nftaddress: nftaddress,
            tokenid: tokenId,
            networkId:chainId});
        return res.status(200).json({message: "Market item created",marketItem:info});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * Transfer an NFT token from one wallet address to another
                * @dev Transfers the NFT token with the given contract address and token ID from the sender's wallet to the receiver's wallet, updates the owner of the NFT in the database, and creates an event for the transfer.
                * @param {string} req.query.walletaddress - The wallet address of the sender.
                * @param {string} req.query.nftaddress - The address of the NFT contract.
                * @param {string} req.query.tokenid - The ID of the NFT token.
                * @param {Object} req.body - The request body.
                * @param {string} req.body.receiveraddress - The wallet address of the receiver.
                * @returns {Object} Returns a JSON object with a success message.
                * @throws {Error} Throws an error if the wallet address is not found or if there is an error transferring the NFT token.
                * @route POST /nft/transfer/:walletaddress/:nftaddress/:tokenid
                */

const transferAssets = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const nftaddress = req.query.nftaddress;
    const tokenId = req.query.tokenid;
    const receiveraddress = req.body.receiveraddress;
    const chainId = req.query.chainId;
    try {
        const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
        if (! foundWallet) {
            return res.status(404).json({message: "Wallet not Found"});
        }
        await NFT.updateOne({
            address: nftaddress,
            nftid: tokenId,
            networkId:chainId
        }, {
            $set: {
                owner: receiveraddress
            }
        })
        const newEvent = new Events({event_type: "transfer", from: walletaddress, to: receiveraddress, networkId:chainId,quantity: 1,eventTime: Date.now()});
        await newEvent.save();
        const foundnft = await NFT.findOne({networkId:chainId,address: nftaddress, nftid: tokenId});
        foundnft.events.push(newEvent);
        await foundnft.save();
        await Info.updateOne({
            address: nftaddress,
            tokenid: tokenId,
            networkId:chainId
        }, {
            $set: {
                seller: walletaddress,
                owner: receiveraddress,
                state: "CreatedAtMarketplace"
            }
        });
        return res.status(200).json({message: "NFT succesfully transferred"});

    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**
                * Buy an NFT token from the marketplace
                * @dev Buys the NFT token with the given contract address and token ID from the marketplace contract, updates the owner and price of the NFT in the database, and creates an event for the sale.
                * @param {string} req.query.walletaddress - The wallet address of the buyer.
                * @param {string} req.query.nftaddress - The address of the NFT contract.
                * @param {string} req.query.tokenid - The ID of the NFT token.
                * @returns {Object} Returns a JSON object with a success message and the updated owner and price of the NFT.
                * @throws {Error} Throws an error if the wallet address is not found, the NFT is not found, or there is an error buying the NFT token.
                * @route POST /market/buy/:walletaddress/:nftaddress/:tokenid
                */

const buyAssets = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const nftaddress = req.query.nftaddress;
    const tokenId = req.query.tokenid;
    const Buyer = req.body.Buyer;
    const ItemId = req.body.itemid;
    const Price = req.body.price;
    const Seller = req.body.seller;
    const chainId = req.query.chainId;
    try {
        const foundnft = await NFT.findOne({networkId:chainId,address: nftaddress, nftid: tokenId});
        if (! foundnft) {
            return res.status(404).json({message: "NFT not Found"});
        }
        var foundInfo = await Info.findOne({networkId:chainId,nftaddress: nftaddress, tokenid: tokenId});
        if (ItemId == foundInfo.itemid && Seller == foundnft.owner && Buyer == walletaddress) {
            await NFT.updateOne({
                address: nftaddress,
                nftid: tokenId,
                networkId:chainId
            }, {
                $set: {
                    owner: Buyer,
                    price: Price,
                    available: false,
                    state:"SoldAtMarketplace"
                }
            })
            const newEvent = new Events({event_type: "sale", from: Seller, to: Buyer,networkId:chainId, quantity: 1,eventTime: Date.now()});
            await newEvent.save();
            console.log(newEvent);
            foundnft.events.push(newEvent);
            await foundnft.save();
            const result=await Info.updateOne({
                itemid:ItemId
            }, {
                $set: {
                    owner: Buyer,
                    price: Price, 
                    state: "Sold"
                }
            });
            console.log(result);
             foundInfo = await Info.findOne({itemid:ItemId});
            //const wallet = await Wallet.findOne({walletaddress:walletaddress});

            //await foundInfo.save();
            return res.status(200).json({message: "Market item Saled", marketitem: foundInfo});
        }
        return res.status(400).json({message: "ItemId not Matched"});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

/**

        @dev Retrieves all assets owned by a wallet address.
        @param {string} req.query.walletaddress - The wallet address of the owner.
        @returns {Array} An array of objects representing the NFT assets owned by the wallet address.
        @throws {Error} If the request fails for any reason.
        */

const getMyAllAssets = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;    
    try {
        const foundAssets = await NFT.find({networkId:chainId}, {
            _id: 0,
            createdAt: 0
        }).where("owner").equals(walletaddress);
        if (! foundAssets) {
            return res.status(404).json({message: "Assets not Found"});
        }
        return res.status(200).json({assets:foundAssets});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

        @dev Retrieves all collections owned by a wallet address.
        @param {string} req.query.walletaddress - The wallet address of the owner.
        @returns {Array} An array of objects representing the NFT collections owned by the wallet address.
        @throws {Error} If the request fails for any reason.
        */

const getMyAllCollections = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const chainId = req.query.chainId;
    console.log(chainId, walletaddress);
    try {
        const Collections = await Wallet.findOne({
            walletaddress: walletaddress,
        }, {
            _id: 0,
            createdAt: 0
        }).populate({path: 'collections',
        match: {
            networkId: chainId
        }});
        console.log(Collections);
        if (! Collections) {
            return res.status(404).json({message: "Collections not Found"});
        }
        return res.status(200).json({collection:Collections["collections"]});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

        @dev Retrieves a single NFT collection owned by a wallet address.
        @param {string} req.query.walletaddress - The wallet address of the owner.
        @param {string} req.query.collectionaddress - The name of the NFT collection to retrieve.
        @returns {Object} An object representing the NFT collection owned by the wallet address.
        @throws {Error} If the request fails for any reason.
        */

const getMySingleCollection = async (req, res) => {
    const walletaddress = req.query.walletaddress;
    const collection_address = req.query.collectionaddress;
    const chainId = req.query.chainId;
    try {
        const foundCollection = await Wallet.findOne({walletaddress: walletaddress}).populate({
            path: 'collections',
            match: {
                collection_address: collection_address,
                networkId: chainId
            }
        });
        if (! foundCollection) {
            return res.status(404).json({message: "Collection not found"});
        }
        return res.status(200).json({collection:foundCollection});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

                @dev Get assets with a high price.
                @route GET /assets/high-price
                @returns {Object} A JSON object containing the message "validated" with a 200 status code if successful.
                @throws {Object} A JSON object containing an error message with a 404 status code if unsuccessful.
                */

const getAssetsByHighPrice = async (req, res) => {
    const chainId = req.query.chainId;
    try {
        const foundAssets = await NFT.find({networkId:chainId}).sort({price: -1}).limit(20);
        if (! foundAssets) {
            return res.status(404).json({message: "No NFTs Found"});
        }
        return res.status(200).json({assets:foundAssets});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

        Get all categories
        @dev Retrieves all categories from the database
        @returns Returns an array of categories
        */

const getAllCategories = async (req, res) => {
    try {
        const Categories = await Collection.find();
        if (! Categories) {
            return res.status(404).json({message: "No Categories added"});
        }
        return res.status(200).json({category:Categories});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

        Get auctions of a specific wallet address
        @dev Retrieves auctions where the wallet address is the seller from the database
        @param {string} req.query.walletaddress - The wallet address to retrieve auctions for
        @returns Returns an array of auctions
        */

const getMyAuction = async (req, res) => {
  const walletaddress=req.query.walletaddress;
  const chainId = req.query.chainId;
    try {
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress}, {
        _id: 0,
        createdAt: 0
    });
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      const Categories = await Collection.find({seller:walletaddress, networkId:chainId});
      if (! Categories) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({category:Categories});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};

 /**

                    Start an auction
                    @dev Starts an auction of a specific type (English or Dutch)
                    @param {string} req.body.type - The type of auction to start
                    @returns Returns a message indicating that the auction has started
                    */
const startAuction = async (req, res) => {
  const {type} = req.body;
  try {
      if (type === "English") 
          await startEnglishAuction(req, res);
       else 
          await startDutchAuction(req, res);
      
  } catch (err) {
    return res.status(404).json({message: err.message});
  }

}
/**

                    Start a Dutch auction
                    @dev Starts a Dutch auction for a specific NFT
                    @param {string} req.query.walletaddress - The wallet address of the seller
                    @param {string} req.query.nftaddress - The address of the NFT to auction
                    @param {string} req.query.tokenId - The ID of the NFT to auction
                    @param {number} req.body.startingPrice - The starting price of the auction
                    @param {number} req.body.minimumPrice - The minimum price of the auction
                    @param {number} req.body.duration - The duration of the auction
                    @param {string} req.body._bidId - The ID of the bid
                    @param {string} req.body.auctionAddress - The address of the auction
                    @returns Returns a message indicating that the auction has started, the auction object, and the collection object
                    */
const startDutchAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;
  const {
      startingPrice,
      minimumPrice,
      duration,
      _bidId,
      auctionAddress
  } = req.body;
  try {
      
    const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
    if (! foundWallet) {
      return res.status(404).json({message: err.message});
    }

    const auction = new Auction({
        auctionid: _bidId,
        nftaddress: nftaddress,
        nftId: tokenId,
        auctiontype: "English",
        startsat: Date.now(),
        owner: auctionAddress,
        endsat: new Date(parseInt(Date.now()) + parseInt(duration)),
        startPrice: startingPrice,
        seller: walletaddress,
        currentPrice: startingPrice,
        state: "Created",
        networkId: chainId
    });
      await Info.deleteOne({nftaddress:nftaddress,tokenid:tokenId,networkId:chainId});
      
      const updatedNFT = await NFT.updateOne({
          address: nftaddress,
          nftid: tokenId,
          networkId: chainId
      },{
          $set:{
              owner: auctionAddress,
              available: true,
              price: startingPrice,
              state:"CreatedAtAuction"
          }
      })

      const foundCollection = await Collection.findOne({collection_address:nftaddress, networkId: chainId}, {
        _id: 0,
        createdAt: 0
    });
      if (! foundCollection) {
        return res.status(404).json({message: err.message});
    }

      const newEvent = new Events({
          event_type: "auctioned",
          from: walletaddress,
          to: auctionAddress,
          price: startingPrice,
          quantity: 1,
          networkId: chainId,
          eventTime: Date.now()
      });
      await newEvent.save();
      const foundnft = await NFT.findOne({address: nftaddress, nftid: tokenId, networkId: chainId});
      if(!foundnft)
      {
        return res.status(404).json({message:"NFT not found"});
      }
      foundnft.events.push(newEvent);
      await foundnft.save();

      foundCollection.auctionItems.push(auction);
      foundCollection.save();
      return res.status(200).json({success: "Auction Started", auction: auction, collection: foundCollection});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }

}

/**

                    Starts an English auction for an NFT
                    @dev This function creates a new English auction and updates the NFT's owner and availability in the database.
                    @param {string} req.query.walletaddress - The wallet address of the user starting the auction.
                    @param {string} req.query.nftaddress - The address of the NFT's smart contract.
                    @param {string} req.query.tokenId - The ID of the NFT.
                    @param {number} req.body.startingPrice - The starting price of the auction.
                    @param {number} req.body.duration - The duration of the auction in milliseconds.
                    @param {string} req.body._bidId - The ID of the auction.
                    @param {string} req.body.auctionAddress - The address of the auction contract.
                    @returns {object} JSON object containing the success message, created auction object, and updated collection object.
                    @throws {object} JSON object containing the error message if an error occurs.
                    */
const startEnglishAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;
  const {
      startingPrice,
      duration,
      _bidId,
      auctionAddress
  } = req.body;
  try {
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      await Info.deleteOne({nftaddress:nftaddress,tokenid:tokenId,networkId:chainId});
      const auction = new Auction({
          auctionid: _bidId,
          nftaddress: nftaddress,
          nftId: tokenId,
          auctiontype: "English",
          startsat: Date.now(),
          owner: auctionAddress,
          endsat: new Date(parseInt(Date.now()) + parseInt(duration)),
          startPrice: startingPrice,
          seller: walletaddress,
          currentPrice: startingPrice,
          state: "Created",
          networkId: chainId
      });
      await auction.save();
      const updatedNFT = await NFT.updateOne({
          address: nftaddress,
          nftid: tokenId,
          networkId: chainId
      },{
          $set:{
              owner: auctionAddress,
              available: true,
              price: startingPrice,
              state:"CreatedAtAuction"
          }
      })
      const foundCollection = await Collection.findOne({collection_address:nftaddress, networkId: chainId}, {
        _id: 0,
        createdAt: 0
    });
      if (! foundCollection) {
        return res.status(404).json({message: err.message});
        }
      const newEvent = new Events({
          event_type: "auctioned",
          from: walletaddress,
          to: auctionAddress,
          price: startingPrice,
          quantity: 1,
          networkId: chainId,
          eventTime: Date.now()
      });
      await newEvent.save();
      const foundnft = await NFT.findOne({address: nftaddress, nftid: tokenId, networkId: chainId});
      if(!foundnft)
      {
        return res.status(404).json({message:"NFT not found"});
      }
      foundnft.events.push(newEvent);
      await foundnft.save();
      foundCollection.auctionItems.push(auction);
      foundCollection.save();
      return res.status(200).json({success: "Auction Started", auction: auction, collection: foundCollection});
  } catch (err) {
    console.log(err);
    return res.status(400).json({message: err.message});
  }

}

 /**

                    Ends an auction and transfers ownership of the NFT to the highest bidder.
                    @dev This function updates the auction's winner, highest bid, current price, and owner in the database, as well as updates the NFT's owner and price.
                    @param {string} req.query.walletaddress - The wallet address of the user ending the auction.
                    @param {string} req.query.nftaddress - The address of the NFT's smart contract.
                    @param {string} req.query.tokenId - The ID of the NFT.
                    @param {string} req.body._bidId - The ID of the auction.
                    @param {string} req.body._winner - The wallet address of the auction winner.
                    @param {number} req.body._winningBid - The winning bid amount.
                    @returns {object} JSON object containing the success message.
                    @throws {object} JSON object containing the error message if an error occurs.
                    */
const endAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;
  const {_bidId, _winner, _winningBid} = req.body;
  try { 
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
          return res.status(404).json({message: err.message});
      }

      const result = await Auction.updateOne({
          auctionid: _bidId,
          networkId: chainId
      }, {
          $set: {
              winner: _winner,
              highestbid: Number(_winningBid),
              currentPrice: _winningBid,
              owner: _winner,
              isCompleted: true,
              state: "Sold"
          }
      })
      
      const updatedNFT = await NFT.updateOne({
          address:nftaddress,
          nftid:tokenId,
          networkId: chainId
      },
      {
          $set:{
              owner: _winner,
              price: _winningBid,
              state: "SoldAtAuction"
          }
      })

      const newEvent = new Events({event_type:"sale",from: result.seller,to: _winner,quantity: 1,price: _winningBid,networkId: chainId,eventTime: Date.now()});
      await newEvent.save();
      const foundnft = await NFT.findOne({address: nftaddress, nftid: tokenId, networkId: chainId});
      if(!foundnft)
      {
        return res.status(404).json({message:"NFT not found"});
      }
      foundnft.events.push(newEvent);
      await foundnft.save();
      return res.status(200).json({message: "Auction Ended Sucessfully"});
  } catch (err) {
      return res.status(400).json({message: err.message});
  }
}

/**

                    Bids on an auction.
                    @dev This function determines the type of auction and calls the corresponding bid function.
                    @param {string} req.body.type - The type of auction (e.g. "English").
                    @returns {object} JSON object containing the success message.
                    @throws {object} JSON object containing the error message if an error occurs.
                    */

const bidAuction = async (req, res) => {
  const {type} = req.body;
  try {
      if (type === "English") 
          await bidEnglishAuction(req, res);
       else 
          await endAuction(req, res);
      
  } catch (err) {
    return res.status(404).json({message: err.message});
  }

}
/**

                    Bids on an English auction.
                    @dev This function updates the auction's winner, highest bid, and current price in the database.
                    @param {string} req.query.walletaddress - The wallet address of the user making the bid.
                    @param {string} req.query.nftaddress - The address of the NFT's smart contract.
                    @param {string} req.query.tokenId - The ID of the NFT.
                    @param {string} req.body._bidId - The ID of the auction.
                    @param {string} req.body._currentHighestBidder - The wallet address of the current highest bidder.
                    @param {number} req.body._currentHighestBid - The current highest bid amount.
                    @returns {object} JSON object containing the success message.
                    @throws {object} JSON object containing the error message if an error occurs.
                    */
const bidEnglishAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;

  const {_bidId, _currentHighestBidder, _currentHighestBid} = req.body;
  try { 
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      const result = await Auction.updateOne({
          auctionid: _bidId,
          networkId: chainId
      }, {
          winner: _currentHighestBidder,
          highestbid: Number(_currentHighestBid),
          currentPrice: Number(_currentHighestBid),
          isCompleted: false
      },)
      if (result) {
        return res.status(200).json({message: "Auction Bided Sucessfully and database updated"})
      } else {
        return res.status(404).json({message: err.message});
      }

  } catch (err) {
    return res.status(400).json({message: err.message});
  }

}

/**

                    @dev Function to handle requests related to price updates and auctions.
                    @param {Object} req - The HTTP request object.
                    @param {Object} res - The HTTP response object.
                    @param {string} req.query.walletaddress - The wallet address of the user making the request.
                    @param {string} req.query.nftaddress - The address of the NFT being auctioned.
                    @param {string} req.query.tokenId - The ID of the NFT being auctioned.
                    @param {string} req.body.type - The type of auction being used (e.g. "English" or "Dutch").
                    @returns {Object} An HTTP response object indicating the status of the request.
                    */


const priceAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId} = req.query;

  const {type} = req.body;
  try {
      if (type === "English") 
          await getPriceAndBidderAuction(req, res);
       else 
          await priceDutchAuction(req, res);
      
  } catch (err) {
    return res.status(404).json({message: err.message});
  }

}

/**

                    @dev Function to update the price of an NFT being auctioned using the Dutch auction mechanism.
                    @param {Object} req - The HTTP request object.
                    @param {Object} res - The HTTP response object.
                    @param {string} req.query.walletaddress - The wallet address of the user making the request.
                    @param {string} req.query.nftaddress - The address of the NFT being auctioned.
                    @param {string} req.query.tokenId - The ID of the NFT being auctioned.
                    @param {string} req.body.bidId - The ID of the auction being updated.
                    @param {string} req.body._currentPrice - The updated current price of the auction.
                    @returns {Object} An HTTP response object indicating the price update was successful and the database was updated.
                    */

const priceDutchAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;
  const {bidId, _currentPrice} = req.body;
  try { 
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      const result = await Auction.updateOne({
          auctionid: bidId,
          networkId: chainId
      }, {
          currentPrice: _currentPrice
      },)
      const updatednft = await NFT.updateOne({address:nftaddress,nftid:tokenId,networkId: chainId}
          ,{
              price:_currentPrice
          })
      
          return res.status(200).json({message: "Price Updated Sucessfully and database updated"});  
  } catch (err) {
    return res.status(404).json({message: err.message});
  }

}
 /**

                    @dev Function to get the current price and highest bidder of an auction.
                    @param {Object} req - The HTTP request object.
                    @param {Object} res - The HTTP response object.
                    @param {string} req.query.walletaddress - The wallet address of the user making the request.
                    @param {string} req.query.nftaddress - The address of the NFT being auctioned.
                    @param {string} req.query.tokenId - The ID of the NFT being auctioned.
                    @param {string} req.body.bidId - The ID of the auction being queried.
                    @returns {Object} An HTTP response object containing the current price and highest bidder of the auction.
                    */
const getPriceAndBidderAuction = async (req, res) => {
  const {walletaddress, nftaddress, tokenId, chainId} = req.query;

  const {bidId} = req.body;
  try {
      const auction = await Auction.findOne({auctionid: bidId,networkId: chainId});
      if (! auction) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({message: "Successfully Fetched", auctionid: bidId, price: auction.currentPrice, currentHighestBidder: auction.winner});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }

}

 /**

                    @dev Function to fetch all auctions in the database.
                    @param {Object} req - The HTTP request object.
                    @param {Object} res - The HTTP response object.
                    @returns {Object} An HTTP response object containing all auctions in the database.
                    */

const getAuctions = async (req, res) => {
    const {chainId} = req.query;
      try {
      const auctions = await Auction.find({networkId: chainId, isCompleted:false}, {
        _id: 0,
        createdAt: 0
    });
      if (!auctions) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({auction:auctions});
  } catch (err) {
    return res.status(400).json({message: err.message}); 
  }
}

/**

                    @dev Function to fetch a single auction by ID from the database.
                    @param {Object} req - The HTTP request object.
                    @param {Object} res - The HTTP response object.
                    @param {string} req.query.id - The ID of the auction to fetch.
                    @returns {Object} An HTTP response object containing the fetched auction.
                    */

const getSingleAuction = async (req, res) => {
  const {id,chainId} = req.query;
  try {
      const auction = await Auction.findOne({auctionid: id,networkId: chainId}, {
        _id: 0,
        createdAt: 0
    });
      if (! auction) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({auction:auction});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
}

 /**

                    @dev Retrieves all auctions belonging to a specific wallet address
                    @param {Object} req - Express request object
                    @param {Object} req.query - Parameters object containing wallet address
                    @param {string} req.query.walletaddress - Wallet address to search auctions for
                    @param {Object} res - Express response object
                    @returns {Object} JSON response containing array of auctions belonging to wallet address
                    */

const getMyAllAuctions = async (req, res) => {
  const {walletaddress,chainId} = req.query;
  try {
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      const auctions = await Auction.find({seller: walletaddress,networkId: chainId}, {
        _id: 0,
        createdAt: 0
    });
      if (! auctions) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({auctions:auctions});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
}

/**

                    @dev Retrieves a single auction belonging to a specific wallet address
                    @param {Object} req - Express request object
                    @param {Object} req.query - Parameters object containing wallet address and auction ID
                    @param {string} req.query.walletaddress - Wallet address to search for auction under
                    @param {string} req.query.id - Auction ID to retrieve
                    @param {Object} res - Express response object
                    @returns {Object} JSON response containing auction object belonging to wallet address
                    */

const getMySingleAuction = async (req, res) => {
  const {walletaddress,id,chainId} = req.query;
  try {
      const foundWallet = await Wallet.findOne({walletaddress: walletaddress});
      if (! foundWallet) {
        return res.status(404).json({message: err.message});
      }
      const auction = await Auction.findOne({auctionid: id,networkId: chainId}, {
        _id: 0,
        createdAt: 0
    });
      if (! auction) {
        return res.status(404).json({message: err.message});
      }
      return res.status(200).json({auction: auction});
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
}
/**

                    @dev Retrieves information about an NFT item
                    @param {Object} req - Express request object
                    @param {Object} req.query - Parameters object containing collection address and token ID
                    @param {string} req.query.collectionaddress - Collection address of NFT item to retrieve
                    @param {string} req.query.tokenid - Token ID of NFT item to retrieve
                    @param {Object} res - Express response object
                    @returns {Object} JSON response containing information about the specified NFT item
                    */
const getItemInfo = async (req, res) => {
    const collectionaddress = req.query.collectionaddress;
    const tokenid = req.query.tokenid;
    const chainId = req.query.chainId;
    try {
        const foundInfo = await Info.findOne({nftaddress:collectionaddress,tokenid:tokenid, networkId: chainId}, {
            _id: 0,
            createdAt: 0
        });
        if (! foundInfo) {
            return res.status(404).json({message: "Not Found"});
        }
      return  res.status(200).json({info:foundInfo});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
};

/**

            @dev Function to retrieve all collections of a given category for a specific wallet address.
            @param {object} req - Express request object.
            @param {object} res - Express response object.
            @param {string} req.query.walletaddress - Wallet address of the user.
            @param {string} req.query.categoryname - Category name of the collections to retrieve.
            @return {object} - Returns an object containing all collections of the given category for the specified wallet address.
            @throws {object} - Returns an error message if an error occurs while retrieving the collections.
            */

            const getMyCollectionsByCategory = async (req, res) => {
                const walletaddress = req.query.walletaddress;
                const categoryname = req.query.categoryname;
                console.log(walletaddress, categoryname);
                try {
                    const foundCollections = await Wallet.find({walletaddress: walletaddress}).populate("collections").where("category").equals(categoryname);
                    if (! foundCollections) {
                        return res.status(404).json({message: "Collection not found"});
                    }
                    return res.status(200).json({collection:foundCollections});
                } catch (err) {
                    return res.status(400).json({message: err.message});
                }
            }

            /**

            @dev Function to retrieve a specific collection of a given category for a specific wallet address.
            @param {object} req - Express request object.
            @param {object} res - Express response object.
            @param {string} req.query.walletaddress - Wallet address of the user.
            @param {string} req.query.categoryname - Category name of the collection to retrieve.
            @param {string} req.query.collectionaddress - Name of the collection to retrieve.
            @return {object} - Returns an object containing the specified collection of the given category for the specified wallet address.
            @throws {object} - Returns an error message if an error occurs while retrieving the collection.
            */

            const getMySingleCollectionByCategory = async (req, res) => {
                const walletaddress = req.query.walletaddress;
                const categoryname = req.query.categoryname;
                const collection_address = req.query.collectionaddress;

                try {
                    const foundCollection = await Wallet.findOne({walletaddress: walletaddress}).populate({
                        path: "collections",
                        match: {
                            collection_address: collection_address,
                            category: categoryname
                        }
                    });
                    if (! foundCollection) {
                        return res.status(404).json({message: "Collection not found"});
                    }
                    return res.status(200).json({collection:foundCollection["collections"][0]});
                } catch (err) {
                    return res.status(400).json({message: err.message});
                }
            }

        const getMyCollectedItems = async(req,res)=>{
            const walletaddress = req.query.walletaddress;
            const chainId = req.query.chainId;
            try{
                const foundInfo = await Info.find({owner:walletaddress, state:"Sold"});
                if(!foundInfo)
                {
                    return res.status(404).json({message: "Nothing buyed yet"});
                }
                var foundItems =[];
                for(var i=0;i<foundInfo.length;i++)
                {
                    var foundNFTs = await NFT.findOne({address: foundInfo[i].nftaddress, nftid: foundInfo[i].tokenid,networkId: chainId});
                    foundItems.push(foundNFTs);
                }
                
                return res.status(200).json({message:"Buyed Items",assets:foundItems});

            } catch(err) {
                //console.log(err);
                return res.status(400).json({message:err.message});
            }
        }

        const getFavorites = async(req,res) =>{
            const walletaddress = req.query.walletaddress;
            const chainId = req.query.chainId;
            const nftaddress = req.query.nftaddress;
            const tokenId = req.query.tokenId;

            try{
                if(walletaddress)
                {
                    const liked_nfts = await Wallet.findOne({walletaddress:walletaddress},{liked_nfts:1}).populate({path:"liked_nfts",match:{networkId:chainId}});
                    return res.status(200).json({assets:liked_nfts});
                }
                else{
                    const users_like = await NFT.findOne({address:nftaddress,nftid:tokenId,networkId:chainId},{users_like:1}).populate({path:"users_like",select:"walletaddress"});
                    return res.status(200).json({users:users_like});
                }
            } catch(err){
                return res.status(404).json({message:err.message});
            }
        }

        const updateLikes = async(req,res)=>{
            const value = req.body.value;
            const walletaddress = req.query.walletaddress;
            const nftaddress = req.query.nftaddress;
            const tokenId = req.query.tokenId;
            const chainId = req.query.chainId;

            try{
                const wallet = await Wallet.findOne({walletaddress:walletaddress});
                const nft = await NFT.findOne({address:nftaddress,nftid:tokenId,networkId:chainId});
                if(value=="1")
                {
                    wallet.liked_nfts.unshift(nft);
                    nft.users_like.unshift(wallet);
                }
                else{
                    wallet.liked_nfts = wallet.liked_nfts.filter(
                        (id) =>  id.toString() !== nft['_id'].toString()
                      );

                      nft.users_like = nft.users_like.filter(
                        (id) => id.toString() !== wallet['_id'].toString()
                      );
                    
                }
                await wallet.save();
                await nft.save();
                return res.status(200).json({message:"Liked Update Successful"});
            } catch(err) {
                console.log(err);
                return res.status(400).json({message:err.message});
            }

        }

        const getNftWithDetails = async(req,res)=>{
            const walletaddress = req.query.walletaddress;
            const nftaddress = req.query.nftaddress;
            const tokenId = req.query.tokenId;
            const chainId = req.query.chainId;

            try{
                if(walletaddress){
                    const wallet = await Wallet.findOne({walletaddress:walletaddress});
                    if(!wallet){
                        return res.status(404).json({message:"Wallet not found!!"});
                    }

                    if(nftaddress && tokenId){
                        const nft = await NFT.findOne({address:nftaddress,nftid:tokenId,networkId:chainId}).populate("events").populate("users_like");
                        if(!nft){
                            return res.status(404).json({message:"NFT not found"});
                        }
                        if(nft.state=="CreatedAtAuction" || nft.state=="SoldAtAuction")
                        {
                            const auctionDetails = await Auction.findOne({nftaddress:nftaddress,nftId:tokenId,networkId:chainId});
                            return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: auctionDetails});
                        }
                        else if(nft.state=="CreatedAtMarketplace" || nft.state=="SoldAtMarketplace")
                        {
                            const infoDetails = await Info.findOne({nftaddress:nftaddress,tokenid:tokenId,networkId:chainId});
                            return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: infoDetails});
                        }

                        return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: null});

                    }
                    else{
                        const nft = await Wallet.find({walletaddress:walletaddress}).populate({path:"collections",populate:"items"});
                        if(!nft){
                            return res.status(404).json({message:"NFT not found"});
                        }
                        
                        return res.status(200).json({message:"Found NFT",assets:nft});    
                    }
                    
                }
                else{
                    if(nftaddress && tokenId){
                        const nft = await NFT.findOne({address:nftaddress,nftid:tokenId,networkId:chainId}).populate("events").populate("users_like");

                        if(!nft){
                            return res.status(404).json({message:"NFT not found"});
                        }

                        if(nft.state=="CreatedAtAuction" || nft.state=="SoldAtAuction")
                        {
                            const auctionDetails = await Auction.findOne({nftaddress:nftaddress,nftId:tokenId,networkId:chainId});
                           // console.log(auctionDetails);
                            return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: auctionDetails});
                        }
                        else if(nft.state=="CreatedAtMarketplace" || nft.state=="SoldAtMarketplace")
                        {
                            const infoDetails = await Info.findOne({nftaddress:nftaddress,tokenid:tokenId,networkId:chainId});
                            return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: infoDetails});
                        }

                        return res.status(200).json({message:"Found NFT",assets:nft, listingDetails: null});

                    }
                    else{
                        const nft = await NFT.find({networkId:chainId});
                        if(!nft){
                            return res.status(404).json({message:"NFT not found"});
                        }
                        return res.status(200).json({message:"Found NFT",assets:nft});    
                    }
                }
            }  catch(err) {
                res.status(400).json({message:err.message});
        }
     }

     const searchAPI = async (req, res) => {
        try {
          const query = req.query.key; 
      
          const nfts = await NFT.find({
            $or: [
              { nftid: { $regex: query, $options: 'i' } },
              { name: { $regex: query, $options: 'i' } },
              //{ price: { $regex: query, $options: 'i' } },
              { address: { $regex: query, $options: 'i' } },
              { owner: { $regex: query, $options: 'i' } },
              //{ networkId: { $regex: query, $options: 'i' } },
              //{ likes: { $regex: query, $options: 'i' } },
              { nfttype: { $regex: query, $options: 'i' } },
            ],
          });
      
          const users = await User.find({
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ],
          });
      
          const wallets = await Wallet.find({
            $or: [
              { walletaddress: { $regex: query, $options: 'i' } },
              //{ networkId: { $regex: query, $options: 'i' } },
            ],
          });
           
          const collections = await Collection.find({
            $or: [
              { collection_name: { $regex: query, $options: 'i' } },
              //{ networkId: { $regex: query, $options: 'i' } },
              { collection_address: { $regex: query, $options: 'i' } },
              { category: { $regex: query, $options: 'i' } },
              { collection_symbol: { $regex: query, $options: 'i' } },
            ],
          });

          const searchResults = [...nfts, ...users, ...wallets,...collections];
      
        return  res.status(200).json({results:searchResults});
        } catch (error) {
          res.status(400).send({message:error.message});
        }
      };

module.exports = {
    searchAPI,
    getNftWithDetails,
    getFavorites,
    updateLikes,
    buyAssets,
    getItemInfo,
    getMyCollectedItems,
    getMyAllAuctions,
    getAllCategories,
    getAssetsByHighPrice,
    getAllAssets,
    getAssetsByAddress,
    getSingleAsset,
    getMySingleCollection,
    getMyAllAssets,
    getMyAllCollections,
    getSingleCollectionOwners,
    getMyAssets,
    getMySingleAsset,
    createAssets,
    getSingleCollectionofcategory,
    getAllCollections,
    createCollections,
    getSingleCollection,
    getAllcollectionsofCategory,
    getMySingleCollectionByCategory,
    getMyCollectionsByCategory,
    getAssetsByHighPrice,
    createMarketItem,
    transferAssets,
    getMyAuction,
    startAuction,
     endAuction,
bidAuction,
priceAuction,
getSingleAuction, 
getAuctions,
getMySingleAuction
};
