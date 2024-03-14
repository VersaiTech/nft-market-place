import { Route, Routes, BrowserRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

//WEB3
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

//TOASTER
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// REDUX
import { Provider } from 'react-redux';
import store from './redux/store';

import './App.css';
import { API, throwIfExists } from './utils/';

import {
  RequireAuth,
  NFTListing,
  CreateNFT,
  Explore,
  Profile,
  CreateCollection,
  CollectionDetails,
  MyCollection,
  ListAsset,
  Hompage,
  Admin,
  Checkout,
  Success,
  Cancel,
} from './Components';

function getLibrary(provider) {
  return new Web3Provider(provider);
}

const App = () => {
  const [trendingNft, setTrendingNft] = useState([]);

  const getTrendingNft = async (chainId) => {
    try {
      const [res, error] = await API.GetTrendingNft(chainId);
      throwIfExists(error);
      setTrendingNft(res.assets.slice(0, 8));
    } catch (error) {}
  };

  useEffect(() => {
    getTrendingNft(137);
  }, []);

  return (
    <Provider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Hompage trendingNft={trendingNft} />} />
            <Route path="/explore/:category" element={<Explore />} />
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <CreateNFT />
                </RequireAuth>
              }
            />
            <Route
              path="/createCollection"
              element={
                <RequireAuth>
                  <CreateCollection />
                </RequireAuth>
              }
            />
            <Route
              path="/marketplace/:collectionaddress/:tokenid/:networkId"
              element={<NFTListing />}
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/collections/:collectionaddress/:networkId"
              element={
                <RequireAuth>
                  <CollectionDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/mycollection"
              element={
                <RequireAuth>
                  <MyCollection />
                </RequireAuth>
              }
            />

            <Route
              path="/listAsset/:collectionaddress/:tokenid/:networkId"
              element={
                <RequireAuth>
                  <ListAsset />
                </RequireAuth>
              }
            />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/checkout/:id/success" element={<Success />} />
            <Route path="/checkout/:id/cancel" element={<Cancel />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </Web3ReactProvider>
    </Provider>
  );
};

export default App;
