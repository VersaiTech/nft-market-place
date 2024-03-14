import React, { useEffect } from 'react';
import { useState, useMemo } from 'react';
import MaskedInput from 'react-text-mask';

import Select from 'react-select';
import countryList from 'react-select-country-list';
import { BASEAPI_PATH } from '../../utils/contants';
import {
  AMERICANEXPRESS,
  OTHERCARDS,
  EXPIRYDATE,
  CVC,
  CARDARR,
  CARDICON,
} from './constants';
import { buyMarketFiat } from '../../utils/api';
import {
  stripeCardNumberValidation,
  stripeCardExpirValidation,
  textWithSpacesOnly,
  minLength,
} from './validations';

import { Wrapper, BottomBox, Inputs, Error } from './testCardsStyles';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

var stripePromise = loadStripe(
  'pk_test_51N0Ou0SEkTVspmoQZB5HsCy8uHPxd8Kpw2QOwsbxmHFL7NCj1DNjFXB25ne7F3zehDLQMVM1CKbVqFOvlQUqXywp00zV28hZqL',
);

const reducer = (state, action) => {
  switch (action.type) {
    case 'card':
      return { ...state, card: action.data };
    case 'expiry':
      return { ...state, expiry: action.data };
    case 'securityCode':
      return { ...state, securityCode: action.data };
    case 'cardHodler':
      return { ...state, cardHodler: action.data };
    case 'cleanState':
      return { ...action.data };
    case 'line1':
      return { ...state, line1: action.data };
    case 'line2':
      return { ...state, line2: action.data };
    case 'postal_code':
      return { ...state, postal_code: action.data };
    case 'city':
      return { ...state, city: action.data };
    case 'state':
      return { ...state, state: action.data };
    default:
      return state;
  }
};

function findDebitCardType(cardNumber) {
  const regexPattern = {
    MASTERCARD: /^5[1-5][0-9]{1,}|^2[2-7][0-9]{1,}$/,
    VISA: /^4[0-9]{2,}$/,
    AMERICAN_EXPRESS: /^3[47][0-9]{5,}$/,
    DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{3,}$/,
    DINERS_CLUB: /^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/,
    JCB: /^(?:2131|1800|35[0-9]{3})[0-9]{3,}$/,
  };
  for (const card in regexPattern) {
    if (cardNumber.replace(/[^\d]/g, '').match(regexPattern[card])) return card;
  }
  return '';
}

