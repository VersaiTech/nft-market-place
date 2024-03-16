import React, { useEffect } from 'react';
import Modal from 'react-modal';
import {
  API,
  throwIfExists,
  useReducerPlus,
  validateField,
  validateFields,
  switchNetwork,
  handleMetamaskConnect,
} from '../../utils';
import { useDispatch, useSelector } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import {
  ChainDetails,
  MAX_RETRY_COUNT,
  delay,
  getDelayTime,
  handleError,
} from '../../utils/helper';
import ButtonLoader from '../ButtonLoader';
import { toast } from 'react-toastify';

const formType = {
  login: 'LOGIN',
  register: 'REGISTER',
};

export default function Login({ loginModal, setLoginModal }) {
  const appElement = document.getElementById('root');
  Modal.setAppElement(appElement);

  const dispatch = useDispatch();
  const { account, activate } = useWeb3React();
  const user = useSelector((state) => state.authReducer.currentUser);

  const [state, setState] = useReducerPlus({
    formType: formType.login,
    loginData: {
      userName: '',
      password: '',
    },
    registerData: {
      userName: '',
      email: '',
      password: '',
      walletAddress: '',
    },
    error: {},
    loader: { login: false, register: false, metamask: false },
  });

  useEffect(() => {
    setState({
      formType: formType.login,
      error: {},
      loader: { login: false, register: false, metamask: false },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const formDataKey =
      state.formType === formType.login ? 'loginData' : 'registerData';

    setState({
      [formDataKey]: {
        ...state[formDataKey],
        [name]: value,
      },
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setState({ error: { ...state.error, [name]: fieldError } });
  };

  const handleLogin = async (e) => {
    setState({
      loader: {
        login: true,
      },
    });
    try {
      e.preventDefault();
      const fieldsToValidate = ['userName', 'password'];
      const isValidFields = validateFields(
        fieldsToValidate,
        state.loginData,
        setState,
      );
      if (!isValidFields) return;
      const { userName, password } = state.loginData;
      const [loginRes, loginError] = await API.login({
        username: userName,
        password,
      });
      throwIfExists(loginError);
      setLoginModal(false);
      dispatch({ type: 'UPDATE_CURRENT_USER', payload: loginRes });
    } catch (error) {
      handleError(error);
    } finally {
      setState({
        loader: {
          login: false,
        },
      });
    }
  };

  const getUserInformation = async () => {
    try {
      const [loginRes, loginError] = await API.metaskLogin({
        walletaddress: account,
      });
      if (loginError) {
        throwIfExists(loginError);
        return;
      }
      dispatch({ type: 'UPDATE_CURRENT_USER', payload: loginRes });
      setLoginModal(false);
    } catch (e) {
      if (e.message === 'Not Registered!') {
        setState({
          formType: formType.register,
          registerData: {
            walletAddress: account,
          },
        });
      }
      handleError(e);
      // console.log(e);
    } finally {
      setState({
        loader: {
          metamask: false,
          login: false,
          register: false,
        },
      });
    }
  };

  useEffect(() => {
    if (!user && account) getUserInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleConnect = async () => {
    setState({
      loader: {
        metamask: true,
      },
    });
    try {
      let retryCount = 0;
      let res;

      while (retryCount < MAX_RETRY_COUNT) {
        res = await handleMetamaskConnect(
          dispatch,
          ChainDetails(137),
          activate,
        );
        if (res) {
          await getUserInformation();
          break;
        }

        retryCount++;
        await delay(getDelayTime(retryCount));
      }

      if (res) {
        dispatch({
          type: 'SET_CURRENT_CHAIN',
          payload: ChainDetails(res.chainId),
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setState({
        loader: {
          metamask: false,
        },
      });
    }
  };

  const handleRegister = async (e) => {
    setState({
      loader: {
        register: true,
      },
    });
    try {
      e.preventDefault();
      const fieldsToValidate = [
        'userName',
        'password',
        'email',
        'walletAddress',
      ];
      const isValidFields = validateFields(
        fieldsToValidate,
        state.registerData,
        setState,
      );
      if (!isValidFields) return;

      const { userName, email, password, walletAddress } = state.registerData;
      const [registerRes, registerError] = await API.register({
        username: userName,
        email,
        password,
        walletaddress: account || walletAddress,
      });
      throwIfExists(registerError);
      dispatch({ type: 'UPDATE_CURRENT_USER', payload: registerRes });
      setLoginModal(false);
    } catch (error) {
      console.log(error)
      handleError(error);
    } finally {
      setState({
        loader: {
          register: false,
        },
      });
    }
  };

  return (
    <Modal
      appElement={appElement}
      isOpen={loginModal}
      onRequestClose={() => {
        setLoginModal(false);
        document.body.style.overflow = 'auto';
      }}
      style={{
        content: {
          maxWidth: '500px',
          maxHeight: '500px',
          margin: '50px auto',
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
          setLoginModal(false);
          document.body.style.overflow = 'auto';
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-x"
          viewBox="0 0 16 16"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>

      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '2rem',
        }}
      >
        {state.formType === formType.login ? 'Login' : 'Register'}
      </h1>

      {state.formType === formType.login && (
        <div>
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 'small',
            }}
          >
            <div className="login-username">
              <input
                placeholder="Your username"
                onChange={handleChange}
                onBlur={handleBlur}
                value={state.loginData.userName}
                name="userName"
                required
              />
              {state.error.userName && <span>{state.error.userName}</span>}
            </div>

            <div className="login-username">
              <input
                placeholder="Password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={state.loginData.password}
                type="password"
                name="password"
                required
              />
              {state.error.password && <span>{state.error.password}</span>}
            </div>
            <button
              className="btn login-btn btn-secondary"
              onClick={handleLogin}
              disabled={state.loader.login}
            >
              {state.loader.login ? <ButtonLoader /> : 'Login'}
            </button>
            <p style={{ margin: '4rem auto 0.5rem', color: 'gray' }}>
              <u>Forget my password</u>
            </p>
            <p>
              Don't have an account,{' '}
              <u
                style={{ color: '#28562c', cursor: 'pointer' }}
                onClick={() => {
                  setState({
                    formType: formType.register,
                    error: {},
                    loginData: {},
                  });
                }}
              >
                Create now
              </u>
            </p>
          </form>
          <button
            className="nav-btn login-btn"
            style={{ color: 'black' }}
            onClick={handleConnect}
            disabled={state.loader.metamask}
          >
            {state.loader.metamask ? <ButtonLoader /> : 'Connect Metamask'}
          </button>
        </div>
      )}

      {state.formType === formType.register && (
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 'small',
          }}
        >
          <div className="login-username">
            <input
              placeholder="Username"
              onChange={handleChange}
              value={state.registerData.userName}
              onBlur={handleBlur}
              name="userName"
              required
            />
            {state.error.userName && <span>{state.error.userName}</span>}
          </div>
          <div className="login-username">
            <input
              placeholder="Email"
              onChange={handleChange}
              value={state.registerData.email}
              name="email"
              onBlur={handleBlur}
              required
            />
            {state.error.email && <span>{state.error.email}</span>}
          </div>
          <div className="login-username">
            <input
              placeholder="Password"
              type="password"
              onChange={handleChange}
              value={state.registerData.password}
              name="password"
              onBlur={handleBlur}
              required
            />
            {state.error.password && <span>{state.error.password}</span>}
          </div>
          <div className="login-username">
            <input
              placeholder="Wallet Address"
              onChange={handleChange}
              name="walletAddress"
              onBlur={handleBlur}
              value={account || state.registerData.walletAddress}
              disabled={account}
            />
            {state.error.walletAddress && (
              <span>{state.error.walletAddress}</span>
            )}
          </div>
          <button
            className="btn login-btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={handleRegister}
          >
            Register
          </button>
          <p>
            <u
              style={{
                color: '#28562c',
                top: '2rem',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                setState({
                  formType: formType.login,
                  error: {},
                  registerData: {},
                });
              }}
            >
              Already have an account? <span>Login</span>
            </u>
          </p>
        </form>
      )}

      {/* <Register
        registerModal={state.registerModal}
        setRegisterModal={(flag) => setState({ registerModal: flag })}
      /> */}
    </Modal>
  );
}
