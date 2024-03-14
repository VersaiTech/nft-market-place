//SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ERC721MUNDUMNFT is ERC721URIStorage{

    
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _currentSupply;
    address private owner;
    uint256 private royaltyFee;
    address private royaltyrecipient;
    address private marketplaceaddress;
    uint256 private maxSupply = 10000;
    

    event CreatedToken(uint256 tokenId,address minter);
    event CreatedMultipleTokens(uint256[] tokenIds,address minter);
    event BurneddToken(uint256 tokenId,address owner);
    event singleNFTTransferred(address from,address to,uint256 tokenId);
    event multipleNFTTransferred(address from,address to,uint256[] tokenIds);
    event UpdatedTokenURI(string tokenURI,address owner);
    event UpdatedRoyaltyFee(uint256 newroyaltyfee);
    event UpdatedRoyaltyFeeRecipient(address royaltyrecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    /**
   * @dev Modifier to allow only the contract owner to execute a function
   */
    modifier onlyOwner(){
        require(msg.sender==owner,"unAuthorized user");
        _;
    }
    
    /**

@dev This is the constructor function for the ERC721MUNDUMNFT contract.
@param _name The name of the ERC721 token.
@param _symbol The symbol of the ERC721 token.
@param _marketplaceaddress The address of the marketplace contract that will be used for trading ERC721 tokens.
@param _royaltyFee The percentage of royalty fee to be charged on each transaction of ERC721 tokens.
@param _royaltyrecipient The address of the recipient of the royalty fee collected on each transaction of ERC721 tokens.
*/
    constructor(string memory _name,string memory _symbol,address _marketplaceaddress,uint256 _royaltyFee,address _royaltyrecipient, address _owner) ERC721(_name,_symbol){
       royaltyFee = _royaltyFee; 
       royaltyrecipient = _royaltyrecipient;
       marketplaceaddress=_marketplaceaddress;
       owner=payable(_owner);
    }
    
    /**
 * @dev Creates a new ERC721 token with a unique token ID and mints it to the caller's address.
 * @param _tokenURI The metadata URI for the newly created token.
 * return newtokenId The ID of the newly created token.
 */
    function createToken(string memory _tokenURI) public onlyOwner returns(uint256 _tokenId) {
      require(_currentSupply.current()<=maxSupply,"Maximum Supply exceeded");
        _tokenIds.increment();
        uint256 newtokenId = _tokenIds.current();
      
        _safeMint(msg.sender, newtokenId); 
        _setTokenURI(newtokenId, _tokenURI);
        approve(marketplaceaddress,newtokenId);
        _currentSupply.increment();           
        
      emit CreatedToken(newtokenId, msg.sender);
      
      return newtokenId;
    }
    

/**
 * @dev Burns a specified ERC721 token owned by the caller.
 * @param _tokenId The ID of the token to be burned.
 * @return A boolean indicating whether the token was successfully burned.
 */
    function burnToken(uint256 _tokenId) public returns(bool)  {
     require(msg.sender==ownerOf(_tokenId),"Not an Owner of NFT");
     require(_tokenId>0,"Not a valid TokenId"); 
        _burn(_tokenId);
        _currentSupply.decrement();
       emit BurneddToken(_tokenId,msg.sender);
       return true;
    }
     
     /**
 * @dev Transfers ownership of a specified ERC721 token from the caller to a specified address.
 * @param _to The address to which the token should be transferred.
 * @param _tokenId The ID of the token to be transferred.
 * @return A boolean indicating whether the token was successfully transferred.
 */
     function NFTTransferFrom(address _to, uint256 _tokenId) public returns(bool) {
       require(_tokenId>0,"Not a valid TokenId");
        require(msg.sender==ownerOf(_tokenId),"Not an Owner of NFT");
        safeTransferFrom(msg.sender, _to, _tokenId);
        emit singleNFTTransferred(msg.sender, _to, _tokenId);
        return true;
    }

/**

@dev Sets the tokenURI of the given _tokenId to the provided _tokenURI. This function can only be called by the owner of the token.
@param _tokenId The ID of the token whose tokenURI is being set.
@param _tokenURI The new tokenURI to be set for the given _tokenId.
@return The updated tokenURI for the given _tokenId.
*/
     function setTokenURI(uint256 _tokenId,string memory _tokenURI) external returns(string memory){
      require(_tokenId>0,"Not a valid TokenId");
      require(msg.sender==ownerOf(_tokenId),"Not an Owner of NFT");
           _setTokenURI(_tokenId, _tokenURI);
          emit UpdatedTokenURI(_tokenURI,msg.sender); 
           return _tokenURI;
    }

/**
@dev Function to set the royalty fee percentage for the contract.
@param _royaltyFee The royalty fee percentage to set.
@return A boolean indicating whether the royalty fee was successfully set.
*/
    function setRoyaltyFee(uint256 _royaltyFee) external onlyOwner returns(bool) {
         require(_royaltyFee > 0,"royaltyFee must be greater than zero");
         royaltyFee = _royaltyFee;
         emit UpdatedRoyaltyFee(royaltyFee);
         return true;
    }
    
/**
@dev Function to set the royalty fee recipient for the contract.
@param newroyaltyrecipient The royalty fee recipient to set.
@return A boolean indicating whether the royalty fee recipient was successfully set.
*/
    function setRoyaltyFeeRecipient(address newroyaltyrecipient) external onlyOwner returns(bool) {
         require(newroyaltyrecipient != address(0),"royaltyFee Recipient cannot be Zero Address");
         royaltyrecipient = newroyaltyrecipient;
         emit UpdatedRoyaltyFeeRecipient(royaltyrecipient);
         return true;
    }
    
/**
@dev Function to get the token URI associated with a given token ID.
@param _tokenId The ID of the token to get the URI for.
@return The token URI associated with the given token ID.
*/
    function getTokenURI(uint256 _tokenId) public view  returns(string memory) {
     require(_tokenId>0,"Not a valid TokenId");
        return tokenURI(_tokenId);
    }

/**

@dev Function to get the royalty fee percentage set for the contract.
@return The royalty fee percentage set for the contract.
*/
    function getRoyaltyFee() public view returns(uint256) {
        return royaltyFee;
    }
    
   /**

@dev Function to get the address of the royalty recipient set for the contract.
@return The address of the royalty recipient set for the contract.
*/ 
    function getRoyaltyRecipient() public view returns(address) {
        return royaltyrecipient;
    }      

/**

@dev Function called by the ERC721 contract when an NFT is received.
@return bytes4 value indicating success or failure.
*/
      function onERC721Received(address , address , uint256 , bytes memory) external pure  returns (bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function createTokenOnlyOwner(string memory _tokenURI,address _reciever) public onlyOwner returns(uint256 _tokenId) {
      require(_currentSupply.current()<=maxSupply,"Maximum Supply exceeded");
      _tokenIds.increment();
      uint256 newtokenId = _tokenIds.current();

      _safeMint(_reciever,newtokenId);
      _setTokenURI(newtokenId,_tokenURI);
      approve(marketplaceaddress,newtokenId);
      _currentSupply.increment();

      emit CreatedToken(newtokenId,_reciever);

      return newtokenId;
    } 

    /**
     * @dev Returns the address of the current owner.
     */
     function ownerOfCollection() public view virtual returns (address) {
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