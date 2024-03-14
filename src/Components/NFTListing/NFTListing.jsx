import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import Accordion from './Accordion';

import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../utils/api';
import * as blockchainApi from '../../utils/blockchain';
import {
  ChainDetails,
  fetchObjectById,
  shortenAddress,
  throwIfExists,
} from '../../utils/helper';
import { useReducerPlus } from '../../utils/useReducerPlus';
import axios from 'axios';
import { useWeb3React } from '@web3-react/core';
import ButtonLoader from '../ButtonLoader';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import Clock from '../Clock';
import { useDispatch, useSelector } from 'react-redux';
import { AUCTION_METHOD } from '../Pages/ListAsset';
import { switchNetwork } from '../../utils/connection';
import { BASEAPI_PATH } from '../../utils/contants';
import { validateField, validateFields } from '../../utils';

const options = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
  timeZone: 'Asia/Kolkata',
};

export const NFTListing = () => {
  const navigate = useNavigate();
  const { collectionaddress, tokenid, networkId } = useParams();

  const { account, chainId } = useWeb3React();

  const user = useSelector((state) => state.authReducer.currentUser);
  const dispatch = useDispatch();

  const [bidSuccess, setBidSuccess] = useState(false);

  const [state, setState] = useReducerPlus({
    nftData: '',
    marketData: '',
    auctionData: '',
    metaData: '',
    loader: false,
    makeBidModal: false,
    bidAmount: 0,
    currentPrice: null,
    currentPriceLoader: false,
    buyItAtPriceLoader: false,
    buttonModal: false,
    maticRate: 0,
    fiatloader: false,
    bidSuccess: false,
    error: {},
  });

  useEffect(() => {
    getSingleNft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.bidAmount]);

  async function fetchRate() {
    try {
      const rate = await api.getFiatPrice(networkId);
      setState({ maticRate: rate[0].maticprice });
    } catch (err) {
      console.log({ fetchRate: err });
    }
  }

  useEffect(() => {
    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.buttonModal]);

  const getSingleNft = async () => {
    try {
      const [res, error] = await api.GetSingleNft(
        collectionaddress,
        tokenid,
        networkId,
      );
      throwIfExists(error);

      const metaRes = await axios.get(res.assets.metadata);
      setState({
        nftData: res.assets,
        marketData: res.marketItemDetails,
        auctionData: res.auctionItemDetails,
        metaData: metaRes.data,
      });
      // if (res.auctionItemDetails) {
      //   getCurrentPrice(res.auctionItemDetails.auctionid);
      // }
    } catch (error) {
      console.log({ errorWhileFetchingNft: error });
    }
  };

  const handleBuy = async () => {
    setState({ loader: true });
    try {
      if (state.nftData.networkId !== chainId) {
        await switchNetwork(dispatch, fetchObjectById(state.nftData.networkId));
        return;
      }
      if (account) {
        const [blockchainRes, blockchainError] =
          await blockchainApi.BuyMarketItem(
            account,
            state.nftData.address,
            state.marketData.itemid,
            state.marketData.price,
          );
        throwIfExists(blockchainError);

        if (blockchainRes) {
          const payload = {
            Buyer: blockchainRes.Buyer,
            itemid: state.marketData.itemid,
            price: state.marketData.price,
            seller: state.marketData.owner,
          };
          const [res, error] = await api.BuyNft(
            payload,
            account,
            state.nftData.address,
            state.nftData.nftid,
            state.nftData.networkId,
          );
          if (!res) throwIfExists(error);
          toast.success('Nft bought successfully');
          navigate('/profile');
        }
      } else {
        toast.error('Metamask not connected');
      }
    } catch (error) {
      console.log({ handleBuy: error });
      toast.error(error.message);
    } finally {
      setState({ loader: false });
    }
  };

  const handleFiatBuy = async (e) => {
    setState({ ...state, fiatloader: true });
    const cachedResult = sessionStorage.getItem(`current-nftprice`);
    if (cachedResult) {
      sessionStorage.removeItem(`current-nftprice`);
    }
    sessionStorage.setItem(
      `current-nftprice`,
      JSON.stringify((state.nftData.price * state.maticRate).toFixed(5)),
    );

    const data = {
      username: user.username,
      email: user.email,
    };

    axios
      .post(`${BASEAPI_PATH}/assets/api/payment/CreateCustomer`, data)
      .then((res) => {
        const cachedResult = sessionStorage.getItem(`current-user`);
        if (cachedResult) {
          sessionStorage.removeItem(`current-user`);
        }
        sessionStorage.setItem(
          `current-user`,
          JSON.stringify(res.data.customer_id),
        );

        axios
          .post(
            `${BASEAPI_PATH}/assets/api/payment/Checkout`,
            {
              customer_id: res.data.customer_id,
              itemid: state.marketData.itemid,
              price: state.nftData.price * state.maticRate,
              quantity: 1,
              chainId: state.nftData.networkId,
              success_URL: `${window.location.origin}/checkout/session_id=${res.data.sessionid}/success`,
              cancel_URL: `${window.location.origin}/checkout/session_id=${res.data.sessionid}/cancel`,
              name: state.nftData.name,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .then((res) => {
            const cachedResult = sessionStorage.getItem(`nftData`);
            if (cachedResult) {
              sessionStorage.removeItem(`nftData`);
            }
            sessionStorage.setItem(
              `nftData`,
              JSON.stringify({
                //   window.nftData = {
                nftaddress: state.nftData.address,
                itemId: state.marketData.itemid,
                reciever: account,
                price: state.nftData.price,
                tokenId: Number(state.nftData.nftid),
                chainId: state.nftData.networkId,
              }),
            );
            try {
              window.open(
                `${window.location.origin}/checkout/session_id=${res.data.sessionid.id}`,
                'Payment Checkout',
                'height=800,width=600',
              );
            } catch (error) {
              toast(error);
            } finally {
              setState({ ...state, fiatloader: false });
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setState({ loader: true });
    try {
      const fieldsToValidate = ['bidAmount'];
      const isValidFields = validateFields(fieldsToValidate, state, setState);

      if (!isValidFields) return;

      if (state.nftData.networkId !== chainId) {
        await switchNetwork(dispatch, fetchObjectById(state.nftData.networkId));
        return;
      }
      const [blockchainRes, blockchainError] =
        await blockchainApi.bidEnglishAuction(
          state.auctionData.auctionid,
          state.bidAmount,
          account,
          state.nftData.networkId,
        );
      throwIfExists(blockchainError);
      const payload = {
        _bidId: blockchainRes.bidid,
        _currentHighestBidder: blockchainRes.currenthighestbidder,
        _currentHighestBid: blockchainRes.currenthighestbid,
        type: 'English',
      };

      const [res, error] = await api.MakeBidOnAuction(
        payload,
        account,
        state.nftData.address,
        state.nftData.nftid,
        state.nftData.networkId,
      );
      console.log(res);
      throwIfExists(error);
      if (res) {
        setBidSuccess(true);
        toast.success('Bid placed successfully');
      }
      setState({ makeBidModal: false });
    } catch (error) {
      console.log({ handleBid: error });
      toast.error(error.reason);
    } finally {
      setState({ loader: false });
    }
  };

  const handleAuctionClose = async () => {
    setState({ buyItAtPriceLoader: true });
    try {
      if (state.nftData.networkId !== chainId) {
        await switchNetwork(dispatch, fetchObjectById(state.nftData.networkId));
        return;
      }
      let blockchainData;
      if (state.auctionData.auctiontype === AUCTION_METHOD.DUTCH_AUCTION) {
        const [blockchainRes, blockchainError] =
          await blockchainApi.EndDutchAuction(
            state.auctionData.auctionid,
            state.currentPrice,
            account,
            state.nftData.networkId,
          );

        throwIfExists(blockchainError);
        blockchainData = blockchainRes;
      }

      if (state.auctionData.auctiontype === AUCTION_METHOD.ENGLISH_AUCTION) {
        setState({ loader: true });
        const [blockchainRes, blockchainError] =
          await blockchainApi.endEnglishAuction(
            state.auctionData.auctionid,
            account,
            state.nftData.networkId,
          );
        console.log({ blockchainRes, blockchainError });
        throwIfExists(blockchainError);

        blockchainData = blockchainRes;
      }
      const payload = {
        _winner:
          blockchainData.winner !== '0x0000000000000000000000000000000000000000'
            ? blockchainData.winner
            : account,
        _winningBid: blockchainData.winningbid || 0,
        _bidId: blockchainData.bidid,
        type: state.auctionData.auctiontype,
      };

      const [res, error] = await api.EndAuction(
        payload,
        account,
        collectionaddress,
        tokenid,
        state.nftData.networkId,
      );
      throwIfExists(error);
      if (res) {
        toast.success('Auction closed successfully');
        navigate('/profile');
      }
    } catch (error) {
      console.log({ handleAuctionClose: error });
      toast.error(error.reason || 'Something went wrong');
    } finally {
      setState({ loader: false, buyItAtPriceLoader: false });
    }
  };

  const getCurrentPrice = async (auctionid) => {
    setState({ currentPriceLoader: true });
    try {
      if (state.nftData.networkId !== chainId) {
        await switchNetwork(dispatch, fetchObjectById(state.nftData.networkId));
        return;
      }
      if (account) {
        const [res, error] = await blockchainApi.getCurrentPrice(
          auctionid,
          account,
          state.nftData.networkId,
        );
        throwIfExists(error);
        const [apiRes, apiError] = await api.AuctionPriceUpdate(
          {
            bidId: auctionid,
            type: AUCTION_METHOD.DUTCH_AUCTION,
            _currentPrice: res.eth, //res.eth,
          },
          account,
          collectionaddress,
          tokenid,
          state.nftData.networkId,
        );
        if (!apiRes) throwIfExists(apiError);
        setState({
          currentPrice: res,
        });
      }
    } catch (e) {
      console.log({ getCurrentPrice: e });
    } finally {
      setState({ currentPriceLoader: false });
    }
  };

  console.log({ state });
  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>
      <section className="nft-listing">
        <div className="nft-listing-column">
          <div className="nft-listing-nft-image-container">
            <img
              className="nft-listing-nft-image"
              src={
                state.metaData
                  ? state.metaData.URI
                  : 'https://etherscan.io/images/main/nft-placeholder.svg'
              }
              alt="nft1"
            />
          </div>
          <div className="nft-listing-accordion">
            <Accordion
              desc={state.metaData && state.metaData.description}
              contractAddress={shortenAddress(collectionaddress)}
              tokenId={tokenid}
              chain={state.nftData.networkId || '1'}
              creatorEarnings={state.nftData.earnings} //TODO
            />
          </div>
        </div>
        <div className="nft-listing-column">
          <div className="nft-listing-marketplace">
            <span style={{ color: 'purple' }}>
              {state.nftData && shortenAddress(state.nftData.address)}{' '}
              {state.auctionData ? (
                <span
                  style={{ color: 'grey', fontWeight: '200', fontSize: '15px' }}
                >
                  ( {state.auctionData && state.auctionData.auctiontype} Auction
                  )
                </span>
              ) : (
                ''
              )}
            </span>
            <span>
              <div
                className="btn-group"
                role="group"
                aria-label="Basic example"
              >
                {/* <button type="button" className="btn btn-outline-secondary">
                  <ShareIcon />
                </button>
                <button type="button" className="btn btn-outline-secondary">
                  <ReplayIcon />
                </button> */}
              </div>
            </span>
          </div>
          <h2>{state.nftData && state.nftData.name}</h2>
          {/* <p>Scratch Logo</p> */}
          <div className="nft-listing-owner">
            <span>
              <span>
                <img
                  style={{
                    borderRadius: '50%',
                    width: '25px',
                    marginRight: '5px',
                  }}
                  src="https://i.pinimg.com/736x/54/26/a5/5426a51fe15b4bb1dca378b3f6963d30.jpg"
                  alt=""
                />
                <span>
                  Owned by{' '}
                  {state.nftData && state.nftData.seller
                    ? shortenAddress(state.nftData.seller)
                    : shortenAddress(state.nftData.owner)}
                </span>
              </span>

              {/* <span style={{ paddingLeft: '15px' }}>
                                <ContentCopyRoundedIcon style={{ marginLeft: '15px' }} />
                                <span>Edition 0</span>
                            </span> */}
            </span>
            <span>
              {account &&
                (state.nftData.state === 'SoldAtMarketplace' ||
                  state.nftData.state === 'SoldAtAuction') &&
                state.nftData.owner === account && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '160px', height: '50px' }}
                    onClick={() =>
                      navigate(
                        `/listAsset/${state.nftData.address}/${state.nftData.nftid}/${state.nftData.networkId}`,
                      )
                    }
                    disabled={state.loader}
                  >
                    {state.loader ? <ButtonLoader /> : <b>List</b>}
                  </button>
                )}
              {account &&
                state.marketData &&
                state.nftData.state !== 'SoldAtMarketplace' &&
                state.nftData.state !== 'SoldAtAuction' &&
                state.nftData.seller !== account && (
                  <div>
                    <div>
                      <button
                        style={{ width: '120px', height: '50px' }}
                        onClick={() => setState({ buttonModal: true })}
                        className="btn btn-primary"
                      >
                        <b>Buy NFT</b>
                      </button>
                    </div>

                    <Modal
                      isOpen={state.buttonModal}
                      onRequestClose={() => {
                        setState({ buttonModal: false });
                        document.body.style.overflow = 'auto';
                      }}
                      style={{
                        content: {
                          textAlign: 'center',
                          backgroundColor: '#ffffff',
                          color: '#111111',
                          borderRadius: '15px',
                          zIndex: '999',
                          maxWidth: '500px',
                          maxHeight: '500px',
                          margin: '50px auto',
                        },
                        overlay: {
                          backgroundColor: 'rgba(30, 30, 30, 0.7)',
                        },
                      }}
                    >
                      <button
                        className="login-close-btn"
                        onClick={() => {
                          setState({ buttonModal: false });
                          document.body.style.overflow = 'auto';
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-x"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                      </button>
                      <img
                        className="nft-listing-nft-image"
                        style={{
                          padding: '1rem 3rem 1rem',
                          height: '60%',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                        src={
                          state.metaData
                            ? state.metaData.URI
                            : 'https://etherscan.io/images/main/nft-placeholder.svg'
                        }
                        alt="nft1"
                      />
                      <h2 style={{ marginBottom: '0' }}>
                        {state.nftData && state.nftData.name}
                      </h2>
                      <div style={{ marginTop: '1rem' }}>
                        Price {state.nftData && state.nftData.price}{' '}
                        {ChainDetails(chainId).symbol}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        {state.nftData &&
                          (state.nftData.price * state.maticRate).toFixed(
                            5,
                          )}{' '}
                        USD
                      </div>
                      <div className="buy-modal-buttons">
                        <button
                          className="btn btn-primary buy-modal-button"
                          style={{
                            marginRight: '10px',
                          }}
                          onClick={handleBuy}
                          disabled={state.loader}
                        >
                          {state.loader ? <ButtonLoader /> : <b>Coin Buy</b>}
                        </button>
                        <button
                          className="btn btn-primary buy-modal-button"
                          onClick={handleFiatBuy}
                          disabled={state.fiatloader}
                        >
                          {state.fiatloader ? (
                            <ButtonLoader />
                          ) : (
                            <b>Fiat Buy</b>
                          )}
                        </button>
                      </div>
                    </Modal>
                  </div>
                )}
              {account &&
                state.auctionData &&
                state.auctionData.auctiontype ===
                  AUCTION_METHOD.ENGLISH_AUCTION &&
                (state.auctionData.seller === account ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '160px', height: '50px' }}
                    onClick={handleAuctionClose}
                    disabled={state.loader}
                  >
                    {state.loader ? <ButtonLoader /> : <b>Close Auction</b>}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '160px',
                      height: '50px',
                      display:
                        bidSuccess && state.auctionData.auctiontype === 'Dutch'
                          ? 'none'
                          : 'block',
                    }}
                    onClick={() => setState({ makeBidModal: true })}
                    disabled={state.loader}
                  >
                    {state.loader ? <ButtonLoader /> : <b>Make Bid</b>}
                  </button>
                ))}
            </span>
          </div>
          <div>
            <div>
              {state.auctionData ? 'Start ' : ''}Price:{' '}
              <b>
                <p style={{ fontSize: !state.auctionData ? '35px' : '' }}>
                  {state.nftData && state.nftData.price}{' '}
                  {ChainDetails(chainId).symbol}
                </p>
              </b>
            </div>
            <div>
              {state.auctionData &&
              state.auctionData.endPrice &&
              state.auctionData.auctiontype === 'Dutch'
                ? 'End Price'
                : ' '}
              <b>
                <p>
                  {state.auctionData &&
                    state.auctionData.auctiontype === 'Dutch' &&
                    `${state.auctionData.endPrice} ${
                      ChainDetails(chainId).symbol
                    }`}
                </p>
              </b>
            </div>
            <div>
              {state.auctionData && state.auctionData.auctiontype === 'English'
                ? 'Highest Bidder '
                : ''}
              <b>
                <p>
                  {state.auctionData &&
                    state.auctionData.auctiontype === 'English' &&
                    (state.auctionData.winner
                      ? `${shortenAddress(state.auctionData.winner)}`
                      : 'No Bids Yet')}
                </p>
              </b>
            </div>
          </div>

          {/* auction table */}
          {state.auctionData && (
            <React.Fragment>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  Current{' '}
                  {state.auctionData.auctiontype === 'English'
                    ? ' Highest Bid'
                    : 'Price'}
                  <span style={{ color: 'grey', marginBottom: '0' }}>
                    ( price inclusive of fees )
                  </span>
                  <br />
                  <p style={{ fontSize: '35px', fontWeight: '600' }}>
                    {state.currentPrice
                      ? parseFloat(state.currentPrice.eth).toFixed(2)
                      : state.auctionData &&
                        parseFloat(state.auctionData.currentPrice).toFixed(
                          2,
                        )}{' '}
                    {ChainDetails(chainId).symbol}
                  </p>
                </div>
                <div
                  style={{
                    marginBlock: 'auto',
                  }}
                >
                  {state.currentPrice ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleAuctionClose}
                      disabled={
                        state.buyItAtPriceLoader ||
                        state.nftData.seller === account
                      }
                    >
                      {state.buyItAtPriceLoader ? (
                        <ButtonLoader />
                      ) : (
                        <b>
                          {' '}
                          {account !== state.nftData.seller ? 'Buy it at ' : ''}
                          {parseFloat(state.currentPrice.eth).toFixed(2)}{' '}
                          {ChainDetails(chainId).symbol}
                        </b>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        getCurrentPrice(state.auctionData.auctionid)
                      }
                      disabled={state.currentPriceLoader}
                      style={{
                        display:
                          state.auctionData.auctiontype === 'Dutch'
                            ? 'block'
                            : 'none',
                      }}
                    >
                      {state.currentPriceLoader ? (
                        <ButtonLoader />
                      ) : (
                        <b>Get Current Price</b>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <Clock
                deadline={state.auctionData.endsat}
                text={'Expiring in..'}
              />
            </React.Fragment>
          )}

          {/* Tables */}

          <div>
            <div
              className="nft-listing-trade-history table-responsive"
              style={{ borderRadius: '20px', border: '2px solid #EEEEEE' }}
            >
              <table className="table table-lg" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th colSpan="5">Trade History</th>
                  </tr>
                  <tr className="table-light">
                    <td className="p-3">Price</td>
                    <td className="p-3">From</td>
                    <td className="p-3">To</td>
                    <td className="p-3">Status</td>
                    <td className="p-3">Date</td>
                  </tr>
                </thead>
                {state.nftData &&
                  state.nftData.events.map((event, index) => (
                    <tbody key={index}>
                      <tr>
                        <td className="p-3">
                          {event.price ? Number(event.price).toFixed(3) : '_'}
                        </td>
                        <td className="p-3">
                          {event.from === '0x0000'
                            ? '0x000'
                            : shortenAddress(event.from)}
                        </td>
                        <td className="p-3">{shortenAddress(event.to)}</td>
                        <td className="p-3">{event.event_type}</td>
                        <td className="p-3">
                          {new Date(event.eventTime).toLocaleDateString(
                            'en-IN',
                            options,
                          )}
                        </td>
                      </tr>
                    </tbody>
                  ))}
              </table>
            </div>
          </div>
        </div>

        <Modal
          ariaHideApp={false}
          isOpen={state.makeBidModal}
          onRequestClose={() => {
            setState({ makeBidModal: false });
            document.body.style.overflow = 'auto';
          }}
          style={{
            content: {
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '200px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              color: '#111111',
              borderRadius: '15px',
              zIndex: '999',
            },
            overlay: {
              backgroundColor: 'rgba(30, 30, 30, 0.7)',
            },
          }}
        >
          <button
            className="login-close-btn"
            onClick={() => {
              setState({ makeBidModal: false });
              document.body.style.overflow = 'auto';
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              className="bi bi-x"
              viewBox="0 0 16 16"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
          <h1
            style={{
              fontSize: 'medium',
              fontWeight: 'bold',
              marginTop: '0.1rem',
            }}
          >
            Make Bid
          </h1>
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 'small',
              marginTop: '2rem',
            }}
            onSubmit={handleBid}
          >
            <div className="login-username">
              <input
                // className="login-username"
                placeholder="Bid Amount"
                type="number"
                onChange={(e) => setState({ bidAmount: e.target.value })}
                onBlur={(e) => {
                  const { name, value } = e.target;
                  let fieldError = validateField(name, value);
                  setState({ error: { ...state.error, [name]: fieldError } });
                }}
                value={state.bidAmount}
                name="bidAmount"
                step="any"
                min={
                  state.currentPrice
                    ? state.currentPrice.eth
                    : state.auctionData && state.auctionData.currentPrice
                }
              />
              {state.error.bidAmount && <span>{state.error.bidAmount}</span>}
            </div>
            <button
              className="btn login-btn btn-secondary"
              disabled={state.loader}
              type="submit"
            >
              {state.loader ? <ButtonLoader /> : <b>Make Bid</b>}
            </button>
          </form>
        </Modal>
      </section>
    </React.Fragment>
  );
};
