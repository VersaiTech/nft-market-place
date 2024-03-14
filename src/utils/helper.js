import { toast } from 'react-toastify';
import { CHAIN_DATA } from './category';
import Web3 from 'web3';
import { AUCTION_ADDRESS, ETH_AUCTION_ADDRESS } from './contants';

export function shortenAddress(address) {
  if (address) {
    const prefix = address.substring(0, 6);
    const suffix = address.substring(address.length - 4, address.length);
    return `${prefix}...${suffix}`;
  }
  // return address;
}

export function throwIfExists(err) {
  if (err) {
    throw err;
  }
}

export function secondsFromNow(futureTime) {
  var now = new Date().getTime();
  var difference = new Date(futureTime) - now;
  var seconds = Math.floor(difference / 1000);
  return seconds;
}

export function fetchObjectById(id) {
  const foundObject = CHAIN_DATA.find((item) => item.id === id);
  return foundObject || null; // Return null if no object is found
}

export function ChainDetails(chainId) {
  let chain;
  switch (chainId) {
    case 137:
      chain = {
        id: chainId,
        name: 'Polygon',
        symbol: 'MATIC',
        hex: '0x89',
      };
      break;

    case 56:
      chain = {
        id: chainId,
        name: 'BNB Smart Chain Mainnet',
        symbol: 'BNB',
        hex: '0x38',
      };
      break;

    default:
      chain = {
        id: chainId,
        name: 'Ethereum',
        symbol: 'ETH',
        hex: '0x1',
      };
  }
  return chain;
}

export const handleError = (error) => {
  const errorMessage = error.message || 'An error occurred.';
  toast.error(errorMessage);
};

export const MAX_RETRY_COUNT = 3;
export const BASE_DELAY = 1000; // Base delay in milliseconds

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDelayTime = (retryCount) => {
  const exponentialFactor = Math.pow(2, retryCount);
  return BASE_DELAY * exponentialFactor;
};

export const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const web3 = new Web3();

export const weiToEth = (amountInWei) => {
  return web3.utils.fromWei(amountInWei, 'ether');
};

export const getContractAddress = (chainId) => {
  if (chainId === 1) {
    return ETH_AUCTION_ADDRESS;
  }
  return AUCTION_ADDRESS;
};
