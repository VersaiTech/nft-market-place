import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import Web3 from 'web3';

import {
  AUCTION_ADDRESS,
  EVENTS,
  FACTORY_CONTRACT,
  MARKETPLACE_ADDRESS,
} from './contants';

import { abiMap, getEvents } from './getWeb3Event';
import { getContractAddress, weiToEth } from './helper';

const TX_TYPE = {
  NFT: 'nft',
  MARKETPLACE: 'marketplace',
  AUCTION: 'auction',
  FACTORY: 'factory',
};

const getProvider = async () => {
  const provider = new Web3Provider(window.ethereum);
  return provider;
};

const contractInstance = async (address, contractType) => {
  const provider = await getProvider();
  const signer = provider.getSigner();
  return new Contract(address, abiMap[contractType], signer);
};

const CONTRACT_TYPE = {
  MARKETPLACE: 'marketplace',
  NFT: 'nft',
  AUCTION: 'auction',
  FACTORY: 'factory',
};

export const CreateNFT = async (payload) => {
  try {
    const { collectionaddress, URI } = payload;

    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let tx = await nftInstance.createToken(URI);
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.NFT, collectionaddress);

    const result = {
      tokenid: events[EVENTS.CREATED_TOKEN].tokenId,
      creator: events[EVENTS.CREATED_TOKEN].minter,
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const CreateCollection = async ({
  walletaddress,
  collectionname,
  collectionsymbol,
  royaltyfee,
  royaltyrecipient,
}) => {
  try {
    const factoryInstance = await contractInstance(
      FACTORY_CONTRACT,
      CONTRACT_TYPE.FACTORY,
    );
    let tx = await factoryInstance.createNFT(
      collectionname,
      collectionsymbol,
      royaltyfee,
      royaltyrecipient,
      0,
      walletaddress,
    );
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.FACTORY, FACTORY_CONTRACT);

    const result = {
      collectionaddress: events[EVENTS.CREATED_NFT_ADDRESS].nftcontract,
      creator: events[EVENTS.CREATED_NFT_ADDRESS].creator,
    };

    const nftInstance = await contractInstance(
      result.collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let marketPlaceApprovalTx = await nftInstance.setApprovalForAll(
      MARKETPLACE_ADDRESS,
      true,
      {
        from: walletaddress,
      },
    );
    marketPlaceApprovalTx = await marketPlaceApprovalTx.wait();

    let auctionApprovalTx = await nftInstance.setApprovalForAll(
      AUCTION_ADDRESS,
      true,
      {
        from: walletaddress,
      },
    );
    auctionApprovalTx = await auctionApprovalTx.wait();

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const createMarketItem = async (
  walletaddress,
  collectionaddress,
  tokenId,
  price,
  duration,
) => {
  try {
    const marketInstance = await contractInstance(
      MARKETPLACE_ADDRESS,
      CONTRACT_TYPE.MARKETPLACE,
    );
    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let marketplaceApprovalTx = await nftInstance.setApprovalForAll(
      MARKETPLACE_ADDRESS,
      true,
      {
        from: walletaddress,
      },
    );
    marketplaceApprovalTx = await marketplaceApprovalTx.wait();

    const weiPrice = Web3.utils.fromWei((price * 10 ** 18).toString(), 'wei');
    let listingfee = await marketInstance.listingfee();

    const weiListingFee = Web3.utils.fromWei(
      parseInt(listingfee).toString(),
      'wei',
    );

    let tx = await marketInstance.createMarketItem(
      collectionaddress,
      tokenId,
      weiPrice,
      duration,
      {
        from: walletaddress,
        value: weiListingFee,
      },
    );
    tx = await tx.wait();

    const events = await getEvents(
      tx,
      TX_TYPE.MARKETPLACE,
      MARKETPLACE_ADDRESS,
    );

    const result = {
      itemId: events[EVENTS.MARKET_ITEM_CREATED].itemId,
      owner: events[EVENTS.MARKET_ITEM_CREATED].owner,
      price: weiToEth(events[EVENTS.MARKET_ITEM_CREATED].price),
      seller: events[EVENTS.MARKET_ITEM_CREATED].seller,
      sold: events[EVENTS.MARKET_ITEM_CREATED].sold,
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const startEnglishAuction = async (
  walletaddress,
  collectionaddress,
  tokenId,
  startingbid,
  duration,
  chainId,
) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    const marketplaceInstance = await contractInstance(
      MARKETPLACE_ADDRESS,
      CONTRACT_TYPE.MARKETPLACE,
    );

    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let approvalTx = await nftInstance.setApprovalForAll(
      AUCTION_ADDRESS,
      true,
      {
        from: walletaddress,
      },
    );
    approvalTx = await approvalTx.wait();

    let listingfee = await marketplaceInstance.listingfee();

    const weiStartingBid = Web3.utils.fromWei(
      (startingbid * 10 ** 18).toString(),
      'wei',
    );

    let tx = await auctionInstance.startEnglishAuction(
      collectionaddress,
      tokenId,
      weiStartingBid,
      duration,
      {
        from: walletaddress,
        value: listingfee,
      },
    );

    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidId: events[EVENTS.ENGLISH_ACUTION_STARTED]._bidId,
      seller: events[EVENTS.ENGLISH_ACUTION_STARTED]._seller,
      startingPrice: weiToEth(
        events[EVENTS.ENGLISH_ACUTION_STARTED]._startingPrice,
      ),
      duration: events[EVENTS.ENGLISH_ACUTION_STARTED]._duration,
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};

export const startDutchAuction = async (
  walletaddress,
  startingprice,
  minimumprice,
  collectionaddress,
  tokenId,
  duration,
  chainId,
) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    const marketplaceInstance = await contractInstance(
      MARKETPLACE_ADDRESS,
      CONTRACT_TYPE.MARKETPLACE,
    );

    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    const weiStartingBid = Web3.utils.fromWei(
      (startingprice * 10 ** 18).toString(),
      'wei',
    );
    const weiMinimumPrice = Web3.utils.fromWei(
      (minimumprice * 10 ** 18).toString(),
      'wei',
    );

    let approvalTx = await nftInstance.setApprovalForAll(
      AUCTION_ADDRESS,
      true,
      {
        from: walletaddress,
      },
    );
    approvalTx = await approvalTx.wait();

    let listingfee = await marketplaceInstance.listingfee();

    let tx = await auctionInstance.startDutchAuction(
      weiStartingBid,
      weiMinimumPrice,
      collectionaddress,
      tokenId,
      duration,
      {
        from: walletaddress,
        value: listingfee,
      },
    );

    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidId: events[EVENTS.DUTCH_AUCTION_STARTED]._bidId,
      seller: events[EVENTS.DUTCH_AUCTION_STARTED]._seller,
      startingPrice: weiToEth(
        events[EVENTS.DUTCH_AUCTION_STARTED]._startingPrice,
      ),
      minimumprice: weiToEth(
        events[EVENTS.DUTCH_AUCTION_STARTED]._minimumPrice,
      ),
      duration: events[EVENTS.DUTCH_AUCTION_STARTED]._duration,
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    console.log({ error });
    return [null, error];
  }
};

export const BuyMarketItem = async (
  walletaddress,
  collectionaddress,
  ItemId,
  price,
) => {
  try {
    const marketplaceInstance = await contractInstance(
      MARKETPLACE_ADDRESS,
      CONTRACT_TYPE.MARKETPLACE,
    );

    const weiPrice = Web3.utils.fromWei(
      parseInt(price * 10 ** 18).toString(),
      'wei',
    );

    let finalPriceTx = await marketplaceInstance.getTotalFeeMarketPrice(
      weiPrice,
      collectionaddress,
    );
    finalPriceTx = await finalPriceTx.wait();

    const weiFinalPrice = parseInt(
      finalPriceTx.events[0].args._totalPrice,
    ).toString();

    let tx = await marketplaceInstance.buyMarketItem(
      collectionaddress,
      ItemId,
      {
        from: walletaddress,
        value: weiFinalPrice,
      },
    );
    tx = await tx.wait();

    const events = await getEvents(
      tx,
      TX_TYPE.MARKETPLACE,
      MARKETPLACE_ADDRESS,
    );

    const result = {
      Buyer: events[EVENTS.BOUGHT_MARKET_ITEM].buyer,
      Seller: events[EVENTS.BOUGHT_MARKET_ITEM].seller,
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const GetListingFee = async () => {
  try {
    const marketplaceInstance = await contractInstance(
      MARKETPLACE_ADDRESS,
      CONTRACT_TYPE.MARKETPLACE,
    );
    const listingfee = await marketplaceInstance.getlistingFee();
    return listingfee;
  } catch (error) {
    console.log(error);
  }
};

export const getHighestBid = async (bidid, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    const highestBid = await auctionInstance.getHighestBid(bidid);
    return highestBid;
  } catch (error) {
    console.log(error);
  }
};

export const TransferNFT = async (
  receiveraddress,
  collectionaddress,
  tokenId,
) => {
  try {
    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let tx = await nftInstance.NFTTransferFrom(receiveraddress, tokenId);
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.NFT, collectionaddress);
    const result = {
      tokenid: events[EVENTS.TRANSFER].tokenId,
      from: events[EVENTS.TRANSFER].from,
      to: events[EVENTS.TRANSFER].to,
    };

    console.log({ result });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const UpdateRoyaltyFee = async (collectionaddress, royaltyFee) => {
  try {
    const nftInstance = await contractInstance(
      collectionaddress,
      CONTRACT_TYPE.NFT,
    );

    let tx = await nftInstance.setRoyaltyFee(royaltyFee);
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.NFT, collectionaddress);

    return events[EVENTS.UPDATE_ROYALTY_FEE].newroyaltyfee;
  } catch (error) {
    console.log(error);
  }
};

export const getDutchPrice = async (bidid, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    let tx = await auctionInstance.getDutchPrice(bidid);
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidid: events[EVENTS.DUTCH_AUCTION_CURRENT_PRICE]._bidId,
      currentprice: events[EVENTS.DUTCH_AUCTION_CURRENT_PRICE]._currentPrice,
    };

    console.log({ result });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const EndDutchAuction = async (bidid, finalPrice, account, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    let tx = await auctionInstance.EndDutchAuction(bidid, {
      from: account,
      value: finalPrice.wei.toString(),
    });

    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidid: events[EVENTS.DUTCH_AUCTION_END]._bidId,
      winner: events[EVENTS.DUTCH_AUCTION_END]._winner,
      winningbid: weiToEth(events[EVENTS.DUTCH_AUCTION_END]._winningBid),
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const isDutchAuctionCompleted = async (Bidid, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    const DutchAuctionCompleted = await auctionInstance.isDutchAuctionCompleted(
      Bidid,
    );
    return DutchAuctionCompleted;
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentPrice = async (bidid, address, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    let tx = await auctionInstance.getTotalPriceAuction(bidid, 0, 1, {
      from: address,
    });

    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      wei: events[EVENTS.FINAL_AUCTION_PRICE]._finalPrice,
      eth: weiToEth(events[EVENTS.FINAL_AUCTION_PRICE]._finalPrice),
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const bidEnglishAuction = async (bidid, bidamount, address, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    const weiPrice = Web3.utils.fromWei(
      parseInt(bidamount * 10 ** 18).toString(),
      'wei',
    );

    let finalPriceTx = await auctionInstance.getTotalPriceAuction(
      bidid,
      1,
      weiPrice,
      { from: address },
    );
    finalPriceTx = await finalPriceTx.wait();

    const weiFinalPrice = parseInt(
      finalPriceTx.events[0].args._finalPrice,
    ).toString();

    let tx = await auctionInstance.bidEnglishAuction(bidid, weiPrice, {
      from: address,
      value: weiFinalPrice,
    });
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidid: parseInt(events[EVENTS.ENGLISH_AUCTION_BID_SUCCESS]._bidId),
      currenthighestbidder:
        events[EVENTS.ENGLISH_AUCTION_BID_SUCCESS]._currentHighestBidder,
      currenthighestbid: weiToEth(
        events[EVENTS.ENGLISH_AUCTION_BID_SUCCESS]._currentHighestBid,
      ),
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    console.log({ error });
    return [null, error];
  }
};

export const withDrawBidValue = async (bidid, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );

    let res = await auctionInstance.withDrawBidValue(bidid);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const endEnglishAuction = async (Bidid, account, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    let tx = await auctionInstance.endEnglishAuction(Bidid);
    tx = await tx.wait();

    const events = await getEvents(tx, TX_TYPE.AUCTION, AUCTION_ADDRESS);

    const result = {
      bidid: events[EVENTS.ENGLISH_AUCTION_END]._bidId,
      winner: events[EVENTS.ENGLISH_AUCTION_END]._winner,
      winningbid: weiToEth(events[EVENTS.ENGLISH_AUCTION_END]._winningBid),
    };

    console.log({ result });
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export const getTotalFeeMarketPrice = async (
  price,
  collectionaddress,
  chainId,
) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    const getTotalMarketPriceFee = await auctionInstance.getTotalFeeMarketPrice(
      price,
      collectionaddress,
    );
    return getTotalMarketPriceFee;
  } catch (error) {
    console.log(error);
  }
};

export const getTotalPriceAuction = async (
  bidid,
  auction,
  bidvalue,
  chainId,
) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    const gettotalpriceauction = await auctionInstance.getTotalPriceAuction(
      bidid,
      auction,
      bidvalue,
    );
    return gettotalpriceauction;
  } catch (error) {
    console.log(error);
  }
};

export const getFinalPrice = async (bidid, auction, chainId) => {
  try {
    const address = getContractAddress(chainId);
    const auctionInstance = await contractInstance(
      address,
      CONTRACT_TYPE.AUCTION,
    );
    const getfinalprice = await auctionInstance.getFinalPrice(bidid, auction);
    return getfinalprice;
  } catch (error) {
    console.log(error);
  }
};
