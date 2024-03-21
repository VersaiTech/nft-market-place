// export const BASEAPI_PATH = 'https://api-marketplace.coinwiz.com'; //prod
// export const BASEAPI_PATH = process.env.BASEAPI_PATH;
// export const BASEAPI_PATH = "165.22.218.54:9000";
export const BASEAPI_PATH = "https://backend.coinwiz.in"
// export const BASEAPI_PATH = "http://127.0.0.1:9000";
// export const BASEAPI_PATH = 'http://127.0.0.1:8080';

export const API_ROUTES = {
  LOGIN: BASEAPI_PATH + '/account/api/Userlogin',
  REGISTER: BASEAPI_PATH + '/account/api/UserRegister',
  CREATE_COLLECTION: BASEAPI_PATH + '/assets/api/CreateCollection',
  GET_USER_COLLECTION: BASEAPI_PATH + '/assets/api/UserAllCollections',
  GET_SINGLE_COLLECTION: BASEAPI_PATH + '/assets/api/SingleCollection',
  GET_ALL_MARKETPLACE_ASSET: BASEAPI_PATH + '/assets/api/AllAssets',
  GET_NFT_BY_CATEGORY: BASEAPI_PATH + '/assets/api/AllCollectionsofCategory',
  CREATE_ASSET: BASEAPI_PATH + '/assets/api/CreateAsset',
  GET_SINGLE_ASSET: BASEAPI_PATH + '/assets/api/SingleAsset',
  SELL_ASSET: BASEAPI_PATH + '/assets/api/SellAsset',
  BUY_ASSET: BASEAPI_PATH + '/assets/api/BuyAssets',
  START_AUCTION: BASEAPI_PATH + '/assets/api/startAuction',
  END_AUCTION: BASEAPI_PATH + '/assets/api/EndAuction',
  USER_ASSETS: BASEAPI_PATH + '/assets/api/UserAssets',
  GET_ALL_COLLECTION_BY_CATEGORY:
    BASEAPI_PATH + '/assets/api/AllCollectionsofCategory',
  GET_ALL_COLLECTION: BASEAPI_PATH + '/assets/api/AllCollections',
  GET_NFT: BASEAPI_PATH + '/assets/api/getNft',
  MAKE_AUCTION_BID: BASEAPI_PATH + '/assets/api/BidAuction',
  USER_COLLECTED_ITEMS: BASEAPI_PATH + '/assets/api/UsersCollectedItems',
  PRICE_AUCTION: BASEAPI_PATH + '/assets/api/PriceAuction',
  BUY_FIAT: BASEAPI_PATH + '/assets/api/buyForUser',
  FIAT_PRICE: BASEAPI_PATH + '/assets/api/payment/getMaticPrice',
  TRENDING_NFT: BASEAPI_PATH + '/assets/api/Trending',
  UPDATE_USER_PROFILE: BASEAPI_PATH + '/account/api/updateUserProfile',
};

export const WHITELISTED_API_ROUTES = [API_ROUTES.LOGIN];

export const AUCTION_ADDRESS = '0x0ae30f0ee55db3f99933522cdf4817c4ff290f25';
export const FACTORY_CONTRACT = '0x9cc741366d736dcdd542c9f1202f418c760cdea3';
export const MARKETPLACE_ADDRESS = '0x1ce9bf94a9d09fac630fb4e58f2b7471c7fd5975';
export const ETH_AUCTION_ADDRESS = '0x0ae30f0ee55db3f99933522cdf4817c4ff290f25';

export const DEFAULT_CHAIN = {
  id: 1,
  name: 'Ethereum',
  symbol: 'ETH',
  hex: '0x1',
};

export const EVENTS = {
  CREATED_TOKEN: 'CreatedToken',
  CREATED_NFT_ADDRESS: 'createdNFTAddress',
  MARKET_ITEM_CREATED: 'MarketItemCreated',
  ENGLISH_ACUTION_STARTED: 'englishAuctionStarted',
  DUTCH_AUCTION_STARTED: 'dutchAuctionStarted',
  BOUGHT_MARKET_ITEM: 'BoughtMarketItem',
  ENGLISH_AUCTION_END: 'englishAuctionEnd',
  UPDATE_ROYALTY_FEE: 'UpdatedRoyaltyFee',
  TRANSFER: 'Transfer',
  DUTCH_AUCTION_CURRENT_PRICE: 'dutchAuctionCurrentPrice',
  DUTCH_AUCTION_END: 'dutchAuctionEnd',
  FINAL_AUCTION_PRICE: 'finalAuctionPrice',
  ENGLISH_AUCTION_BID_SUCCESS: 'englishAuctionBidSuccess',

  APPROVAL: 'Approval',
  APPROVAL_FOR_ALL: 'ApprovalForAll',
  DEFAULT_ROYALTY: 'DefaultRoyalty',
  OWNER_UPDATED: 'OwnerUpdated',
  OPERATOR_RESTRICTION: 'OperatorRestriction',
  PLATFORM_FEE_INFO_UPDATED: 'PlatformFeeInfoUpdated',
  PRIMARY_SALE_RECIPIENT_UPDATED: 'PrimarySaleRecipientUpdated',
  ROLE_ADMIN_CHANGED: 'RoleAdminChanged',
  ROLE_GRANTED: 'RoleGranted',
  ROLE_REVOKED: 'RoleRevoked',
  ROYALTY_FOR_TOKEN: 'RoyaltyForToken',

  TOKENS_MINTED: 'TokensMinted',
  TOKENS_MINTED_WITH_SIGNATURE: 'TokensMintedWithSignature',
};
