//SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./MUNDUMNFTFactory.sol";
/**
    * @title MundumNFTMarketplace
    * @dev This smart contract is an NFT marketplace that allows users to create and sell their own unique NFTs.
    * It also allows users to create market items and buy NFTs that are listed on the market. 
    * The contract uses OpenZeppelin's ERC721 and ReentrancyGuard libraries.
    * 
    */
    contract MundumNFTMarketplace is ReentrancyGuard{
      using Counters for Counters.Counter;
     /**
     * @dev The _itemIds counter is used to generate a unique itemId for each market item that is created.
     * @dev The _fixedpriceitemsSold counter is used to keep track of the total number of items sold on the marketplace.
     * @dev The _tokenIds counter is used to generate a unique tokenId for each NFT that is created.
     * * @dev The _artnotionnfts counter is used to keep track of the total number of NFTs created on the marketplace.
     */
    Counters.Counter private _itemIds; 
    Counters.Counter private _fixedpriceitemsSold; 
    Counters.Counter private _tokenIds;
          
     /**
     @dev The owner variable stores the address of the contract owner.
     @dev The platformFee variable stores the fee that is charged to buyers for using the marketplace.
      @dev The feeRecipient variable stores the address of the account that will receive the platform fee.
      @dev The listingprice variable stores the price for listing an item on the market.
      @dev The State enum is used to keep track of the status of each market item.
      @dev The MarketItem struct is used to store information about each market item.
     */
    address private owner;
    uint256 private platformFee;
    address public feeRecipient;
    address private royaltyRecipient;
    uint256 private royaltyFee;
    uint256 public listingfee;

    MUNDUMNFTFactory private immutable NFTFactory;
    enum State{Created,Sold,Inactive}
    
    struct MarketItem {
        uint256 itemId; 
        address nftaddress; 
        uint256 tokenId;
        address seller; 
        address owner; 
        uint256 price;
        uint256 startsAt;
        uint256 duration;
        State   status;
    }
    
        
    /**
     * @dev The marketitemslist mapping is used to store information about each market item.
     * @dev The Listeditemsvalidator mapping is used to check if an item is already listed on the market.
     */
    
    
    mapping(uint256 => MarketItem) public marketitemslist;
    mapping(address=>mapping(uint256=>bool)) private Listeditemsvalidator;
    

    event MarketItemCreated(uint256 indexed itemId,address indexed nftaddress,uint256 indexed tokenId,address seller,address  owner,uint256 price,bool sold,uint256 startsAt,uint256 duration);
    event BoughtMarketItem(uint256 indexed itemId,address indexed nftaddress,address seller,address indexed buyer,uint256 price);
    event createdNFTAddress(address indexed creator,address nftcontract);
    event PlatformFeePaid(address indexed buyer,uint256 amount);
    event RoyaltyFeePaid(address indexed buyer,uint256 amount);
    event ListingFeePaid(address indexed creator,uint256 amount);
    event UpdatedPlatformFee(uint256 newplatformFee);
    event UpdatedListingFee(uint256 newlistingFee);
    event UpdatedFeeRecipient(address newfeeRecipient);
    event transferedToseller(uint256 indexed itemId, address indexed seller);
    event totalFees(uint256 _totalPrice);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

/**
 * @dev Constructor function that initializes the contract owner, platform fee, listing fee, fee recipient, and NFT factory.
 * @param _platformfee The percentage of the sale price that goes to the platform.
 * @param _listingfee The fixed amount charged to creators for listing their NFTs.
 * @param _feerecipient The address that receives the platform fees and listing fees.
 * @param _NFTFactory The contract used to create the NFTs.
 */
    constructor(uint256 _platformfee,uint256 _listingfee,address _feerecipient,MUNDUMNFTFactory _NFTFactory) {
        owner = payable(msg.sender);
        platformFee=_platformfee;
        listingfee=_listingfee;
        feeRecipient=_feerecipient;
        NFTFactory=_NFTFactory;
    }
    
    /**
   * @dev Modifier to allow only the contract owner to execute a function
   */
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /**
   * @dev function to allow only the contract owner to execute the code
   */
    function _onlyOwner() private view {
     require(msg.sender==owner,"Not an Owner");
    }

   /**
    createMarketItem: This function allows a user to list an NFT token for sale on the marketplace. It requires the NFT contract address, tokenId, and the price at which the user wants to list the token. It transfers the ownership of the NFT token from the user to the marketplace contract, and creates a new market item with the provided details.
    @param _nftaddress: address of the NFT contract
    @param _tokenId: tokenId of the NFT token
    @param _price: price at which the user wants to list the token
    */


    function createMarketItem(address _nftaddress,uint256 _tokenId,uint256 _price, uint256 _duration) public payable nonReentrant{
         require(_price > 0, "Price must be above zero");
         require(_nftaddress!=address(0),"Entered zero address");  
         require(msg.sender==IERC721(_nftaddress).ownerOf(_tokenId),"Not an Owner of NFT");
         require(msg.value==listingfee,"Need to pay Lisitng Fee");
   
        _itemIds.increment(); 
         uint256 itemId = _itemIds.current();
         marketitemslist[itemId] = MarketItem(itemId,_nftaddress,_tokenId,payable(msg.sender),payable(address(this)),_price,block.timestamp,_duration,State.Created);
        IERC721(_nftaddress).transferFrom(msg.sender, address(this), _tokenId);
       
         (bool sent,)=payable(feeRecipient).call{value:listingfee}("");
         require(sent,"listing fee transaction failed");
         Listeditemsvalidator[_nftaddress][_tokenId] = true;
            
        emit MarketItemCreated(itemId,_nftaddress,_tokenId,msg.sender,address(this),_price,false,block.timestamp,_duration);

    }
  

/**

@dev Allows a user to buy an NFT from the market.

@param _nftaddress The address of the NFT contract.

@param _itemId The ID of the NFT being sold in the market.

*/
    function buyMarketItem(address _nftaddress,uint256 _itemId) public payable nonReentrant{
           require(_nftaddress!=address(0) && _itemId > 0 ,"Entered zero values");
                require(_nftaddress==marketitemslist[_itemId].nftaddress,"Enter Valid address for necessary ItemId");
                //require(marketitemslist[_itemId].status==State.Created,"NFT is Inactive");
                //||marketitemslist[_itemId].status==State.Sold
                uint256 price = marketitemslist[_itemId].price;
                uint256 tokenId = marketitemslist[_itemId].tokenId;

                if(block.timestamp>marketitemslist[_itemId].startsAt+marketitemslist[_itemId].duration)
                {
                    IERC721(_nftaddress).transferFrom(address(this),marketitemslist[_itemId].seller , tokenId);
                    emit transferedToseller(_itemId, marketitemslist[_itemId].seller);
                    (bool success,)=payable(msg.sender).call{value:msg.value}("");
                    return;
                }

                uint256 requiredPrice = getTotalFeeMarketPrice(price, _nftaddress);
                require(msg.value==requiredPrice,"Price not Matching with mentioned price");
                require(Listeditemsvalidator[_nftaddress][tokenId],"NFT is not listed");
                
                uint256 _platformFee = getPlatformFee(price);
        
                 uint256 royaltyFeeTotal; 
                 if(NFTFactory.isMundumNFT(_nftaddress)){
                 royaltyFee = ERC721MUNDUMNFT(_nftaddress).getRoyaltyFee();
                 royaltyRecipient = ERC721MUNDUMNFT(_nftaddress).getRoyaltyRecipient();
                 royaltyFeeTotal = getTotalRoyaltyFee(price,royaltyFee);
                 }

              require(IERC721(_nftaddress).ownerOf(tokenId) == address(this), "NFT must be owned by market");
          
                uint256 _price=price-_platformFee;
                    
                (bool success,)=payable(feeRecipient).call{value:_platformFee}("");
                require(success,"Platformfee Payment Transaction Failed");
                 emit PlatformFeePaid(feeRecipient, _platformFee);

                if(royaltyFeeTotal>0){
                    _price=_price-royaltyFeeTotal;          
                (bool send,)=payable(royaltyRecipient).call{value:royaltyFeeTotal}("");
                require(send,"Fee Payment Transaction Failed"); 
                emit RoyaltyFeePaid(royaltyRecipient, royaltyFeeTotal);
                 }

                
                
                
                (bool sent,)=payable(marketitemslist[_itemId].seller).call{value:price}("");
                require(sent,"NFT Transaction Failed");
                IERC721(_nftaddress).transferFrom(address(this), msg.sender, tokenId);
                //marketitemslist[_itemId].seller = address(this); 
                marketitemslist[_itemId].owner = payable(msg.sender); 
                marketitemslist[_itemId].status = State.Sold; 
                _fixedpriceitemsSold.increment();
            
                emit BoughtMarketItem(_itemId,_nftaddress,marketitemslist[_itemId].seller,msg.sender,price); 
            
        }

        function buyMarketItemOnlyOwner(address _nftaddress,uint256 _itemId,address _reciever) public payable nonReentrant{
                require(_nftaddress!=address(0) && _itemId > 0 ,"Entered zero values");
                require(_nftaddress==marketitemslist[_itemId].nftaddress,"Enter Valid address for necessary ItemId");
                //require(marketitemslist[_itemId].status==State.Created,"NFT is Inactive");
                _onlyOwner();
                uint256 price = marketitemslist[_itemId].price;
                uint256 tokenId = marketitemslist[_itemId].tokenId;

                if(block.timestamp>marketitemslist[_itemId].startsAt+marketitemslist[_itemId].duration)
                {
                    IERC721(_nftaddress).transferFrom(address(this),marketitemslist[_itemId].seller , tokenId);
                    emit transferedToseller(_itemId, marketitemslist[_itemId].seller);
                    (bool success,)=payable(msg.sender).call{value:msg.value}("");
                    return;
                }

                uint256 requiredPrice = getTotalFeeMarketPrice(price, _nftaddress);
                require(msg.value==requiredPrice,"Price not Matching with mentioned price");
                require(Listeditemsvalidator[_nftaddress][tokenId],"NFT is not listed");
                
                uint256 _platformFee = getPlatformFee(price);
        
                 uint256 royaltyFeeTotal; 
                 if(NFTFactory.isMundumNFT(_nftaddress)){
                 royaltyFee = ERC721MUNDUMNFT(_nftaddress).getRoyaltyFee();
                 royaltyRecipient = ERC721MUNDUMNFT(_nftaddress).getRoyaltyRecipient();
                 royaltyFeeTotal = getTotalRoyaltyFee(price,royaltyFee);
                 }

              require(IERC721(_nftaddress).ownerOf(tokenId) == address(this), "NFT must be owned by market");
          
                uint256 _price=price-_platformFee;
                    
                (bool success,)=payable(feeRecipient).call{value:_platformFee}("");
                require(success,"Platformfee Payment Transaction Failed");
                 emit PlatformFeePaid(feeRecipient, _platformFee);

                if(royaltyFeeTotal>0){
                    _price=_price-royaltyFeeTotal;          
                (bool send,)=payable(royaltyRecipient).call{value:royaltyFeeTotal}("");
                require(send,"Fee Payment Transaction Failed"); 
                emit RoyaltyFeePaid(royaltyRecipient, royaltyFeeTotal);
                 }

                
                (bool sent,)=payable(marketitemslist[_itemId].seller).call{value:price}("");
                require(sent,"NFT Transaction Failed");
                IERC721(_nftaddress).transferFrom(address(this), _reciever, tokenId);
                marketitemslist[_itemId].owner = payable(_reciever); 
                marketitemslist[_itemId].status = State.Sold; 
                _fixedpriceitemsSold.increment();
            
                emit BoughtMarketItem(_itemId,_nftaddress,marketitemslist[_itemId].seller,_reciever,price); 
    }
       
       /**

@dev Calculates the total royalty fee for the given price and royalty fee percentage.
@param _price The price of the NFT.
@param _royaltyFee The percentage of the royalty fee.
@return The total royalty fee for the given price and royalty fee percentage.
*/
         function getTotalRoyaltyFee(uint256 _price,uint256 _royaltyFee) private view returns(uint256){
            require(royaltyFee>=0,"Market item didnt have royaltyfee");
            uint256 totalroyaltyfee = (_price * _royaltyFee) /100;
            return totalroyaltyfee; 
    }     

/**

@dev Calculates the total fee that includes the platform fee and royalty fee (if applicable) for a market item based on its price and NFT address.
@param price The price of the market item.
@param _nftaddress The address of the NFT contract for the market item.
@return _amount The total amount of fees to be paid for the market item, including platform fee and royalty fee (if applicable).
*/
    function getTotalFeeMarketPrice(uint256 price, address _nftaddress) public returns (uint _amount)
        {
            uint platformFeeTotal = getPlatformFee(price);
            uint royaltyFeeTotal=0;
            if(NFTFactory.isMundumNFT(_nftaddress)){
                royaltyFee = ERC721MUNDUMNFT(_nftaddress).getRoyaltyFee();
                royaltyFeeTotal = getTotalRoyaltyFee(royaltyFee,price);
            }
            emit totalFees(platformFeeTotal+royaltyFeeTotal+price);
            return platformFeeTotal+royaltyFeeTotal+price;
        }

/**

@dev Sets the platform fee that will be charged on each sale transaction.
@param _platformfee The new platform fee to be set.

*/
        function setPlatformFee(uint256 _platformfee) public onlyOwner {
            require(_platformfee > 0 ,"Fee must be greater than zero");
            platformFee = _platformfee;
            emit UpdatedPlatformFee(platformFee);
    }

/**

@dev Sets the listing fee that will be charged on every NFT listing.
@param _listingfee The new platform fee to be set.

*/
        function setListingFee(uint256 _listingfee) public onlyOwner {
            require(_listingfee > 0 ,"Fee must be greater than zero");
            listingfee = _listingfee;
            emit UpdatedListingFee(listingfee);
    }

/**

@dev Sets the fee recipient that will receive platformFee and listingFee.
@param _feerecipient The new fee recipient to be set.

*/
        function setFeeRecipient(address _feerecipient) public onlyOwner {
            require(_feerecipient != address(0) ,"Fee Recipient cannot be Zero Address");
            feeRecipient = _feerecipient;
            emit UpdatedFeeRecipient(feeRecipient);
    }

    /**

@dev Returns an array of all available market items that have not been sold yet.

@return An array of MarketItem struct.
*/
        function getMarketItems() public view returns (MarketItem[] memory){
            uint256 itemCount = _itemIds.current();
            uint256 unsoldItemCount = _itemIds.current() - _fixedpriceitemsSold.current();
            uint256 currentIndex = 0;

            MarketItem[] memory items=new MarketItem[](unsoldItemCount);

            for(uint256 i = 0; i < itemCount;){

                if(marketitemslist[i+1].owner == address(this)){

                    uint256 currentId = marketitemslist[i + 1].itemId;
                    MarketItem storage currentItem = marketitemslist[currentId];
                    items[currentIndex] = currentItem;
                    currentIndex += 1;

                }

                unchecked { i+=1; }
            }

            return items; 
        }
    
        /**

@dev Returns an array of all NFTs owned by the caller.

@return An array of MarketItem struct.
*/
        function getMyNFTs() public view returns (MarketItem[] memory){
            
            uint256 totalItemCount = _itemIds.current();

            uint256 itemCount = 0;
            uint256 currentIndex = 0;


            for(uint256 i = 0; i < totalItemCount;){
                if(marketitemslist[i+1].owner == msg.sender){
                    itemCount += 1; 
                }
                unchecked { i+=1; }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount;){
               if(marketitemslist[i+1].owner == msg.sender){
                   uint currentId = marketitemslist[i+1].itemId;
                   MarketItem storage currentItem = marketitemslist[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
               unchecked { i+=1; }
            }
            return items;

        }

        
        /**

@dev Returns an array of all the MarketItems created by the sender.
@return An array of MarketItems created by the sender.
*/
        function getItemsCreated() public view returns (MarketItem[] memory){
            
            uint totalItemCount = _itemIds.current();

            uint itemCount = 0;
            uint currentIndex = 0;


            for(uint i = 0; i < totalItemCount;){
                
                if(marketitemslist[i+1].seller == msg.sender){
                    itemCount += 1; 
                }
                unchecked { i+=1; }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount; i++){
               if(marketitemslist[i+1].seller == msg.sender){
                   uint currentId = marketitemslist[i+1].itemId;
                   MarketItem storage currentItem = marketitemslist[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
            }
            return items;

        }

        /**

@dev Returns the platform fee based on the given price.
@param _price The price of the item.
@return The platform fee.
*/
         function getPlatformFee(uint256 _price) public view returns(uint256){
            uint256 totalplatformfee = (_price * platformFee)/10000 ;
            return totalplatformfee; 
        }

/**

@dev Returns the listing fee.
@return The listing fee.
*/
        function getlistingFee() public view returns(uint256){
            return listingfee; 
        }

/**

@dev Returns the address of the fee recipient.
@return The address of the fee recipient.
*/
        function getFeeRecipient() public view returns(address){
            return feeRecipient; 
        }

/**

@dev ERC721 callback function.
*/
        function onERC721Received(address , address , uint256 , bytes memory) external pure  returns (bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
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