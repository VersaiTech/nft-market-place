import Web3 from 'web3';

import MarketplaceABI from './ABIs/MarketplaceABI.json';
import AuctionABI from './ABIs/AuctionABI.json';
import ERC721ABI from './ABIs/ERC721ABI.json';
import FactoryABI from './ABIs/FactoryABI.json';

export const abiMap = {
  marketplace: MarketplaceABI,
  nft: ERC721ABI,
  auction: AuctionABI,
  factory: FactoryABI,
};

function createContractInstance(abi, address) {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(abi, address);
}

export async function getEvents(tx, txType, address) {
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
