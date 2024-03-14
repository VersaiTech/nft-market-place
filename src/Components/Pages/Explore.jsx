import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../Navbar';
import Card from '../Card';
import ExploreAccordian from '../ExploreAccordian';
import * as api from '../../utils/api';
import { ChainDetails, throwIfExists } from '../../utils/helper';
import { useReducerPlus } from '../../utils/useReducerPlus';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CHAIN_DATA } from '../../utils/category';
import ButtonLoader from '../ButtonLoader';
import { toast } from 'react-toastify';

const opennavStyles = {
  mySidebarTab: {
    width: '200px',
  },
  mySidebarLaptop: {
    width: '300px',
  },
  main: {
    marginLeft: '13rem',
  },
  mainTab: {
    marginLeft: '5rem',
  },
};

const closenavStyles = {
  mySidebar: {
    width: '0',
  },
  main: {
    marginLeft: '0',
  },
};

export const Explore = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const chain = useSelector((state) => state.chainReducer);

  const [filter, setFilter] = useState('');
  const sidebarButton = useRef('');
  const [state, setState] = useReducerPlus({
    nfts: [],
    chain: chain,
    slider: false,
    width: window.innerWidth,
    loader: false,
  });

  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSingleCollection = async (collectionaddress, chainId) => {
    try {
      const [res, error] = await api.GetSingleCollection(
        collectionaddress,
        chainId,
      );
      throwIfExists(error);
      setState({ nfts: res.assets });
    } catch (error) {
      console.log({ getSingleCollection: error });
    }
  };

  const getAllAssets = async (category) => {
    setState({ loader: true });
    try {
      console.log('calling getAllAssets');
      const [res, error] = await api.getAllMarketplaceNft(
        category,
        state.chain.id,
      );
      throwIfExists(error);
      if (category === 'All' || category === 'all') {
        setState({ nfts: res.nfts });
      } else {
        setState({ nfts: res.assets });
      }
    } catch (error) {
      console.log({ getAllAssets: error });
    } finally {
      setState({ loader: false });
    }
  };

  useEffect(() => {
    if (category) getAllAssets(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, state.chain, filter]);

  const updateWidth = () => {
    setState({ width: window.innerWidth });
  };

  const handleNetworkChange = async (e) => {
    const { value } = e.target;
    const chain = JSON.parse(value);
    try {
      setState({ chain });
      dispatch({
        type: 'SET_CURRENT_CHAIN',
        payload: ChainDetails(chain.id),
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <React.Fragment>
      <div
        style={{
          background: 'linear-gradient(#26592d, #000000)',
          zIndex: '10',
          position: 'relative',
        }}
      >
        <div className="container">
          <Navbar />
        </div>
      </div>

      <div ref={sidebarButton} className="explore-sidebar-button">
        <button
          className="openbtn"
          onClick={() => {
            sidebarButton.current.style.display = 'none';
            setState({ slider: true });
          }}
        >
          &#9776;
        </button>
      </div>

      <div
        id="mySidebar"
        className="sidebar"
        style={
          state.slider && state.width > 1000
            ? opennavStyles.mySidebarLaptop
            : state.slider && state.width > 600
            ? opennavStyles.mySidebarTab
            : closenavStyles.mySidebar
        }
      >
        <span
          className="closebtn"
          onClick={() => {
            setTimeout(() => {
              sidebarButton.current.style.display = 'block';
            }, 500);
            setState({ slider: false });
          }}
          style={{ color: 'black', padding: '5px', cursor: 'pointer' }}
        >
          &times;
        </span>
        <ExploreAccordian
          state={state}
          filter={filter}
          setFilter={setFilter}
          getSingleCollection={getSingleCollection}
        />
      </div>

      <div className="container">
        <div
          id="main"
          style={
            state.slider && state.width > 1000
              ? opennavStyles.main
              : state.slider && state.width > 700
              ? opennavStyles.mainTab
              : closenavStyles.main
          }
        >
          <div>
            <div style={{ marginBottom: '3rem' }} className="spot-light">
              <div
                className="explore-mobile-accordian"
                style={{ marginBottom: '50px' }}
              >
                <ExploreAccordian
                  state={state}
                  filter={filter}
                  setFilter={setFilter}
                  getSingleCollection={getSingleCollection}
                />
              </div>
              <h6>IN THE SPOT LIGHT</h6>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Handpicked Digital Assets</h1>
                <div className="form-group">
                  <div className="create-dropdown">
                    <label htmlFor="chain">Select Chain</label>
                    <select
                      name="chain"
                      id="chain"
                      onChange={handleNetworkChange}
                    >
                      {CHAIN_DATA.map((chn, index) => (
                        <option
                          value={JSON.stringify(chn)}
                          key={index}
                          selected={chain.id === chn.id}
                        >
                          {chn.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                {state.loader ? (
                  <ButtonLoader />
                ) : state.nfts && state.nfts.length > 0 ? (
                  state.nfts.map(
                    (nft, index) =>
                      nft.state !== 'Inactive' &&
                      nft.state !== 'SoldAtMarketplace' &&
                      nft.state !== 'SoldAtAuction' && (
                        <Card item={nft} chainId={chain.id} key={index} />
                      ),
                  )
                ) : (
                  <span>No Nft found</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