export const Checkout = (props) => {
  //embed success/failure url

  const [value, setValue] = useState('');
  const [loading, setloading] = useState(false);
  const options = useMemo(() => countryList().getData(), []);
  const [error, setError] = useState({});
  const [cardType, setCardType] = useState();
  const [price, setprice] = useState();
  const [user, setuser] = useState();
  const [nftData, setNftData] = useState(null);
  const [state, dispatch] = React.useReducer(reducer, {
    card: '',
    expiry: '',
    securityCode: '',
    cardHodler: '',
  });

  useEffect(() => {
    setprice(sessionStorage.getItem(`current-nftprice`).replace(/"/g, ''));
    setuser(sessionStorage.getItem(`current-user`).replace(/"/g, ''));
    const nftData = JSON.parse(sessionStorage.getItem(`nftData`));
    setNftData(nftData);
  }, []);

  const changeHandler = (value) => {
    setValue(value);
  };
  const handleValidations = (type, value) => {
    let errorText;
    switch (type) {
      case 'card':
        setCardType(findDebitCardType(value));
        errorText = stripeCardNumberValidation(value);
        setError({ ...error, cardError: errorText });
        break;
      case 'cardHodler':
        errorText = value === '' ? 'Required' : textWithSpacesOnly(value);
        setError({ ...error, cardHodlerError: errorText });
        break;
      case 'expiry':
        errorText =
          value === '' ? 'Required' : stripeCardExpirValidation(value);
        setError({ ...error, expiryError: errorText });
        break;
      case 'securityCode':
        errorText = value === '' ? 'Required' : minLength(3)(value);
        setError({ ...error, securityCodeError: errorText });
        break;
      default:
        break;
    }
  };

  const handleInputData = (e) => {
    dispatch({ type: e.target.name, data: e.target.value });
  };

  const handleBlur = (e) => {
    handleValidations(e.target.name, e.target.value);
  };

  const checkErrorBeforeSave = () => {
    let errorValue = {};
    let isError = false;
    Object.keys(state).forEach(async (val) => {
      if (state[val] === '') {
        errorValue = { ...errorValue, [`${val + 'Error'}`]: 'Required' };
        isError = true;
      }
    });
    setError(errorValue);
    return isError;
  };

  const handleSave = async (e) => {
    setloading(true);

    let errorCheck = checkErrorBeforeSave();
    if (!errorCheck) {
      dispatch({
        type: 'cleanState',
        data: {
          card: '',
          expiry: '',
          securityCode: '',
          cardHodler: '',
          line1: '',
          line2: '',
          postal_code: '',
          city: '',
          state: '',
        },
      });
      setCardType('');

      const date = state.expiry.split('/');

      try {
        const res = await axios.post(
          `${BASEAPI_PATH}/assets/api/payment/createPayment`,
          {
            price: price,
            name: state.cardHodler,
            customer_id: user,
            card_ExpYear: date[1],
            card_ExpMonth: date[0],
            card_Number: state.card,
            card_CVC: state.securityCode,
            billing_details: {
              line1: state.line1,
              line2: state.line2,
              postal_code: state.postal_code,
              city: state.city,
              state: state.state,
              country: value.label,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const buyMarketFiatAPI = async () => {
          try {
            console.log(nftData);
            const [buyMarketFiatRes, buyMarketFiatErr] = await buyMarketFiat(
              nftData.nftaddress,
              nftData.itemId,
              nftData.reciever,
              nftData.price,
              nftData.tokenId,
              nftData.chainId,
              nftData.seller,
            );
            return [buyMarketFiatRes, buyMarketFiatErr];
          } catch (err) {
            console.log(err);
          }
        };

        try {
          const response = await axios.post(
            `${BASEAPI_PATH}/assets/api/payment/confirmPayment`,
            {
              customer_id: user,
              paymentintent_id: res.data.paymentintent_id.id,
              attachpaymentmethod: res.data.attachpaymentmethod,
              return_URL: `${window.location.href}/success`,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          // console.log(response.data);

          if (response.data.requiresAction) {
            const stripe = await stripePromise;

            try {
              await stripe
                .confirmCardPayment(response.data.paymentKey)
                .then(async function (result) {
                  if (result.paymentIntent.status === 'succeeded') {
                    const [buyMarketFiatRes] = await buyMarketFiatAPI();
                    if (buyMarketFiatRes.message === 'Market item Saled') {
                      window.location.href = `${window.location.href}/success`;
                    }
                  } else if (result.data.message === 'Payment failed') {
                    //do some actions //
                    window.location.href = `${window.location.href}/cancel`;
                  }
                });

              // console.log(result.data.status)
              // console.log(result.data.message);
            } catch (err) {
              console.log(err);
            }
          }
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        console.log(err);
      }
    }

    setloading(false);
  };

  const handleCancel = () => {
    window.location.href = `${window.location.href}/cancel`;
  };

  return (
    <React.Fragment>
      {/* Back Button */}
      {/* {console.log(nftaddress, itemId, reciever, price, tokenId, chainId, account)} */}
      <form className="checkout-form">
        <Wrapper style={{ color: 'black', paddingBottom: '20px' }}>
          <h3
            className="heading-testCard"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'black',
              marginTop: '5vw',
            }}
          >
            <button onClick={handleCancel} className="btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-return-left"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </button>
            Pay with card
            <span style={{ marginLeft: 'auto', fontSize: 'medium' }}>
              Amount: {price} $
            </span>
          </h3>
          <hr />
          <label for="" className="form-label">
            Card Details
          </label>
          <Inputs>
            <MaskedInput
              mask={
                ['37', '34'].includes(
                  state && state.card.split('').splice(0, 2).join(''),
                )
                  ? AMERICANEXPRESS
                  : OTHERCARDS
              }
              guide={false}
              placeholderChar={'\u2000'}
              placeholder="Card Number"
              name="card"
              required
              value={state.card}
              onChange={handleInputData}
              onBlur={handleBlur}
              className="form-control"
            />
            {(!error || !error.cardError) && CARDARR.includes(cardType) && (
              <img
                style={{
                  float: 'right',
                  position: 'relative',
                  top: '-35px',
                }}
                src={CARDICON[cardType]}
                alt="card"
                width="50px"
                height="33px"
              />
            )}
            {error && error.cardError && error.cardError.length > 1 && (
              <Error>{error.cardError}</Error>
            )}
          </Inputs>
          <Inputs>
            <input
              type="text"
              name="cardHodler"
              required
              placeholder="CardHolder's Name"
              value={state.cardHodler}
              onChange={handleInputData}
              onBlur={handleBlur}
              className="form-control"
            />
            {error &&
              error.cardHodlerError &&
              error.cardHodlerError.length > 1 && (
                <Error>{error.cardHodlerError}</Error>
              )}
          </Inputs>
          <Inputs inputSize="small">
            <BottomBox>
              <div className="expiry">
                <MaskedInput
                  mask={EXPIRYDATE}
                  guide={false}
                  name="expiry"
                  required
                  placeholderChar={'\u2000'}
                  placeholder="Expiry Date (MM/YY)"
                  value={state.expiry}
                  onChange={handleInputData}
                  onBlur={handleBlur}
                  className="form-control"
                  style={{ borderRadius: '6px 0 0 6px' }}
                />
                {error && error.expiryError && error.expiryError.length > 1 && (
                  <Error>{error.expiryError}</Error>
                )}
              </div>
              <div className="cvc">
                <MaskedInput
                  mask={CVC}
                  guide={false}
                  name="securityCode"
                  required
                  placeholderChar={'\u2000'}
                  placeholder="Security Code"
                  value={state.securityCode}
                  onChange={handleInputData}
                  onBlur={handleBlur}
                  className="form-control"
                  style={{ borderRadius: '0 6px 6px 0' }}
                />
                {error &&
                  error.securityCodeError &&
                  error.securityCodeError.length > 1 && (
                    <Error>{error.securityCodeError}</Error>
                  )}
              </div>
            </BottomBox>
          </Inputs>
          <div style={{ color: 'black', width: '100%' }}>
            <label for="" className="form-label">
              Billing Details
            </label>
            <Select
              placeholder="Select Country"
              className="select-country"
              options={options}
              value={value}
              onChange={changeHandler}
              required
            />
            <input
              className="form-control add-line-1"
              type="text"
              name="line1"
              value={state.line1}
              onChange={handleInputData}
              id="line1"
              placeholder="Address Line 1"
              required
            />
            <input
              className="form-control add-line-2"
              type="text"
              name="line2"
              value={state.line2}
              onChange={handleInputData}
              id="line2"
              placeholder="Address Line 2"
            />
            <div className="input-group">
              <input
                className="form-control city"
                type="text"
                name="city"
                value={state.city}
                onChange={handleInputData}
                id="city"
                placeholder="City"
                required
              />
              <input
                className="form-control pin"
                type="number"
                name="postal_code"
                value={state.postal_code}
                onChange={handleInputData}
                id="postal_code"
                placeholder="PIN"
                required
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={handleSave}
            disabled={loading ? true : false}
          >
            {loading ? 'Processing the Payment...' : 'Pay'}
          </button>
        </Wrapper>
      </form>
    </React.Fragment>
  );
};
