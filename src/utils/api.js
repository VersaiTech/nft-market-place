import axios, { setToken } from './axiosUtils';
import { API_ROUTES } from './contants';

export async function login(payload) {
  try {
    const URL = API_ROUTES.LOGIN;
    let data = await axios.post(URL, payload);
    let token = data.accesstoken;
    setToken(token);
    let user = data.user;
    return [user, null];
  } catch (e) {
    return [null, e];
  }
}

export async function metaskLogin(payload) {
  try {
    const URL = API_ROUTES.LOGIN;
    let data = await axios.post(URL, payload);
    let token = data.accesstoken;
    setToken(token);
    let user = data.user;
    return [user, null];
  } catch (e) {
    return [null, e];
  }
}

export async function register(payload) {
  try {
    const URL = API_ROUTES.REGISTER;
    let data = await axios.post(URL, payload);
    let user = data.user;
    return [user, null];
  } catch (e) {
    return [null, e];
  }
}

export async function CreateCollection(payload, walletaddress, chainId) {
  try {
    const URL = API_ROUTES.CREATE_COLLECTION;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetUserCollection(walletaddress, chainId) {
  try {
    const URL = API_ROUTES.GET_USER_COLLECTION;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetSingleCollection(collectionaddress, chainId) {
  try {
    const URL = API_ROUTES.GET_SINGLE_COLLECTION;
    const options = {
      params: {
        collectionaddress,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function CreateToken(walletaddress, payload, chainId) {
  try {
    const URL = API_ROUTES.CREATE_ASSET;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetSingleNft(collectionaddress, tokenid, chainId) {
  try {
    const URL = API_ROUTES.GET_SINGLE_ASSET;
    const options = {
      params: {
        nftaddress: collectionaddress,
        tokenid: tokenid,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function SellNft(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = API_ROUTES.SELL_ASSET;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenid: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function BuyNft(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = API_ROUTES.BUY_ASSET;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenid: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function StartAuction(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = API_ROUTES.START_AUCTION;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenId: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function AuctionPriceUpdate(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = `${API_ROUTES.PRICE_AUCTION}`;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenId: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function EndAuction(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = API_ROUTES.END_AUCTION;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenId: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetUserAssets(walletaddress, chainId) {
  try {
    const URL = API_ROUTES.USER_ASSETS;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetUserCollectedAssets(walletaddress, chainId) {
  try {
    const URL = API_ROUTES.USER_COLLECTED_ITEMS;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetNft(walletaddress, chainId) {
  try {
    const URL = API_ROUTES.GET_NFT;
    const options = {
      params: {
        walletaddress,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetNftByCategory(categoryname, chainId) {
  try {
    const URL = API_ROUTES.GET_ALL_COLLECTION_BY_CATEGORY;
    const options = {
      params: {
        categoryname,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function GetAllNft(categoryname, chainId) {
  try {
    const URL = API_ROUTES.GET_ALL_COLLECTION;
    const options = {
      params: {
        categoryname,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function MakeBidOnAuction(
  payload,
  walletaddress,
  collectionaddress,
  tokenid,
  chainId,
) {
  try {
    const URL = API_ROUTES.MAKE_AUCTION_BID;
    const options = {
      params: {
        walletaddress,
        nftaddress: collectionaddress,
        tokenId: tokenid,
        chainId,
      },
    };
    const res = await axios.post(URL, payload, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function getAllMarketplaceNft(categoryname, chainId) {
  try {
    // /assets/api/AllCollectionsofCategory?categoryname=Sports&chainId=1
    const URL =
      categoryname === 'all'
        ? API_ROUTES.GET_ALL_MARKETPLACE_ASSET
        : API_ROUTES.GET_NFT_BY_CATEGORY;

    const options = {
      params: {
        categoryname,
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function buyMarketFiat(
  nftaddress,
  itemId,
  reciever,
  price,
  tokenId,
  chainId,
  seller,
) {
  try {
    const URL = API_ROUTES.BUY_FIAT;
    const reqObj = {
      nftaddress,
      itemId,
      reciever,
      price,
      tokenId,
      chainId,
      seller,
    };
    const res = await axios.post(URL, reqObj);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}
export async function getFiatPrice(chainId) {
  try {
    const URL = API_ROUTES.FIAT_PRICE;
    const options = {
      params: {
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}
export async function GetTrendingNft(chainId) {
  try {
    const URL = API_ROUTES.TRENDING_NFT;
    const options = {
      params: {
        chainId,
      },
    };
    const res = await axios.get(URL, options);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}

export async function UpadteUserProfilePic(profile_url, username) {
  try {
    const URL = API_ROUTES.UPDATE_USER_PROFILE;
    const reqObj = {
      profile_url,
      username,
    };
    const res = await axios.post(URL, reqObj);
    return [res, null];
  } catch (e) {
    return [null, e];
  }
}
