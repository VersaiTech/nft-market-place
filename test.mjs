// import { getEvents } from '../src/utils/blockchain';
import Web3 from 'web3';

const MarketplaceABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_platformfee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_listingfee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_feerecipient',
        type: 'address',
      },
      {
        internalType: 'contract MUNDUMNFTFactory',
        name: '_NFTFactory',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nftaddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'BoughtMarketItem',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ListingFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'nftaddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'sold',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startsAt',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'MarketItemCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'PlatformFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RoyaltyFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newfeeRecipient',
        type: 'address',
      },
    ],
    name: 'UpdatedFeeRecipient',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newlistingFee',
        type: 'uint256',
      },
    ],
    name: 'UpdatedListingFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newplatformFee',
        type: 'uint256',
      },
    ],
    name: 'UpdatedPlatformFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'nftcontract',
        type: 'address',
      },
    ],
    name: 'createdNFTAddress',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_totalPrice',
        type: 'uint256',
      },
    ],
    name: 'totalFees',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
    ],
    name: 'transferedToseller',
    type: 'event',
  },
  {
    inputs: [],
    name: '_owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftaddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_itemId',
        type: 'uint256',
      },
    ],
    name: 'buyMarketItem',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftaddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_itemId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_reciever',
        type: 'address',
      },
    ],
    name: 'buyMarketItemOnlyOwner',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftaddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'createMarketItem',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeRecipient',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeeRecipient',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getItemsCreated',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'itemId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nftaddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'seller',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startsAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'enum MundumNFTMarketplace.State',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct MundumNFTMarketplace.MarketItem[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMarketItems',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'itemId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nftaddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'seller',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startsAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'enum MundumNFTMarketplace.State',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct MundumNFTMarketplace.MarketItem[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMyNFTs',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'itemId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nftaddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'seller',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startsAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'enum MundumNFTMarketplace.State',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct MundumNFTMarketplace.MarketItem[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_price',
        type: 'uint256',
      },
    ],
    name: 'getPlatformFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_nftaddress',
        type: 'address',
      },
    ],
    name: 'getTotalFeeMarketPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getlistingFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'listingfee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'marketitemslist',
    outputs: [
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'nftaddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startsAt',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
      {
        internalType: 'enum MundumNFTMarketplace.State',
        name: 'status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_feerecipient',
        type: 'address',
      },
    ],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_listingfee',
        type: 'uint256',
      },
    ],
    name: 'setListingFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_platformfee',
        type: 'uint256',
      },
    ],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const ERC721ABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_marketplaceaddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_royaltyFee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_royaltyrecipient',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'BurneddToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'tokenIds',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
    ],
    name: 'CreatedMultipleTokens',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
    ],
    name: 'CreatedToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newroyaltyfee',
        type: 'uint256',
      },
    ],
    name: 'UpdatedRoyaltyFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'royaltyrecipient',
        type: 'address',
      },
    ],
    name: 'UpdatedRoyaltyFeeRecipient',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'tokenURI',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'UpdatedTokenURI',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'tokenIds',
        type: 'uint256[]',
      },
    ],
    name: 'multipleNFTTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'singleNFTTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'NFTTransferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'burnToken',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_tokenURI',
        type: 'string',
      },
    ],
    name: 'createToken',
    outputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_tokenURI',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_reciever',
        type: 'address',
      },
    ],
    name: 'createTokenOnlyOwner',
    outputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRoyaltyFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRoyaltyRecipient',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'getTokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerOfCollection',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_royaltyFee',
        type: 'uint256',
      },
    ],
    name: 'setRoyaltyFee',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newroyaltyrecipient',
        type: 'address',
      },
    ],
    name: 'setRoyaltyFeeRecipient',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_tokenURI',
        type: 'string',
      },
    ],
    name: 'setTokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const FactoryABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'nftcontract',
        type: 'address',
      },
    ],
    name: 'createdNFTAddress',
    type: 'event',
  },
  {
    inputs: [],
    name: '_owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '_royaltyfee',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_recepient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_choice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_ownerCollection',
        type: 'address',
      },
    ],
    name: 'createNFT',
    outputs: [
      {
        internalType: 'address',
        name: 'nft721address',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMyNFTS',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftaddress',
        type: 'address',
      },
    ],
    name: 'isMundumNFT',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_mrktplceaddress',
        type: 'address',
      },
    ],
    name: 'setMrktplceaddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const AuctionABI = [
  {
    inputs: [
      {
        internalType: 'contract MUNDUMNFTFactory',
        name: '_NFTFactory',
        type: 'address',
      },
      {
        internalType: 'contract MundumNFTMarketplace',
        name: '_Marketplace',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ListingFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'bidder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'refundAmount',
        type: 'uint256',
      },
    ],
    name: 'NonWinningBidderRefunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'PlatformFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RoyaltyFeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'refundAmount',
        type: 'uint256',
      },
    ],
    name: 'Test',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_currentPrice',
        type: 'uint256',
      },
    ],
    name: 'dutchAuctionCurrentPrice',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_winningBid',
        type: 'uint256',
      },
    ],
    name: 'dutchAuctionEnd',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_nftAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_nftId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_startingPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_minimumPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'dutchAuctionStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_currentHighestBidder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_currentHighestBid',
        type: 'uint256',
      },
    ],
    name: 'englishAuctionBidSuccess',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_winningBid',
        type: 'uint256',
      },
    ],
    name: 'englishAuctionEnd',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_nftAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_nftId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_startingPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'englishAuctionStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'auction',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_finalPrice',
        type: 'uint256',
      },
    ],
    name: 'finalAuctionPrice',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'AllDutchBids',
    outputs: [
      {
        internalType: 'uint256',
        name: 'bidId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'nftAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nftId',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: 'seller',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'startingPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startAt',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endsAt',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minimumPrice',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isCompleted',
        type: 'bool',
      },
      {
        internalType: 'enum AuctionMUNDUM.State',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'auction',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'winningBid',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'AllEnglishBidders',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'AllEnglishBids',
    outputs: [
      {
        internalType: 'uint256',
        name: 'bidId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'nftAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nftId',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: 'seller',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'startingPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endsAt',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isCompleted',
        type: 'bool',
      },
      {
        internalType: 'enum AuctionMUNDUM.State',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'highestBidder',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'highestBid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'prevBid',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'auction',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'EndDutchAuction',
    outputs: [
      {
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'amountBid',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bidAmount',
        type: 'uint256',
      },
    ],
    name: 'bidEnglishAuction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'endEnglishAuction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'getDutchPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'auction',
        type: 'uint256',
      },
    ],
    name: 'getFinalPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'getHighestBid',
    outputs: [
      {
        internalType: 'uint256',
        name: '_currentHighestBid',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'auction',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'bidValue',
        type: 'uint256',
      },
    ],
    name: 'getTotalPriceAuction',
    outputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'isDutchAuctionCompleted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_startingPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_minimumPrice',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_nftId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'startDutchAuction',
    outputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_nftId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startingBid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'startEnglishAuction',
    outputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidId',
        type: 'uint256',
      },
    ],
    name: 'withDrawBidValue',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const web3 = new Web3(
  'https://polygon-mainnet.infura.io/v3/5901125507cd4264aa28599b1f3c57e4',
  // 'https://rpc-mumbai.maticvigil.com/',
);

