import { InjectedConnector } from '@web3-react/injected-connector';
import Web3 from 'web3';

export const injected = new InjectedConnector({
  supportedChainIds: [56, 137], // have to add ETH(1) in the array
});

export const switchNetwork = async (dispatch, chain) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.hex }],
    });
    dispatch({
      type: 'SET_CURRENT_CHAIN',
      payload: {
        id: chain.id,
        name: chain.name,
        symbol: chain.symbol,
        hex: chain.hex,
      },
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chain.chainInfo],
        });
      } catch (error) {
        throw error;
      }
    }
    throw switchError;
  }
};

export const handleMetamaskConnect = async (dispatch, chain, activate) => {
  try {
    const web3 = new Web3(window.ethereum);
    const chainId = await web3.eth.getChainId();

    if (chainId === 56 || chainId === 137 || chainId === 1) {
      await activate(injected);
      localStorage.setItem('connector', 'injected');
      return { chainId };
    } else {
      await switchNetwork(dispatch, chain);
    }
    return false;
  } catch (error) {
    return error;
  }
};
