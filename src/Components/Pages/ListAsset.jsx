import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../utils/api';
import * as blockchainApi from '../../utils/blockchain';
import {
  ChainDetails,
  handleError,
  secondsFromNow,
  throwIfExists,
} from '../../utils/helper';
import { useReducerPlus } from '../../utils/useReducerPlus';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { AUCTION_ADDRESS, MARKETPLACE_ADDRESS } from '../../utils/contants';
import { toast } from 'react-toastify';
import ButtonLoader from '../ButtonLoader';
import { switchNetwork } from '../../utils/connection';
import { useDispatch, useSelector } from 'react-redux';
import { validateField, validateFields } from '../../utils';

const LISTING_TYPE = {
  FIXED: 'FIXED',
  AUCTION: 'AUCTION',
};

export const AUCTION_METHOD = {
  ENGLISH_AUCTION: 'English',
  DUTCH_AUCTION: 'Dutch',
};

export const ListAsset = () => {
  const { collectionaddress, tokenid, networkId } = useParams();
  const navigate = useNavigate();
  const { account, chainId } = useWeb3React();
  const dispatch = useDispatch();
  const chain = useSelector((state) => state.chainReducer);

  const [state, setState] = useReducerPlus({
    nftData: '',
    metaData: '',
    price: '',
    endingPrice: '',
    durationDate: '',
    listingType: LISTING_TYPE.FIXED,
    auctionType: AUCTION_METHOD.ENGLISH_AUCTION,
    loader: false,
    endingPriceError: false,
    chain: chain,
    error: {},
  });

  const radio1 = React.useRef(null);
  const radio2 = React.useRef(null);
  const radio3 = React.useRef(null);
  const radio4 = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({ [name]: value });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let fieldError = validateField(name, value);
    setState({ error: { ...state.error, [name]: fieldError } });
  };

  useEffect(() => {
    if (account) {
      getSingleNft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSingleNft = async () => {
    try {
      const [res, error] = await api.GetSingleNft(
        collectionaddress,
        tokenid,
        networkId,
      );
      throwIfExists(error);
      const meta = await axios.get(res.assets.metadata);
      setState({ nftData: res.assets, metaData: meta.data });
    } catch (error) {
      console.log({ errorWhileFetchingNft: error });
    }
  };

  const handleSubmit = async (e) => {
    setState({ loader: true });
    try {
      e.preventDefault();
      const {
        durationDate,
        nftData,
        price,
        endingPrice,
        listingType,
        auctionType,
        chain,
      } = state;

      const fieldsToValidate = ['durationDate', 'price', 'listingType'];

      if (
        listingType === LISTING_TYPE.AUCTION &&
        auctionType === AUCTION_METHOD.DUTCH_AUCTION
      ) {
        fieldsToValidate.push('endingPrice');
      }

      const isValidFields = validateFields(fieldsToValidate, state, setState);
      if (!isValidFields) return;

      if (nftData.networkId !== chainId) {
        try {
          await switchNetwork(dispatch, chain);
          toast.success(`Network Changed! Please try again`);
        } catch (e) {
          toast.error('Please select appropriate netowrk');
        }
        setState({ loader: false });

        return;
      }
      if (!account) handleError({ message: 'Metamask not connected' });

      const duration = secondsFromNow(durationDate);
      if (listingType === LISTING_TYPE.FIXED && account && collectionaddress) {
        const [blockchainRes, blockchainError] =
          await blockchainApi.createMarketItem(
            account,
            collectionaddress,
            nftData.nftid,
            price,
            duration,
          );

        throwIfExists(blockchainError);

        const payload = {
          price: blockchainRes.price,
          owner: account, //seller
          ItemId: blockchainRes.itemId, // listingId in marketplace
          seller: blockchainRes.seller, //creator
          marketplaceaddress: MARKETPLACE_ADDRESS,
          duration,
        };

        const [res, error] = await api.SellNft(
          payload,
          account,
          collectionaddress,
          tokenid,
          nftData.networkId,
        );
        throwIfExists(error);
        if (res) {
          toast.success('Listed to the marketplace');
          navigate(
            `/marketplace/${collectionaddress}/${nftData.nftid}/${nftData.networkId}`,
          );
        }
      }
      if (
        listingType === LISTING_TYPE.AUCTION &&
        account &&
        collectionaddress
      ) {
        if (price < endingPrice) {
          toast.error('Ending price should be smaller than the Starting Price');
          setState({ loader: false });
          return;
        }
        let bidId;
        let startingPrice;

        if (auctionType === AUCTION_METHOD.ENGLISH_AUCTION) {
          const [blockchainRes, blockchainError] =
            await blockchainApi.startEnglishAuction(
              account,
              collectionaddress,
              nftData.nftid,
              price,
              duration,
              nftData.networkId,
            );
          throwIfExists(blockchainError);
          bidId = blockchainRes.bidId;
          startingPrice = blockchainRes.startingPrice;
        }
        if (auctionType === AUCTION_METHOD.DUTCH_AUCTION) {
          const [blockchainRes, blockchainError] =
            await blockchainApi.startDutchAuction(
              account,
              price,
              endingPrice,
              collectionaddress,
              nftData.nftid,
              duration,
              nftData.networkId,
            );
          throwIfExists(blockchainError);
          bidId = blockchainRes.bidId;
          startingPrice = blockchainRes.startingPrice;
        }

        const payload = {
          startingPrice: startingPrice,
          creator: account,
          auctionAddress: AUCTION_ADDRESS,
          _bidId: parseInt(bidId),
          duration: duration * 1000,
          minimumPrice:
            auctionType === AUCTION_METHOD.ENGLISH_AUCTION ? null : endingPrice,
          type:
            auctionType === AUCTION_METHOD.ENGLISH_AUCTION
              ? AUCTION_METHOD.ENGLISH_AUCTION
              : AUCTION_METHOD.DUTCH_AUCTION, //based on option
        };
        const [res, error] = await api.StartAuction(
          payload,
          account,
          collectionaddress,
          tokenid,
          nftData.networkId,
        );
        throwIfExists(error);
        if (res) {
          toast.success('Listed to the marketplace');
          navigate(
            `/marketplace/${collectionaddress}/${nftData.nftid}/${nftData.networkId}`,
          );
        }
      }
    } catch (error) {
      console.log({ handleSubmit: error });
      toast.error(error.reason);
    } finally {
      setState({ loader: false });
    }
  };

  let startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>
      <div className="list-asset-container">
        <div className="list-asset-form">
          <form action="" onSubmit={handleSubmit}>
            <h2>
              <b>List for Sale</b>
            </h2>

            <div className="input-container">
              <label htmlFor="">Choose a type of sale</label>
              <div
                className="form-check input-radio"
                onClick={() => radio1.current.click()}
              >
                <span>
                  <label style={{ margin: '0' }} for="fixed-price">
                    Fixed price
                    <div className="form-text">
                      The item is listed at the price you set.
                    </div>
                  </label>
                </span>
                <input
                  ref={radio1}
                  className="input-radio-button"
                  style={{ float: 'right' }}
                  type="radio"
                  id="fixed-price"
                  checked={state.listingType === LISTING_TYPE.FIXED}
                  name="listingType"
                  onChange={handleChange}
                  value={LISTING_TYPE.FIXED}
                />
              </div>
              <div
                className="input-radio"
                onClick={() => radio2.current.click()}
              >
                <span>
                  <label style={{ margin: '0' }} for="timed-auction">
                    Timed auction
                    <div className="form-text">
                      The item is listed for auction.{' '}
                      <span style={{ textDecoration: 'none' }}>Learn More</span>
                    </div>
                  </label>
                </span>
                <input
                  ref={radio2}
                  className="input-radio-button"
                  style={{ float: 'right' }}
                  type="radio"
                  id="timed-auction"
                  checked={state.listingType === LISTING_TYPE.AUCTION}
                  name="listingType"
                  onChange={handleChange}
                  value={LISTING_TYPE.AUCTION}
                />
              </div>
            </div>

            {state.listingType === LISTING_TYPE.AUCTION && (
              <div className="input-container">
                <label htmlFor="">Choose a method</label>
                <div
                  className="form-check input-radio"
                  onClick={() => radio3.current.click()}
                >
                  <span>
                    <label style={{ margin: '0' }} for="english-auction">
                      Sell to highest bidder
                      <div className="form-text">
                        The highest bid wins at the end.
                      </div>
                    </label>
                  </span>
                  <input
                    ref={radio3}
                    className="input-radio-button"
                    style={{ float: 'right' }}
                    type="radio"
                    id="english-auction"
                    checked={
                      state.auctionType === AUCTION_METHOD.ENGLISH_AUCTION
                    }
                    name="auctionType"
                    onChange={handleChange}
                    value={AUCTION_METHOD.ENGLISH_AUCTION}
                  />
                </div>
                <div
                  className="input-radio"
                  onClick={() => radio4.current.click()}
                >
                  <span>
                    <label style={{ margin: '0' }} htmlFor="dutch-auction">
                      Sell with declining price
                      <div className="form-text">
                        The price falls until someone purchases the item.
                      </div>
                    </label>
                  </span>
                  <input
                    ref={radio4}
                    className="input-radio-button"
                    style={{ float: 'right' }}
                    type="radio"
                    id="dutch-auction"
                    checked={state.auctionType === AUCTION_METHOD.DUTCH_AUCTION}
                    name="auctionType"
                    onChange={handleChange}
                    value={AUCTION_METHOD.DUTCH_AUCTION}
                  />
                </div>
              </div>
            )}

            <div className="input-container">
              <label htmlFor="">
                {state.listingType === LISTING_TYPE.AUCTION
                  ? 'Starting Price'
                  : 'Set a price'}
              </label>
              <input
                className="form-control"
                onChange={handleChange}
                onBlur={handleBlur}
                name="price"
                value={state.price}
                type="number"
                min={state.endingPrice}
                step="any"
                // required
              />
              {state.error.price && (
                <span className="errorMsg">{state.error.price}</span>
              )}
            </div>
            {state.listingType === LISTING_TYPE.AUCTION &&
              state.auctionType === AUCTION_METHOD.DUTCH_AUCTION && (
                <div className="input-container">
                  <label htmlFor="">
                    Ending price &nbsp;
                    <span className="form-text">
                      (Should be lesser than the starting price)
                    </span>
                  </label>

                  <input
                    className="form-control"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="endingPrice"
                    value={state.endingPrice}
                    type="number"
                    min="0"
                    max={state.price}
                    step="any"
                    // required
                  />
                  {state.error.endingPrice && (
                    <span className="errorMsg">{state.error.endingPrice}</span>
                  )}
                </div>
              )}
            <div className="input-container">
              <label htmlFor="">Set duration</label>
              <input
                name="durationDate"
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-control"
                style={{ backgroundColor: '#f2f2f2' }}
                type="date"
                value={state.date}
                min={startDate.toISOString().split('T')[0]}
                // required
              />
              {state.error.durationDate && (
                <span className="errorMsg">{state.error.durationDate}</span>
              )}
            </div>
            {/* <div className="input-container">
              <label htmlFor="">More Options</label>
              <select className="form-select" aria-label="Default select example">
                <option selected>Select one item</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div> */}
            <div className="input-container">
              <label htmlFor="">Summary</label>
              <table style={{ width: '100%' }}>
                <tr>
                  <td>Listing price</td>
                  <td align="right">
                    {state.price} {ChainDetails(parseInt(networkId)).symbol}
                  </td>
                </tr>
                <tr>
                  <td>Service fee</td>
                  <td align="right">1%</td>
                </tr>
                <tr>
                  <td>Creator earnings</td>
                  <td align="right">
                    {state.price} {ChainDetails(parseInt(networkId)).symbol}
                  </td>
                </tr>
              </table>
              <hr />
            </div>
            <div className="input-container">
              <table style={{ width: '100%' }}>
                <tr>
                  <td>
                    <b>Potential Earnings</b>
                  </td>
                  <td align="right">
                    <b>
                      {state.price} {ChainDetails(parseInt(networkId)).symbol}
                    </b>
                  </td>
                </tr>
              </table>
            </div>
            <div className="input-container d-grid gap-2">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={state.loader}
              >
                {state.loader ? <ButtonLoader /> : 'Complete Listing'}
              </button>
            </div>
          </form>
        </div>
        <div className="list-asset-card">
          <div className="asset-card">
            <div className="card">
              <img
                src={state.metaData && state.metaData.URI}
                className="card-img-top"
                alt="..."
                style={{
                  width: '100%',
                  height: '230px',
                  objectFit: 'contain',
                  marginTop: '10px',
                }}
              />
              <div className="card-body" style={{ padding: '12px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {state.metaData && state.metaData.name}
                </p>
                <p
                  style={{
                    color: '#11111175',
                    fontSize: 'small',
                    marginBottom: '2px',
                  }}
                >
                  {state.metaData && state.metaData.description}
                </p>
                <strong>
                  {state.price} {ChainDetails(parseInt(networkId)).symbol}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
