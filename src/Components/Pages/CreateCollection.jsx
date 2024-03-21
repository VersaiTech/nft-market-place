import { useRef, React } from 'react';
import PhotoIcon from '@mui/icons-material/Photo';
import LanguageIcon from '@mui/icons-material/Language';
import InfoIcon from '@mui/icons-material/Info';
import { useWeb3React } from '@web3-react/core';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ButtonLoader from '../ButtonLoader';
import Navbar from '../Navbar';
import {
  BlockchainApi,
  useReducerPlus,
  API,
  throwIfExists,
  CATEGORY,
  CHAIN_DATA,
  switchNetwork,
  validateField,
  validateFields,
} from '../../utils';

import ImageCropper from '../Modals/image-cropper';

export const CreateCollection = () => {
  const { account, chainId } = useWeb3React();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.authReducer.currentUser);
  const chain = useSelector((state) => state.chainReducer);

  const hiddenFileInputLogo = useRef(null);
  const hiddenFileInputFeatured = useRef(null);
  const hiddenFileInputBanner = useRef(null);

  const [state, setState] = useReducerPlus({
    logo: null,
    banner: null,
    rawlogo: null,
    rawbanner: null,
    croppedLogo: null,
    croppedBanner: null,
    name: '',
    category: '',
    url: '',
    description: '',
    tags: '',
    links: '',
    address: '',
    earnings: '',
    logoURI: '',
    bannerURI: '',
    loader: {
      logo: false,
      banner: false,
      button: false,
    },
    chain: chain,
    error: {},

    toggleModal: {
      logo: false,
      banner: false,
    },
  });

  function handleClick(input_name) {
    if (input_name === 'logo') hiddenFileInputLogo.current.click();
    else if (input_name === 'featured') hiddenFileInputFeatured.current.click();
    else if (input_name === 'banner') hiddenFileInputBanner.current.click();
  }

  const handleFileUpload = async (e, input_name) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) {
      const raw = `raw${input_name}`;
      const url = URL.createObjectURL(file);
      setState({
        loader: {
          [input_name]: true,
        },
        toggleModal: {
          [input_name]: true,
        },
        [input_name]: url,
        [raw]: file,
      });

      let fieldError = validateField(input_name, file);
      setState({ error: { ...state.error, [input_name]: fieldError } });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let fieldError = validateField(name, value);
    if (name === 'url' && value === '') {
      fieldError = null;
    }
    setState({ error: { ...state.error, [name]: fieldError } });
  };

  const handleSubmit = async (e) => {
    setState({
      loader: {
        button: true,
      },
    });
    e.preventDefault();

    try {
      if (state.chain.id !== chainId) {
        await switchNetwork(dispatch, state.chain);
      }

      const {
        name,
        earnings,
        address,
        description,
        featuredURI,
        croppedLogo,
        croppedBanner,
        url,
        links,
        category,
      } = state;

      const fieldsToValidate = [
        'name',
        'description',
        'category',
        'croppedLogo',
        'croppedBanner',
        ...(state.url && ['url']),
      ];

      const isValidFields = validateFields(fieldsToValidate, state, setState);
      if (!isValidFields) return;

      if (account === user.wallet) {
        const [blockchainRes, blockchainError] =
          await BlockchainApi.CreateCollection({
            walletaddress: account,
            collectionname: name,
            collectionsymbol: name
              .toUpperCase()
              .split(' ')
              .map((word) => word.charAt(0))
              .join(''),
            royaltyfee: earnings || 0,
            royaltyrecipient: address ? address : account,
          });
        throwIfExists(blockchainError);

        const payload = {
          collectionname: name,
          symbol: name
            .toUpperCase()
            .split(' ')
            .map((word) => word.charAt(0))
            .join(''),
          royaltyrecipient: address ? address : account,
          description,
          category, //todo
          logoURI: croppedLogo,
          bannerURI: croppedBanner,
          featuredURI,
          URL: url,
          links,
          creator_earnings: earnings,
          collectionaddress: blockchainRes.collectionaddress,
        };

        const [collectionRes, collectionError] = await API.CreateCollection(
          payload,
          account,
          state.chain.id,
        );
        throwIfExists(collectionError);
        if (collectionRes) {
          toast.success('Collection created successfully!');
          navigate('/mycollection');
        }
      } else {
        toast.error('Metamask not connected');
      }
    } catch (e) {
      console.log({ handleSubmit: e });
      toast.error(e.reason);
    } finally {
      setState({
        loader: {
          button: false,
        },
      });
    }
  };

  const handleNetworkChange = async (e) => {
    setState({ chain: JSON.parse(e.target.value) });
  };

  const handleCropSubmit = (data) => {
    if (state.toggleModal.logo) setState({ croppedLogo: data });
    else {
      setState({ croppedBanner: data });
    }
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>

      <form
        className="create-collection-form"
        action=""
        onSubmit={handleSubmit}
      >
        <h1>Create Collection</h1>
        <p>
          Required Fields<span style={{ color: 'red' }}>*</span>
        </p>
        {/* Logo Image */}
        <div className="image-container">
          <label htmlFor="" style={{ fontSize: '20px' }}>
            Logo Image<span style={{ color: 'red' }}>*</span>
          </label>
          <p>
            This image will also be used as navigation. 350 x 350 recommended.
          </p>
          <input
            ref={hiddenFileInputLogo}
            onChange={(e) => {
              handleFileUpload(e, 'logo');
            }}
            style={{ width: '0', height: '0', opacity: '0' }}
            type="file"
            name="logo"
          />
          <div
            className="create-collection-logo"
            onClick={() => handleClick('logo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!state.croppedLogo ? (
              state.loader.logo ? (
                <ButtonLoader />
              ) : (
                <PhotoIcon sx={{ fontSize: 60 }} />
              )
            ) : (
              <img
                src={state.croppedLogo}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  height: '100%',
                  width: '100%',
                  borderRadius: '50%',
                }}
                alt="logo-file"
              />
            )}
          </div>
          {state.error.logo && (
            <span className="errorMsg">{state.error.logo}</span>
          )}
        </div>
        {/* Banner Image */}
        <div className="image-container">
          <label htmlFor="" style={{ fontSize: '20px' }}>
            Banner Image<span style={{ color: 'red' }}>*</span>
          </label>
          <p>
            This image will appear at the top of your collection page. Avoid
            including too much text in this banner image, as the dimensions
            change on different devices. 1400 x 350 recommended.
          </p>
          <input
            ref={hiddenFileInputBanner}
            onChange={(e) => handleFileUpload(e, 'banner')}
            style={{ width: '0', height: '0', opacity: '0' }}
            type="file"
            name="banner"
            id=""
          />
          <div
            className="create-collection-banner"
            onClick={() => handleClick('banner')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!state.croppedBanner ? (
              state.loader.banner ? (
                <ButtonLoader />
              ) : (
                <PhotoIcon sx={{ fontSize: 60 }} />
              )
            ) : (
              <img
                src={state.croppedBanner}
                style={{
                  objectFit: 'inherit',
                  objectPosition: 'center',
                  height: '100%',
                  width: '100%',
                  borderRadius: '1rem',
                }}
                alt="banner-file"
              />
            )}
          </div>
          {state.error.banner && (
            <span className="errorMsg">{state.error.banner}</span>
          )}
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="" style={{ fontSize: '20px' }}>
            Name<span style={{ color: 'red' }}>*</span>
          </label>
          <input
            className="form-control"
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            name="name"
            value={state.name}
            placeholder="Examples: Treasures of the Sea"
          />
          {state.error.name && (
            <span className="errorMsg">{state.error.name}</span>
          )}
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="" style={{ fontSize: '20px' }}>
            URL
          </label>
          <p>
            Customize your URL on CoinWiz. Must only contain lowercase letters,
            numbers and hyphens
          </p>
          <input
            className="form-control"
            onChange={handleChange}
            onBlur={handleBlur}
            value={state.url}
            type="text"
            name="url"
            placeholder="https://artnotion.io/collection/treases of the sea"
          />
          {state.error.url && (
            <span className="errorMsg">{state.error.url}</span>
          )}
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="" style={{ fontSize: '20px' }}>
            Description<span style={{ color: 'red' }}>*</span>
          </label>
          <p>
            <span style={{ color: '#0099ff' }}>Markdown</span> syntax is
            supported. 0 of 1000 characters used
          </p>
          <textarea
            className="form-control"
            placeholder="Provide a detailed description of your item"
            onChange={handleChange}
            onBlur={handleBlur}
            value={state.description}
            name="description"
            id=""
            rows="5"
          />
          {state.error.description && (
            <span className="errorMsg">{state.error.description}</span>
          )}
        </div>
        <div className="input-container">
          <label htmlFor="" style={{ fontSize: '20px' }}>
            Category and Tags
          </label>
          <p>
            Make your items more discoverable on CoinWiz by adding tags and a
            category.
          </p>
          <select
            className="form-select"
            onChange={handleChange}
            onBlur={handleBlur}
            name="category"
            aria-label="Default select example"
          >
            <option selected disabled value="">
              Select one item
            </option>
            {CATEGORY.map((collection, index) => (
              <option value={collection.val} key={index}>
                {collection.name}
              </option>
            ))}
          </select>
          {state.error.category && (
            <span className="errorMsg" style={{ bottom: 10 }}>
              {state.error.category}
            </span>
          )}
        </div>
        <div className="input-container category-info-section">
          <InfoIcon style={{ float: 'left', color: '#0099ff' }} />
          <div style={{ paddingLeft: '2rem' }}>
            <strong>Category options have been updated</strong>
            <p>
              Your category may have changed as part of this update. You can
              review and change your category and tags at any time. Up to 5 tags
              can be selected.
            </p>
          </div>
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="" style={{ fontSize: '20px' }}>
            Links
          </label>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              <LanguageIcon />
            </span>
            <input
              type="text"
              className="form-control"
              onChange={handleChange}
              name="links"
              placeholder="https://artnotion.io/collection/treases of the sea"
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
        <div className="input-container creator-earnings">
          <label htmlFor="" style={{ fontSize: '20px' }}>
            Creator earnings
          </label>
          <p>
            Collection owners can collect creator earnings when a user re-sells
            an item they created. Contact the collection owner to change the
            collection earnings percentage or the payout address.
          </p>
          <input
            className="form-control"
            onChange={handleChange}
            type="text"
            name="address"
            id=""
            placeholder="Please enter an address"
          />
          <input
            className="form-control"
            type="number"
            onChange={handleChange}
            name="earnings"
            id=""
            placeholder="%"
            min="0"
          />
          <br />
        </div>
        <div className="input-container form-group">
          <div className="create-dropdown">
            <label htmlFor="chain">Select Chain</label>
            <select name="chain" id="chain" onChange={handleNetworkChange}>
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
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '8rem', marginBlock: '2rem' }}
          disabled={state.loader.button}
        >
          {state.loader.button ? <ButtonLoader /> : 'Create'}
        </button>

        <ImageCropper
          src={state.logo}
          width={1}
          height={1}
          cropperModal={state.toggleModal.logo}
          setCropperModal={(flag) => {
            setState({
              toggleModal: {
                logo: flag,
              },
              logo: null,
              loader: {
                logo: false,
              },
            });
          }}
          handleSubmit={handleCropSubmit}
          file={state.rawlogo}
        />

        <ImageCropper
          src={state.banner}
          width={4}
          height={1}
          cropperModal={state.toggleModal.banner}
          setCropperModal={(flag) => {
            setState({
              toggleModal: {
                banner: flag,
              },
              banner: null,
            });
          }}
          handleSubmit={handleCropSubmit}
          file={state.rawbanner}
        />
      </form>
    </div>
  );
};