function createContractInstance(abi, address) {
  return new web3.eth.Contract(abi, address);
}

const abiMap = {
  marketplace: MarketplaceABI,
  nft: ERC721ABI,
  factory: FactoryABI,
  auction: AuctionABI,
};

async function getEvents(tx, txType, address) {
  const contract = createContractInstance(abiMap[txType], address);

  if (!contract) {
    throw new Error('Invalid txType provided.');
  }

  const events = await contract.getPastEvents('allEvents', {
    fromBlock: tx.blockNumber,
    toBlock: tx.blockNumber,
  });

  let formattedEvents = {};
  for (let event of events) {
    formattedEvents[event.event] = event.returnValues;
  }

  return formattedEvents;
}

const tx = await web3.eth.getTransaction(
  '0xd7298ca6a99ced0031731e54ec24485e1f59cbf631ff3a28be9012f6f7bd8591',
);

const txType = 'auction';
const events = await getEvents(
  tx,
  txType,
  '0x0ae30f0ee55db3f99933522cdf4817c4ff290f25',
);

// getEvents()

console.log(events);

const weiToEth = (amountInWei) => {
  return web3.utils.fromWei(amountInWei, 'ether');
};
console.log(weiToEth(events['englishAuctionBidSuccess']._currentHighestBid));

