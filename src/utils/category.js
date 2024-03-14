import art from '../images/asthetic.png';
import collectibles from '../images/socratic.png';
import sports from '../images/browse.png';
import utility from '../images/cyber.png';
import threecards from '../images/threecards.png';
import virtualworld from '../images/virtualworld.png';
import domain from '../images/domain.png';

export const CATEGORY = [
  {
    name: 'Arts',
    value: 'Arts',
    image: art,
  },
  {
    name: 'Collectibles',
    value: 'Collectibles',
    image: collectibles,
  },
  {
    name: 'Sports',
    value: 'Sports',
    image: sports,
  },
  {
    name: 'Utility',
    value: 'Utility',
    image: utility,
  },
  {
    name: 'Trading Cards',
    value: 'Trading Cards',
    image: threecards,
  },
  {
    name: 'Virtual World',
    value: 'Virtual World',
    image: virtualworld,
  },
  {
    name: 'Domain Names',
    value: 'Domain Names',
    image: domain,
  },
];

export const CHAIN_DATA = [
  {
    id: 1,
    name: 'Ethereum',
    hex: '0x1',
    symbol: 'ETH',
    chainInfo: {
      chainId: '0x1',
      chainName: 'Ethereum',
      rpcUrls: ['https://eth.llamarpc.com'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://etherscan.io'],
    },
  },
  {
    id: 56,
    name: 'Binance',
    hex: '0x38',
    symbol: 'BNB',
    chainInfo: {
      chainId: '0x38',
      chainName: 'Binance',
      rpcUrls: ['https://bsc-dataseed.binance.org'],
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      blockExplorerUrls: ['https://bscscan.com'],
    },
  },
  {
    id: 137,
    name: 'Polygon',
    hex: '0x89',
    symbol: 'MATIC',
    chainInfo: {
      chainId: '0x89',
      chainName: 'Polygon',
      rpcUrls: ['https://polygon.llamarpc.com'],
      nativeCurrency: {
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://polygonscan.com'],
    },
  },
];
