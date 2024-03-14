import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import Card from '../CollectionCardNFT';
import * as api from '../../utils/api';
import { shortenAddress, throwIfExists } from '../../utils/helper';
import { useReducerPlus } from '../../utils/useReducerPlus';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const CollectionDetails = () => {
  const navigate = useNavigate();
  const { collectionaddress, networkId } = useParams();
  const user = useSelector((state) => state.authReducer.currentUser);
  const [state, setState] = useReducerPlus({
    collectionData: {},
  });

  useEffect(() => {
    if (user) {
      getCollectionDetails();
    } else navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getCollectionDetails = async () => {
    try {
      if (collectionaddress) {
        const [res, error] = await api.GetSingleCollection(
          collectionaddress,
          networkId,
        );
        throwIfExists(error);
        setState({ collectionData: res.collection });
      }
    } catch (error) {
      console.log({ getCollectionDetails: error });
    }
  };

  function dateAndTimeConvertor(time_string) {
    let formatted_date = new Date(time_string).toDateString().slice(4);
    let formatted_time = new Date(time_string).toLocaleString().slice(10, 21);
    return formatted_date + ' ' + formatted_time;
  }

  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>

      <div>
        <div
          className="collection-single-banner"
          style={{
            backgroundImage: `url(${state.collectionData.collection_BannerURI})`,
          }}
        >
          <div
            className="collection-profile-img-container"
            style={{
              border: '0',
              background: 'transparent',
            }}
          >
            <img
              src={state.collectionData.collection_logoURI}
              className="collection-profile-img"
              alt="settings"
            />
          </div>
        </div>
        <div className="single-collection-content">
          <div className="single-collection-heading">
            <div
              className="single-collection-heading-content"
              style={{ color: 'black' }}
            >
              <h4 style={{ fontWeight: 'bold' }}>
                {state.collectionData.collection_name}{' '}
                <span
                  style={{
                    textDecoration: 'none',
                    fontWeight: '200',
                    fontSize: '20px',
                    color: 'grey',
                    display: state.collectionData.category ? 'block' : 'none',
                  }}
                >
                  ({state.collectionData.category})
                </span>
              </h4>
              <p>
                {state.collectionData &&
                  shortenAddress(state.collectionData.collection_address)}{' '}
                |{' '}
                <span style={{ color: 'grey' }}>
                  {dateAndTimeConvertor('2023-04-04T05:00:29.707Z')}
                </span>
              </p>
              <p>
                {state.collectionData && state.collectionData.collection_desc}
              </p>
            </div>
            {/* <div className="single-collection-icons">
              <ShareIcon className="single-collection-shareicon" />
              <MoreHorizIcon />
            </div> */}
          </div>
          <div className="">
            <div className="row">
              {state.collectionData &&
              state.collectionData.items &&
              state.collectionData.items.length > 0 ? (
                state.collectionData.items.map((item, index) => (
                  <Card
                    id={index}
                    item={item}
                    networkId={networkId}
                    key={index}
                  />
                ))
              ) : (
                <div>No NFT found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
