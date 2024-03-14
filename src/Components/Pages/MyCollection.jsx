import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import { useWeb3React } from '@web3-react/core';
import * as API from '../../utils/api';
import { ChainDetails, throwIfExists } from '../../utils/helper';
import { useReducerPlus } from '../../utils/useReducerPlus';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { CHAIN_DATA } from '../../utils/category';

export const MyCollection = () => {
  const { account } = useWeb3React();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.currentUser);
  const chain = useSelector((state) => state.chainReducer);

  const [state, setState] = useReducerPlus({
    collectionData: [],
    chain: chain,
  });

  useEffect(() => {
    if (user) {
      getMyCollection();
    } else {
      navigate('/');
      toast.warning('Please login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, state.chain]);

  const getMyCollection = async () => {
    try {
      const [res, error] = await API.GetUserCollection(
        account || user.wallet,
        state.chain.id,
      );
      throwIfExists(error);
      setState({ collectionData: res.collection });
    } catch (error) {
      console.log({ getMyCollection: error });
    }
  };

  const handleNetworkChange = async (e) => {
    const { value } = e.target;
    const chain = JSON.parse(value);
    try {
      setState({ collectionData: null });
      setState({ chain });
      dispatch({
        type: 'SET_CURRENT_CHAIN',
        payload: ChainDetails(chain.id),
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <React.Fragment>
      <div style={{ background: 'linear-gradient(#26592d, #000000)' }}>
        <div className="container">
          <Navbar />
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', color: 'black' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontWeight: 'bolder' }}>My Collections</h1>
            <p>
              Create, curate and manage collections of unique NFTs to share and
              sell.
            </p>
          </div>

          <div className="form-group">
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
        </div>

        <Link to="/createCollection">
          <button className="btn btn-primary">Create a Collection</button>
        </Link>

        <div className="row mycollections-card">
          {state.collectionData && state.collectionData.length > 0 ? (
            state.collectionData.map((collection, index) => (
              <Link
                to={`/collections/${collection.collection_address}/${collection.networkId}`}
                key={index}
                className="prc-col col-lg-3 col-md-4 col-sm-6"
                style={{ textDecoration: 'none' }}
              >
                <div style={{ margin: '25px 0', cursor: 'pointer' }}>
                  <div className="card">
                    <img
                      src={collection.collection_logoURI}
                      style={{
                        padding: '12px 12px 0 12px',
                        objectFit: 'cover',
                        objectPosition: 'left',
                        height: '300px',
                      }}
                      className="card-img-top"
                      alt="..."
                    />
                    <div className="card-body">
                      <p
                        style={{
                          fontWeight: 'bold',
                          marginTop: '10px',
                        }}
                      >
                        {collection.collection_name}
                        <span
                          style={{
                            textDecoration: 'none',
                            fontWeight: '200',
                            color: 'grey',
                            display: collection.category ? 'block' : 'none',
                          }}
                        >
                          ({collection.category})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ marginTop: '20px' }}>
              No Collection found on the{' '}
              <span style={{ fontWeight: 'bold' }}>{state.chain.name}</span>{' '}
              chain
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
