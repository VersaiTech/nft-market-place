import React, { useEffect, useRef } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  CHAIN_DATA,
  throwIfExists,
  switchNetwork,
  useReducerPlus,
  handleMetaDataIpfs,
  validateField,
  validateFields,
  BlockchainApi,
  API,
} from '../../utils/index';
import Navbar from '../Navbar';
import ButtonLoader from '../ButtonLoader';
import ImageCropper from '../Modals/image-cropper';

export const CreateNFT = () => {
  const navigate = useNavigate();

  const { account, chainId } = useWeb3React();
  const nftImage = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.currentUser);
  const chain = useSelector((state) => state.chainReducer);

  const [state, setState] = useReducerPlus({
    file: null,
    name: '',
    royality: '',
    description: '',
    collection: null,
    URI: '',
    collectionData: [],
    loader: false,
    imageUploadLoder: false,
    chain: chain,
    error: {},
    rawFile: null,
    touched: {
      name: false,
      royality: false,
      description: false,
      file: false,
    },
    modalToggle: false,
  });

  useEffect(() => {
    if (user) {
      getUserCollection(state.chain.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chain]);

  const getUserCollection = async (chainId) => {
    try {
      const [res, error] = await API.GetUserCollection(
        account || user.wallet,
        chainId,
      );
      throwIfExists(error);
      setState({
        collectionData: res.collection.length > 0 ? res.collection : null,
        collection: res.collection[0].collection_address || null,
      });
      dispatch({ type: 'UPDATE_USER_COLLECTION', payload: res.collection });
    } catch (e) {
      console.log({ getUserCollection: e });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
      touched: { ...state.touched, [name]: true },
    });
  };

  const handleNetworkChange = async (e) => {
    const { value } = e.target;
    const chain = JSON.parse(value);
    try {
      setState({ collectionData: null, chain, collection: null });
      getUserCollection(chain.id);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    setState({ imageUploadLoder: true });
    const url = URL.createObjectURL(file);

    if (file) {
      setState({
        file: url,
        modalToggle: true,
        rawFile: file,
        //  URI: path,
      });
    }

    const fieldError = validateField('file', file);
    setState({
      error: { ...state.error, file: fieldError },
      imageUploadLoder: false,
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setState({ error: { ...state.error, [name]: fieldError } });
  };

  const handleSubmit = async (e) => {
    console.log('submit');
    e.preventDefault();

    // formValidation
    const fieldsToValidate = ['name', 'royality', 'description', 'URI'];
    const isValidFields = validateFields(fieldsToValidate, state, setState);
    if (!isValidFields) return;

    setState({ loader: true });
    try {
      const { URI, description, collection, name, chain } = state;
      if (!collection) {
        toast.error('No collection selected');
        setState({ loader: false });
        return;
      }
      if (chain.id !== chainId) {
        await switchNetwork(dispatch, state.chain);
      }
      console.log({ account });
      if (account) {
        setState({ loader: true });

        const metaObj = {
          name,
          description,
          URI,
        };

        const metaDataURI = await handleMetaDataIpfs(metaObj);

        const [tokenRes, tokenError] = await BlockchainApi.CreateNFT({
          collectionaddress: collection,
          URI: metaDataURI,
        });

        throwIfExists(tokenError);
        const payload = {
          URI: metaDataURI,
          desc: description,
          traits: '{}',
          collectionaddress: collection,
          creator: tokenRes.creator,
          tokenId: tokenRes.tokenid,
          name,
          earnings: state.royality,
        };

        const [nftRes, nftError] = await API.CreateToken(
          account,
          payload,
          state.chain.id,
        );
        throwIfExists(nftError);
        if (nftRes) {
          toast.success('Minted successfully');
          navigate(
            `/listAsset/${collection}/${tokenRes.tokenid}/${state.chain.id}`,
          );
        }
      } else {
        toast.error('Metamask not connected');
      }
    } catch (error) {
      console.log({ handleSubmit: e });
      toast.error(error.reason || error.message);
    } finally {
      setState({ loader: false });
    }
  };

  const handleCropSubmit = (data) => {
    setState({ URI: data });
  };

  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>
      <div className="container">
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <form
            className="row create-nft-component"
            style={{ width: '100%' }}
            onSubmit={handleSubmit}
          >
            <div className="col-lg-4 overflow-hidden create-nft-image">
              {(state.file || state.rawFile) && state.URI ? (
                <img src={state.URI} className="dotted-border-img" alt="file" />
              ) : (
                <div className="upload-button">
                  <label for="nft-upload-button" className="btn save-btn">
                    {state.imageUploadLoder ? (
                      <ButtonLoader />
                    ) : (
                      'Upload your NFT'
                    )}
                  </label>
                  <input
                    id="nft-upload-button"
                    className="dotted-border"
                    type="file"
                    onChange={handleFileUpload}
                    ref={nftImage}
                  />
                  {state.error.file && <span>{state.error.file}</span>}
                </div>
              )}
            </div>
            <div className="col-lg-4">
              <div className="create-nft">
                <div className="form-group">
                  <label htmlFor="name-field">
                    Name<span>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-control"
                    id="name-field"
                    // required
                  />
                  {state.error.name && (
                    <span className="error">{state.error.name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="royalty">
                    Royalty (%)<span>*</span>
                  </label>
                  <input
                    name="royality"
                    value={state.royality}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    type="number"
                    className="form-control"
                    id="royalty"
                    min="0"
                    // required
                  />
                  {state.error.royality && (
                    <span className="error">{state.error.royality}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="description-field">
                    Description<span>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={state.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="120"
                    className="form-control"
                    id="description-field"
                    // required
                  />
                  {state.error.description && (
                    <span className="error">{state.error.description}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="create-nft">
                <div className="form-group">
                  <label htmlFor="quantity-field">Quantity</label>
                  <input
                    type="text"
                    className="form-control"
                    id="quantity-field"
                    aria-describedby="emailHelp"
                    value={1}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <div className="create-dropdown">
                    <label htmlFor="collection">Collection</label>

                    <select
                      name="collection"
                      id="collection"
                      onChange={handleChange}
                      required
                    >
                      <option disabled selected>
                        Select collection
                      </option>
                      {state.collectionData &&
                      state.collectionData.length > 0 ? (
                        state.collectionData.map((collection, index) => (
                          <option
                            value={collection.collection_address}
                            key={index}
                          >
                            {collection.collection_name}
                          </option>
                        ))
                      ) : (
                        <option disabled selected>
                          No collection found
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div className="create-dropdown">
                    <label htmlFor="chain">Select Chain</label>
                    <select
                      name="chain"
                      id="chain"
                      onChange={handleNetworkChange}
                    >
                      {CHAIN_DATA.map((chain, index) => (
                        <option
                          value={JSON.stringify(chain)}
                          key={index}
                          selected={state.chain.id === chain.id}
                        >
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button className="btn save-btn" type="submit">
              {state.loader ? <ButtonLoader /> : 'Mint'}
            </button>
          </form>
        </span>
      </div>

      <ImageCropper
        src={state.file}
        width={1}
        height={1}
        cropperModal={state.modalToggle}
        setCropperModal={(flag) => {
          setState({
            modalToggle: false,
            file: null,
          });
        }}
        handleSubmit={handleCropSubmit}
        file={state.rawFile}
      />
    </React.Fragment>
  );
};

// export default CreateNFT;
