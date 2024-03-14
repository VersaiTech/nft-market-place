import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';

import {
  injected,
  useReducerPlus,
  shortenAddress,
  BASEAPI_PATH,
} from '../utils';

import logo from '../images/logo.png';
import axios from 'axios';
import Login from './Modals/login';

const Navbar = () => {
  const [state, setState] = useReducerPlus({
    registerModal: false,
    loginModal: false,
    loader: false,
    userName: '',
    email: '',
    password: '',
    walletaddress: '',
    suggestions: [],
    suggestionsnft: [],
    width: window.innerWidth,
    navbarSearch: '',
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { account, active, activate, deactivate, connector } = useWeb3React();

  const updateWidth = () => {
    setState({ width: window.innerWidth });
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(state.navbarSearch);
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.navbarSearch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASEAPI_PATH}/assets/api/getResults?key=${state.navbarSearch}`,
        );
        console.log(response.data.results);
        setState({ suggestionsnft: response.data.results.nfts });
        setState({ suggestions: response.data.results.collections });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (debouncedSearchTerm) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const storedConnector = localStorage.getItem('connector');
    if (storedConnector) {
      activate(injected);
    }
  }, [activate]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0 && accounts[0] !== account) {
        localStorage.removeItem('connector');
        dispatch({
          type: 'RESET_CURRENT_USER',
        });
        deactivate();
        navigate('/');
        // toast.warning("account changed");
      }
    };

    if (active && connector) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // window.ethereum.on("chainChanged", handleAccountsChanged);
    }

    // if (!user) getUserInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, account, connector]);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.currentUser);

  const navigate = useNavigate();

  const filterSearch = (e) => {
    if (e.target.value.trim() === '') {
      setState({ navbarSearch: [] });
    } else {
      setState({ navbarSearch: e.target.value });
    }
  };

  return (
    <nav
      style={{
        paddingTop: '18px',
        paddingBottom: '22px',
        backgroundColor: 'transparent',
      }}
      className="navbar navbar-expand-lg navbar-dark"
    >
      <div className="container-fluid">
        <img
          style={{ width: '100px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
          src={logo}
          className="logo"
          alt="logo"
        />

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <input
          type="search"
          className="nav-input form-control outline-none"
          placeholder="Search NFTs, collections"
          value={state.navbarSearch}
          onChange={(e) => {
            filterSearch(e);
          }}
        />
        <div
          className="suggestions-wrapper"
          style={state.navbarSearch === '' ? { display: 'none' } : {}}
        >
          {state.suggestions && state.suggestions.length > 0 && (
            <div className="suggestions">
              <h3 className="suggestions-heading">Collections</h3>
              {state.suggestions.map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/collections/${item.collection_address}/${item.networkId}`,
                    )
                  }
                  className="suggestion"
                >
                  {console.log(item.collection_address)}
                  {item.collection_name}
                </div>
              ))}
            </div>
          )}

          {state.suggestionsnft && state.suggestionsnft.length > 0 && (
            <div className="suggestions">
              <h3 className="suggestions-heading">NFTs</h3>
              {state.suggestionsnft.map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/marketplace/${item.address}/${item.nftid}/${item.networkId}`,
                    )
                  }
                  className="suggestion"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            {/* <li className="nav-item">
              <NavLink to="/" className="nav-link">
                About
              </NavLink>
            </li> */}
            <li className="nav-item">
              <NavLink to="/explore/all" className="nav-link">
                Explore
              </NavLink>
            </li>
            <li
              className="nav-item nav-link"
              onClick={() => {
                if (!user) {
                  // setLoginModal(true);
                } else {
                  navigate('/mycollection');
                }
              }}
            >
              Collection
              {/* <NavLink to="/mycollection" className="nav-link">
                Collection
              </NavLink> */}
            </li>

            <li
              style={{ marginLeft: state.width > 990 && '13px' }}
              className="nav-item nav-link"
              onClick={() => {
                if (!user) {
                  setState({ loginModal: true });
                } else {
                  navigate('/create');
                }
              }}
            >
              Create
            </li>

            <li className="nav-item">
              {user && user.wallet ? (
                <div className="dropdown">
                  <button
                    className="btn nav-btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {state.loader ? '...' : shortenAddress(user.wallet)}
                  </button>
                  <ul className="dropdown-menu">
                    <li onClick={() => navigate('/profile')}>
                      <span className="dropdown-item">My Profile</span>
                    </li>

                    <li onClick={() => navigate('/createCollection')}>
                      <span className="dropdown-item">Create Collection</span>
                    </li>
                    {/* {!account && (
                      <li onClick={handleMetamaskConnect}>
                        <a className="dropdown-item">Connect Metamask</a>
                      </li>
                    )} */}
                    <li>
                      <button
                        className="explore-btn"
                        onClick={() => {
                          deactivate();
                          localStorage.removeItem('connector');
                          dispatch({
                            type: 'RESET_CURRENT_USER',
                          });
                        }}
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  className="nav-btn"
                  onClick={() => {
                    setState({ loginModal: true });
                    // handleMetamaskConnect();
                    // setLoginModal(true);
                    //   setLoginModal(true);
                    //   document.body.style.overflow = "hidden";
                  }}
                >
                  Connect Mundum
                </button>
              )}

              <Login
                loginModal={state.loginModal}
                setLoginModal={(flag) => setState({ loginModal: flag })}
              />

              {/* REGISTER MODAL */}
              {/* <Register
                registerModal={state.register}
                setRegisterModal={(flag) => setState({ loginModal: flag })}
              /> */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
