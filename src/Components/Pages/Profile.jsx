import React, { useEffect, useRef } from 'react';
import Navbar from '../Navbar';
import Card from '../Card';
import { useWeb3React } from '@web3-react/core';
import { useReducerPlus } from '../../utils/useReducerPlus';
import {
  GetUserAssets,
  GetUserCollectedAssets,
  UpadteUserProfilePic,
} from '../../utils/api';
import { shortenAddress, throwIfExists } from '../../utils/helper';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CHAIN_DATA } from '../../utils/category';
import { toast } from 'react-toastify';
import ButtonLoader from '../ButtonLoader';
import ImageCropper from '../Modals/image-cropper';

const ITEM_TYPE = {
  MINTED: 'minted',
  COLLECTED: 'collected',
};

export const Profile = () => {
  const { account } = useWeb3React();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.currentUser);
  const chain = useSelector((state) => state.chainReducer);
  const hiddenProfileInput = useRef(null);

  function handleClickProfile() {
    hiddenProfileInput.current.click();
  }

  const navigate = useNavigate();

  const [state, setState] = useReducerPlus({
    nftData: [],
    itemType: ITEM_TYPE.MINTED,
    collectedNft: [],
    chain: chain,
    profilePicUpdateLoader: false,
    modal: false,
    file: null,
    rawFile: null,
    imageUrl: user.profile_url || 'https://robohash.org/hicvesldicta.png',
  });

  useEffect(() => {
    if (user) {
      if (state.itemType === ITEM_TYPE.MINTED) getUserAssets();
      if (state.itemType === ITEM_TYPE.COLLECTED) getUsersCollectedAssets();
    } else navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chain]);

  const getUserAssets = async () => {
    try {
      const [res, error] = await GetUserAssets(
        account || user.wallet,
        state.chain.id,
      );
      throwIfExists(error);
      let nft = [];
      res.assets.collections.map(
        (collection) =>
          collection.items.length > 0 &&
          collection.items.map((item) => nft.push(item)),
      );
      setState({ nftData: nft });
    } catch (error) {}
  };

  const getUsersCollectedAssets = async () => {
    try {
      const [res, error] = await GetUserCollectedAssets(
        account || user.wallet,
        state.chain.id,
      );
      throwIfExists(error);
      setState({ collectedNft: res.assets });
    } catch (error) {}
  };

  const handleTabChange = (type) => {
    setState({ itemType: type });
  };

  const handleNetworkChange = async (e) => {
    setState({ chain: JSON.parse(e.target.value) });
  };

  const handleProfileUpdate = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    setState({ profilePicUpdateLoader: true });
    try {
      if (file.type.includes('image')) {
        const url = URL.createObjectURL(file);
        // modalToggle;
        setState({ file: url, modal: true, rawFile: file });
        // const path = await handleFileIpfs(files);
        // if (path) {
        //   const [res, error] = await UpadteUserProfilePic(path, user.username);
        //   if (!res || error) throwIfExists(error);
        //   dispatch({ type: 'UPDATE_PROFILE_PIC_URL', payload: path });
        //   setState({ imageUrl: path });
        //   toast.success('Updated successfully');
        // }
      } else {
        toast.warn('Only image is accepted');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setState({ profilePicUpdateLoader: false });
    }
  };

  const handleCropSubmit = async (data) => {
    setState({ URI: data });
    try {
      const [res, error] = await UpadteUserProfilePic(data, user.username);
      if (!res || error) throwIfExists(error);
      dispatch({ type: 'UPDATE_PROFILE_PIC_URL', payload: data });
      setState({ imageUrl: data });
      toast.success('Updated successfully');
    } catch (e) {}
  };

  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>

      <span className="container" style={{ padding: '0' }}>
        <div className="profile-section">
          <div className="profile-buttons">
            <div className="">
              <input
                ref={hiddenProfileInput}
                type="file"
                onChange={handleProfileUpdate}
                accept="image/png, image/jpeg"
                style={{ width: '0', height: '0', opacity: '0' }}
              />
              <button className="btn btn-primary" onClick={handleClickProfile}>
                Update Profile
              </button>
            </div>
          </div>
          <div className="profile-banner" alt="banner-img">
            <div
              className="card bg-transparent"
              style={{
                width: '11rem',
                textAlign: 'center',
                top: '71%',
                border: '0',
                left: '2rem',
                pointerEvents: 'none',
              }}
            >
              {state.profilePicUpdateLoader ? (
                <div className="card-img-top profile-img">
                  <ButtonLoader />
                </div>
              ) : (
                <img
                  src={state.imageUrl}
                  className="card-img-top profile-img"
                  alt="settings"
                />
              )}
              <div className="card-body">
                <div>
                  <h5 style={{ fontWeight: 'bold' }} className="card-title">
                    {user.username}
                  </h5>
                  <h6>{shortenAddress(user.wallet)}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </span>
      <div className="profile-content container">
        <div className="row" style={{ width: '99vw' }}>
          <div
            className="col-lg-3"
            style={{
              borderRight: '1px solid #eaeaf1',
              padding: '0 0 3rem 0',
            }}
          >
            <ul className="tabs-group">
              <div
                className={`tabs-group-tab ${
                  state.itemType === ITEM_TYPE.MINTED && 'tabs-group-tab-active'
                }`}
                onClick={() => {
                  getUserAssets();
                  handleTabChange(ITEM_TYPE.MINTED);
                }}
              >
                <li>Minted</li>
              </div>
              <div
                className={`tabs-group-tab ${
                  state.itemType === ITEM_TYPE.COLLECTED &&
                  'tabs-group-tab-active'
                }`}
                onClick={() => {
                  getUsersCollectedAssets();
                  handleTabChange(ITEM_TYPE.COLLECTED);
                }}
              >
                <li>Collected</li>
              </div>
              <div className={`tabs-group-tab`} style={{ marginTop: '30px' }}>
                <li>
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
                            // selected={chain.id === chn.id}
                          >
                            {chn.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </li>
              </div>
            </ul>
          </div>
          <div className="col-lg-9">
            {state.itemType === ITEM_TYPE.MINTED && (
              <div>
                <div style={{ marginBottom: '3rem' }} className="">
                  <div className="row" style={{ width: '99%' }}>
                    {state.nftData.length > 0 ? (
                      state.nftData.map(
                        (nft, index) =>
                          !nft.state.includes('Sold') && (
                            <Card item={nft} key={index} />
                          ),
                      )
                    ) : (
                      <span style={{ padding: '10px' }}>No Item</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.itemType === ITEM_TYPE.COLLECTED && (
              <div>
                <div style={{ marginBottom: '3rem' }} className="">
                  <div className="row" style={{ width: '99%' }}>
                    {state.collectedNft.length > 0
                      ? state.collectedNft.map((nft, index) => (
                          <Card item={nft} key={index} />
                        ))
                      : 'No Item'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageCropper
        src={state.file}
        width={1}
        height={1}
        cropperModal={state.modal}
        setCropperModal={(flag) => {
          setState({
            modal: false,
            file: null,
          });
        }}
        handleSubmit={handleCropSubmit}
        file={state.rawFile}
      />
    </React.Fragment>
  );
};
