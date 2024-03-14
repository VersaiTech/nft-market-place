import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useReducerPlus } from '../utils/useReducerPlus';
import { ChainDetails } from '../utils/helper';

const Card = (props) => {
  const { item, chainId } = props;

  const navigate = useNavigate();

  const [state, setState] = useReducerPlus({
    nftData: {
      desc: '',
      imageUri: 'https://opensea.io/static/images/placeholder.png',
      name: '',
    },
  });

  useEffect(() => {
    if (item) {
      getNftData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNftData = async () => {
    try {
      const res = await axios.get(item.metadata);
      setState({ nftData: res.data });
    } catch (error) {
      console.log({ errorWhileFetchingNft: error });
    }
  };

  return (
    <div
      style={{ marginTop: '25px' }}
      className="prc-col col-lg-3 col-md-4 col-sm-12"
    >
      <div className="card">
        <img
          src={state.nftData && state.nftData.URI}
          style={{
            padding: '12px',
            height: '280px',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          className="card-img-top"
          alt={state.nftData && state.nftData.name}
        />
        <div className="card-body">
          <p style={{ fontWeight: 'bold' }}>
            {state.nftData && state.nftData.name}
          </p>
          <p
            style={{
              color: '#11111175',
              fontSize: 'small',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {state.nftData && state.nftData.description}
          </p>

          {item && item.price !== null ? (
            <p>
              {item.price} {ChainDetails(chainId).symbol}{' '}
              <span style={{ fontSize: '12px', color: 'gray' }}>
                {item.state === 'CreatedAtAuction' ? 'Auction' : 'Direct'}
              </span>
            </p>
          ) : (
            <p>
              <span style={{ fontSize: '12px', color: 'gray' }}>
                Not listed
              </span>
            </p>
          )}
          {/* {item && item.state === "Inactive" && (
            <button
              style={{ borderRadius: "30px", padding: "0 15px 2px" }}
              className="btn btn-large btn-block btn-outline-dark"
              type="button"
              onClick={() =>
                navigate(`/listAsset/${item.address}/${item.nftid}`)
              }
            >
              Browse artworks
            </button>
          )} */}
          {/* {item && item.state === "Active" && ( */}
          {item.state === 'Inactive' ? (
            <button
              style={{ borderRadius: '30px', padding: '0 15px 2px' }}
              className="btn btn-large btn-block btn-outline-dark"
              type="button"
              onClick={() =>
                navigate(
                  `/listAsset/${item.address}/${item.nftid}/${item.networkId}`,
                )
              }
            >
              List Asset
            </button>
          ) : (
            <button
              style={{ borderRadius: '30px', padding: '0 15px 2px' }}
              className="btn btn-large btn-block btn-outline-dark"
              type="button"
              onClick={() =>
                navigate(
                  `/marketplace/${item.address}/${item.nftid}/${item.networkId}`,
                )
              }
            >
              Browse artworks
            </button>
          )}
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default Card;
