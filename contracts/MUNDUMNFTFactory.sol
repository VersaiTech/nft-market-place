//SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721MUNDUM.sol";

/**
@dev MUNDUMNFTFactory is a smart contract that facilitates the creation of ERC721 Non-Fungible Tokens (NFTs) on the Ethereum blockchain.
*/
contract MUNDUMNFTFactory {

   using Counters for Counters.Counter;
   // Counter to keep track of the number of NFTs created by the contract
   Counters.Counter private _mundumnfts;

   // Address of the contract owner
   address private owner;

   // Address of the marketplace contract to be linked with NFTs created by this contract
   address private marketplaceaddress;

   // Mapping to keep track of the NFTs created by each address
   mapping(address=>address[]) private mundumnftslist;

   // Mapping to validate the NFT contracts created by this factory
   mapping(address=>bool) private MundumNFTvalidator;
    
   // Event to be emitted whenever an NFT contract is created by this factory 
   event createdNFTAddress(address indexed creator,address nftcontract);

   event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

   /**
   * @dev Constructor function to set the contract owner as the address that deploys the contract
   */
   constructor(){
       owner =payable(msg.sender);
   }

   /**
   * @dev Modifier to allow only the contract owner to execute a function
   */
   modifier onlyOwner(){
      require(msg.sender==owner,"Not a Owner");
      _;
   }

/**
 * @dev Function to create an NFT contract
 * @param _name The name of the NFT contract
 * @param _symbol The symbol of the NFT contract
 * @param _royaltyfee The percentage of royalty fee to be charged on each sale
 * @param _recepient The address that will receive the royalty fee
 * @param _choice The type of NFT to create (currently only 0 is supported)
 * @return nft721address The address of the newly created NFT contract
 */
   function createNFT(string calldata _name,string calldata _symbol,uint256 _royaltyfee,address _recepient,uint256 _choice,address _ownerCollection) public returns(address nft721address){
       require(_choice==0,"Invalid Choice");
        if(_choice==0){
               nft721address=create721(_name,_symbol,_royaltyfee,_recepient,_ownerCollection);
               mundumnftslist[msg.sender].push(nft721address);
               return nft721address;
        }
   } 

   /**
 * @dev Function to create an ERC721 NFT contract
 * @param _name The name of the NFT contract
 * @param _symbol The symbol of the NFT contract
 * @param _royaltyfee The percentage of royalty fee to be charged on each sale
 * @param _recepient The address that will receive the royalty fee
 * @return The address of the newly created ERC721 NFT contract
 */ 
   function create721(string memory _name,string memory _symbol,uint256 _royaltyfee,address _recepient,address _ownerCollection) private returns(address){
        require(marketplaceaddress!=address(0),"Must have marketplace address");
        ERC721MUNDUMNFT mundum721=new ERC721MUNDUMNFT(_name,_symbol,marketplaceaddress,_royaltyfee,_recepient,_ownerCollection);
        address temp = address(mundum721);
        MundumNFTvalidator[temp] = true;
        mundumnftslist[msg.sender].push(temp);
         _mundumnfts.increment();
        
        emit createdNFTAddress(msg.sender,temp);

        return temp;
    
    } 

   /**
@dev Checks whether a given address is a valid MUNDUMNFT contract.
@param _nftaddress The address of the contract to be checked.
@return A boolean indicating whether the given address is a valid MUNDUMNFT contract.
*/
     function isMundumNFT(address _nftaddress) public view returns(bool) {
        return  MundumNFTvalidator[_nftaddress];
    } 


/**
@dev Returns an array of all the MundumNFT contracts created by the caller of the function.
@return An array of all the MundumNFT contracts created by the caller of the function.
*/
     function getMyNFTS() public view returns(address[] memory){
        return mundumnftslist[msg.sender];
     }   

/**
@dev Sets the address of the marketplace contract. Only the contract owner can call this function.
@param _mrktplceaddress The address of the marketplace contract.
@return The address of the marketplace contract that was set.
*/
     function setMrktplceaddress(address _mrktplceaddress) external  onlyOwner returns(address){
         marketplaceaddress = _mrktplceaddress;
         return marketplaceaddress; 
     }   

      /**
     * @dev Returns the address of the current owner.
     */
     function _owner() public view virtual returns (address) {
        return owner;
    }  

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0),"Address cannot be a Zero Address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}