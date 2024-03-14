import React, { useEffect } from 'react';
import axios from 'axios';
import { useReducerPlus } from '../utils/useReducerPlus';
import { shortenAddress } from '../utils/helper';
import { useNavigate } from 'react-router-dom';

const CollectionCardNFT = (props) => {
  const { item, networkId } = props;
  const navigate = useNavigate();
  const [state, setState] = useReducerPlus({
    nftData: [],
  });

  useEffect(() => {
    if (item) {
      getItemDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getItemDetails = async () => {
    try {
      const res = await axios.get(item.metadata);
      setState({ nftData: res.data });
    } catch (e) {
      console.log({ errorWhileFetchingNft: e });
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div
      style={{ marginTop: '25px', marginBottom: '25px' }}
      className="prc-col col-lg-3 col-md-4 col-sm-6"
    >
      <div className="card">
        <img
          src={state.nftData && state.nftData.URI}
          className="card-img-top"
          alt={item.name}
          style={{ height: '350px' }}
        />
        <div className="card-body">
          <p style={{ fontWeight: 'bold', marginBottom: '0' }}>{item.name}</p>
          <p style={{ fontWeight: 'bold' }}>
            {item && shortenAddress(item.address)}
          </p>
        </div>
        {item.state === 'SoldAtMarketplace' ||
        item.state === 'SoldAtAuction' ? (
          <button
            className="w-full btn btn-block btn-primary"
            type="button"
            disabled
          >
            Item Sold
          </button>
        ) : item.available &&
          item.state !== 'SoldAtMarketplace' &&
          item.state !== 'SoldAtAuction' ? (
          <button
            className="btn btn-block btn-primary"
            type="button"
            onClick={() =>
              handleNavigate(
                `/marketplace/${item.address}/${item.nftid}/${item.networkId}`,
              )
            }
          >
            See Item
          </button>
        ) : (
          <button
            className="w-full btn btn-block btn-primary"
            type="button"
            onClick={() =>
              handleNavigate(
                `/listAsset/${item.address}/${item.nftid}/${networkId}`,
              )
            }
          >
            List Item
          </button>
        )}
      </div>
    </div>
  );
};

export default CollectionCardNFT;