const marketplace = {
  totalFees: { 0: '55750000000000000', _totalPrice: '55750000000000000' },
  PlatformFeePaid: {
    0: '0xd05dB13A8cD190EDe427334129066c282118BDD6',
    1: '750000000000000',
    buyer: '0xd05dB13A8cD190EDe427334129066c282118BDD6',
    amount: '750000000000000',
  },
  RoyaltyFeePaid: {
    0: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    1: '5000000000000000',
    buyer: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    amount: '5000000000000000',
  },
  BoughtMarketItem: {
    0: '8',
    1: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    2: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    3: '0x8E673614759BbF85cf95A12cb6241D8B3E41Fd23',
    4: '50000000000000000',
    itemId: '8',
    nftaddress: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    seller: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    buyer: '0x8E673614759BbF85cf95A12cb6241D8B3E41Fd23',
    price: '50000000000000000',
  },
};
const dutch = {
  dutchAuctionCurrentPrice: {
    0: '1',
    1: '19999999999999864',
    _bidId: '1',
    _currentPrice: '19999999999999864',
  },
  finalAuctionPrice: {
    0: '1',
    1: '0',
    2: '24299999999999833',
    _bidId: '1',
    auction: '0',
    _finalPrice: '24299999999999833',
  },
  dutchAuctionCurrentPrice: {
    0: '1',
    1: '19999999999999726',
    _bidId: '1',
    _currentPrice: '19999999999999726',
  },
  finalAuctionPrice: {
    0: '1',
    1: '0',
    2: '24299999999999666',
    _bidId: '1',
    auction: '0',
    _finalPrice: '24299999999999666',
  },
  PlatformFeePaid: {
    0: '0x61e2E9aC4D1178F6487ac10aD0C53ecd9F7927Fe',
    1: '299999999999995',
    buyer: '0x61e2E9aC4D1178F6487ac10aD0C53ecd9F7927Fe',
    amount: '299999999999995',
  },
  RoyaltyFeePaid: {
    0: '0xd05dB13A8cD190EDe427334129066c282118BDD6',
    1: '3999999999999945',
    buyer: '0xd05dB13A8cD190EDe427334129066c282118BDD6',
    amount: '3999999999999945',
  },
  dutchAuctionEnd: {
    0: '1',
    1: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    2: '19999999999999726',
    _bidId: '1',
    _winner: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    _winningBid: '19999999999999726',
  },
  dutchAuctionCurrentPrice: {
    0: '1',
    1: '19999999999999922',
    _bidId: '1',
    _currentPrice: '19999999999999922',
  },
  englishAuctionStarted: {
    0: '2',
    1: '0x654CB07bB1F8c00697EF08ffc283f2fBF2a846A7',
    2: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    3: '2',
    4: '15000000000000000',
    5: '301473',
    _bidId: '2',
    _seller: '0x654CB07bB1F8c00697EF08ffc283f2fBF2a846A7',
    _nftAddress: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    _nftId: '2',
    _startingPrice: '15000000000000000',
    _duration: '301473',
  },
  dutchAuctionStarted: {
    0: '1',
    1: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    2: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    3: '2',
    4: '10000000000000000',
    5: '1000000000000000',
    6: '301705',
    _bidId: '1',
    _seller: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    _nftAddress: '0xAb412CE28Cb44caCda56DDCd9883f8F29b168dd6',
    _nftId: '2',
    _startingPrice: '10000000000000000',
    _minimumPrice: '1000000000000000',
    _duration: '301705',
  },
  dutchAuctionCurrentPrice: {
    0: '1',
    1: '9998389154969272',
    _bidId: '1',
    _currentPrice: '9998389154969272',
  },
  finalAuctionPrice: {
    0: '1',
    1: '0',
    2: '11148203907790738',
    _bidId: '1',
    auction: '0',
    _finalPrice: '11148203907790738',
  },
};
const nft = {
  Transfer: {
    0: '0xf3A48C4Dac95fdd1a69Da6a88c4d5D3789766638',
    1: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    2: '1',
    from: '0xf3A48C4Dac95fdd1a69Da6a88c4d5D3789766638',
    to: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    tokenId: '1',
  },
  singleNFTTransferred: {
    0: '0xf3A48C4Dac95fdd1a69Da6a88c4d5D3789766638',
    1: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    2: '1',
    from: '0xf3A48C4Dac95fdd1a69Da6a88c4d5D3789766638',
    to: '0x05ebE852FEa96FDD1Bc498E112e898C1aCb31F08',
    tokenId: '1',
  },
};
