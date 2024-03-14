//SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./MUNDUMNFTFactory.sol";
import "./MUNDUMNFTMarketplace.sol";

contract AuctionMUNDUM is ReentrancyGuard {
  
   using Counters for Counters.Counter;

  Counters.Counter private bidIds;
  Counters.Counter private _auctionitemsSold;
  
  enum State{Created,Sold,Inactive}

    address private _royaltyRecipient;
    uint256 private _royaltyFee;   
     
    MUNDUMNFTFactory private immutable NFTFactory;
    MundumNFTMarketplace private immutable Marketplace;
 
  struct EnglishBid{
        uint256 bidId;
        address nftAddress;
        uint256 nftId;
        address payable seller;
        uint256 startingPrice;
        uint256 endsAt;
        bool isCompleted;
        State status;
        address owner;
        address highestBidder;
        uint256 highestBid;
        uint256 prevBid;
        string auction;
        uint256 length;
    }
    
    struct DutchBid{
        uint256 bidId; 
        address nftAddress;
        uint nftId;
        address payable seller;
        uint256 startingPrice;
        uint256 startAt;
        uint256 endsAt;
        uint256 minimumPrice;
        bool isCompleted;
        State status;
        address owner;
        address winner;
        string auction;
        uint256 winningBid;
    }

    mapping( uint256 => DutchBid) public AllDutchBids;
    mapping( uint256 => EnglishBid) public  AllEnglishBids;
    mapping ( address => mapping(uint256=>uint256)) public amountBid;
    mapping ( uint256 => mapping(uint256=>address)) public AllEnglishBidders;
    mapping(address=>mapping(uint256=>bool)) private Listeditemsvalidator;



    event PlatformFeePaid(address indexed buyer,uint256 amount);
    event RoyaltyFeePaid(address indexed buyer,uint256 amount);
    event ListingFeePaid(address indexed creator,uint256 amount);

    event Test(uint256 refundAmount);


               /**
     * @dev Emitted when english auction started successfully with _bidId as bid Id, the seller, the nft address, the nft id, the starting price and the duration.
     */
    event englishAuctionStarted(uint256 indexed _bidId,address _seller,address _nftAddress,uint _nftId,uint _startingPrice, uint _duration);
    /**
     * @dev Emitted when english auction get bidded successfully with _bidId as bid Id, the seller, the current highest bidder address and the bid value by him.
     */
    event englishAuctionBidSuccess(uint256 indexed _bidId,address _currentHighestBidder,uint _currentHighestBid);
    /**
     * @dev Emitted when english auction ended successfully with _bidId as bid Id, the winner and the winning Bid
     */
    event englishAuctionEnd(uint256 indexed _bidId,address _winner,uint _winningBid);

    /**
     * @dev Emitted when dutch auction started successfully with _bidId as bid Id, the seller, the nft address, the nft id, the starting price, the minimum price and the duration.
     */
    event dutchAuctionStarted(uint256 indexed _bidId,address _seller,address _nftAddress,uint _nftId, uint _startingPrice, uint _minimumPrice, uint _duration);
    /**
     * @dev Emitted when dutch auction ended successfully with _bidId as bid Id , the winner and the winning Bid.
     */
    event dutchAuctionEnd(uint256 indexed _bidId,address _winner,uint _winningBid);
    /**
     * @dev Emitted when dutch auction price is called with _bidId as bid Id and the current price of nft.
     */
    event dutchAuctionCurrentPrice(uint256 indexed _bidId,uint _currentPrice); 
    /**
     * @dev Emitted when getTotalPriceAuction is called with _bidId as bid Id and the current price of nft.
     */
    event finalAuctionPrice(uint256 indexed _bidId,uint auction, uint _finalPrice); 

    event NonWinningBidderRefunded(uint256 _bidId, address bidder, uint256 refundAmount);


     constructor(MUNDUMNFTFactory _NFTFactory,MundumNFTMarketplace _Marketplace){
          NFTFactory=_NFTFactory;
          Marketplace=_Marketplace;
     }
     

     function startDutchAuction(uint _startingPrice, uint _minimumPrice, address _nftAddress, uint _nftId, uint _duration) public payable nonReentrant returns (uint256 _bidId){
        require(msg.sender==IERC721(_nftAddress).ownerOf(_nftId),"Not an Owner of NFT");
        address feeRecipient = Marketplace.getFeeRecipient();
        uint256 listingfee = Marketplace.getlistingFee();
        require(msg.value==listingfee,"Listing fee not paid");
        bidIds.increment();
        uint256 bidId=bidIds.current();
        address payable sender=payable(msg.sender);
        AllDutchBids[bidId] = DutchBid(bidId,_nftAddress,_nftId,sender,_startingPrice,block.timestamp,block.timestamp+_duration,_minimumPrice,false,State.Created,address(this),address(0),"Dutch",0);
        require(_minimumPrice>0,"Minimum Price must be greater than 0");
        require(_startingPrice > _minimumPrice , "Starting price is already less than minimum price");
         
        IERC721(_nftAddress).transferFrom(sender, address(this), _nftId);
        (bool sent,)=payable(feeRecipient).call{value:listingfee}("");
        require(sent,"listing fee transaction failed");
        Listeditemsvalidator[_nftAddress][_nftId] = true;
        emit dutchAuctionStarted(bidId, sender, _nftAddress, _nftId, _startingPrice, _minimumPrice, _duration);
        return bidId;
    }

    function getDutchPrice(uint256 _bidId) public returns (uint ) {
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        DutchBid storage currBid = AllDutchBids[_bidId];
        uint _discountRate = (currBid.startingPrice - currBid.minimumPrice)/(currBid.endsAt-currBid.startAt);
        uint timeElapsed = block.timestamp - currBid.startAt;
        uint discount = _discountRate * timeElapsed;
        require(discount<currBid.startingPrice,"Auction ended");
        emit dutchAuctionCurrentPrice(_bidId,currBid.startingPrice - discount);
        return currBid.startingPrice - discount;
    }

    function EndDutchAuction(uint256 _bidId) public payable nonReentrant returns (address winner) {
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        DutchBid storage currBid = AllDutchBids[_bidId];
        uint256 _nftId = currBid.nftId;
        address feeRecipient = Marketplace.getFeeRecipient();
        require(block.timestamp < currBid.endsAt,"Auction Ended!");
        uint256 currBidPrice = getDutchPrice(_bidId);
        uint256 totalPrice = getTotalPriceAuction(_bidId,0,0);
        uint256 value = msg.value;
        require(value>=totalPrice,"Amount less than curr Price");
        address sender = msg.sender;
        ERC721(currBid.nftAddress).transferFrom(address(this), sender, _nftId);
        uint refund = value - totalPrice;
        if (refund > 0) {
            payable(sender).transfer(refund);
        }
        currBid.winner=sender;
        currBid.isCompleted=true;
        currBid.owner=sender;
        currBid.status=State.Sold;
        currBid.winningBid=currBidPrice;
        payable(currBid.seller).transfer(currBidPrice);
        _auctionitemsSold.increment();
        uint256 platformFee = Marketplace.getPlatformFee(currBidPrice);
        
        uint256 royaltyFeeTotal; 
        if(NFTFactory.isMundumNFT(currBid.nftAddress))
        {    
            _royaltyFee = ERC721MUNDUMNFT(currBid.nftAddress).getRoyaltyFee();
            _royaltyRecipient = ERC721MUNDUMNFT(currBid.nftAddress).getRoyaltyRecipient();
            royaltyFeeTotal = getTotalRoyaltyFee(currBidPrice,_royaltyFee);
        }
        (bool success,)=payable(feeRecipient).call{value:platformFee}("");
        require(success,"Platformfee Payment Transaction Failed");
        emit PlatformFeePaid(feeRecipient, platformFee);

        if(royaltyFeeTotal>0)
        {     
            (bool send,)=payable(_royaltyRecipient).call{value:royaltyFeeTotal}("");
            require(send,"Fee Payment Transaction Failed"); 
            emit RoyaltyFeePaid(_royaltyRecipient, royaltyFeeTotal);
        }

        emit dutchAuctionEnd(_bidId, currBid.winner, currBidPrice);
        return currBid.winner;
    }

    function isDutchAuctionCompleted(uint _bidId) public nonReentrant returns(bool)
    {
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        DutchBid storage currBid = AllDutchBids[_bidId];
        if(currBid.isCompleted)
            return true;
        if(block.timestamp>currBid.endsAt){
            if(currBid.winner==address(0))
            {
                ERC721(currBid.nftAddress).transferFrom(address(this),currBid.seller, currBid.nftId);
                currBid.isCompleted=true;
                currBid.owner=currBid.seller;
                emit dutchAuctionEnd(_bidId, address(0), 0);
            }
            return true;
        }
        return false;
    }

    function startEnglishAuction(address _nftAddress,uint _nftId,uint startingBid,uint _duration) public payable nonReentrant returns (uint256 _bidId){
        require(msg.sender==IERC721(_nftAddress).ownerOf(_nftId),"Not an Owner of NFT");
        uint256 listingfee = Marketplace.getlistingFee();
        address feeRecipient = Marketplace.getFeeRecipient();
        require(msg.value==listingfee,"Listing fee not paid");
        bidIds.increment();
        uint256 bidId=bidIds.current();
        address sender=msg.sender;
        AllEnglishBids[bidId]=EnglishBid(bidId,_nftAddress,_nftId,payable(sender),startingBid,block.timestamp+_duration*1 seconds,false,State.Created,address(this),address(0),startingBid,startingBid,"English",0);
        ERC721(_nftAddress).transferFrom(sender,address(this),_nftId);
        (bool sent,)=payable(feeRecipient).call{value:listingfee}("");
        require(sent,"listing fee transaction failed");
        Listeditemsvalidator[_nftAddress][_nftId] = true;
        emit englishAuctionStarted(bidId, sender, _nftAddress, _nftId, startingBid, _duration);
        return bidId;
    }

    function bidEnglishAuction(uint256 _bidId,uint256 bidAmount) public nonReentrant payable{
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        uint value = msg.value;
        EnglishBid storage currBid = AllEnglishBids[_bidId];
        address sender = msg.sender;
        require(block.timestamp < currBid.endsAt,"Auction Ended!");

        uint needToPay = getTotalPriceAuction(_bidId,1,bidAmount);
        require(value == needToPay,"Bid Amount and value not matching");
        amountBid[sender][_bidId]+=value;
        AllEnglishBidders[_bidId][currBid.length] = sender;
        currBid.prevBid=currBid.highestBid;
        currBid.highestBid=bidAmount;
        currBid.highestBidder=sender;
        currBid.length=currBid.length+1;
        emit englishAuctionBidSuccess(_bidId, currBid.highestBidder, currBid.highestBid);
    }

    function withDrawBidValue(uint256 _bidId) public nonReentrant returns(bool)
    {
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        EnglishBid storage currBid = AllEnglishBids[_bidId];
        require(currBid.isCompleted,"Auction not completed yet, you can't withdraw");
        require(currBid.highestBidder!=msg.sender,"Winner can't withdraw bid");
        address sender = msg.sender;
        uint amount = amountBid[sender][_bidId]; 
        (bool sent,)=payable(sender).call{value:amount}("");
        require(sent,"Withdrawing Fail");
        amountBid[sender][_bidId]=0;
        return true;
    }

    function endEnglishAuction(uint256 _bidId) public payable nonReentrant {
        require(_bidId <= bidIds.current(), "Wrong Bid Id!");
        EnglishBid storage currBid = AllEnglishBids[_bidId];
        address sender = msg.sender;
        require(sender == currBid.seller, "Only Owner can end the auction");
        //require(block.timestamp > currBid.endsAt, "Auction is still active!");

        uint256 prevBid = currBid.prevBid;
        uint256 highestBid = currBid.highestBid;
        address highestBidder = currBid.highestBidder;
        uint256 totalBids = currBid.length;

        if (highestBidder != address(0)) {
            // Transfer the NFT to the highest bidder and funds to the seller
            ERC721(currBid.nftAddress).transferFrom(address(this), highestBidder, currBid.nftId);
            payable(currBid.seller).transfer(highestBid);

            // Calculate the platform fee and royalty fee
            uint256 platformFee = Marketplace.getPlatformFee(prevBid);
            address feeRecipient = Marketplace.getFeeRecipient();
            uint256 royaltyFeeTotal;
            if (NFTFactory.isMundumNFT(currBid.nftAddress)) {
                _royaltyFee = ERC721MUNDUMNFT(currBid.nftAddress).getRoyaltyFee();
                _royaltyRecipient = ERC721MUNDUMNFT(currBid.nftAddress).getRoyaltyRecipient();
                royaltyFeeTotal = getTotalRoyaltyFee(_royaltyFee, prevBid);
            }

            // Transfer platform fee and royalty fee
            (bool success, ) = payable(feeRecipient).call{value: platformFee}("");
            require(success, "Platform fee payment failed");
            emit PlatformFeePaid(feeRecipient, platformFee);

            if (royaltyFeeTotal > 0) {
                (bool send, ) = payable(_royaltyRecipient).call{value: royaltyFeeTotal}("");
                require(send, "Royalty fee payment failed");
                emit RoyaltyFeePaid(_royaltyRecipient, royaltyFeeTotal);
            }

            // Mark the auction as completed and increment the sold items counter
            currBid.isCompleted = true;
            currBid.status = State.Sold;
            _auctionitemsSold.increment();

            // Clear the amountBid mapping for this highestBidder
            amountBid[highestBidder][_bidId] = 0;
        }

        // Refund the non-winning bidders
        refundNonWinningBidders(_bidId, totalBids);

        emit englishAuctionEnd(_bidId, highestBidder, highestBid);
    }

    function refundNonWinningBidders(uint256 _bidId, uint256 totalBids) private  {
        EnglishBid storage _currBid = AllEnglishBids[_bidId];

        address _highestBidder = _currBid.highestBidder;
        address bidder;
        uint256 refundAmount;
        for (uint256 i = 0; i < totalBids; i++) {
            
            bidder = AllEnglishBidders[_bidId][i];
            if (bidder != address(0)) {
                if(bidder != _highestBidder) {
                refundAmount = amountBid[bidder][_bidId];

                if(amountBid[bidder][_bidId] != 0) {

                amountBid[bidder][_bidId]=0;

                (bool sent, ) = payable(bidder).call{value: refundAmount}("");

                require(sent, "Refund failed");

                emit NonWinningBidderRefunded(_bidId, bidder, refundAmount);
                }
                }
            }
        }
    }

    function getHighestBid(uint _bidId) public view returns(uint _currentHighestBid)
    {
        require(_bidId<=bidIds.current(),"Wrong Bid Id!");
        EnglishBid storage currBid = AllEnglishBids[_bidId];
        return currBid.highestBid;
    }

    
    
    function getTotalPriceAuction(uint256 _bidId,uint auction, uint bidValue) public returns (uint _amount)
    {
        if(auction==0)
        {
            DutchBid memory currBid = AllDutchBids[_bidId];
            uint price = getDutchPrice(_bidId);
            address _nftaddress = currBid.nftAddress;
            uint platformFeeTotal = Marketplace.getPlatformFee(price);
            uint royaltyFeeTotal=0;
            if(NFTFactory.isMundumNFT(_nftaddress)){
                _royaltyFee = ERC721MUNDUMNFT(_nftaddress).getRoyaltyFee();
                royaltyFeeTotal = getTotalRoyaltyFee(_royaltyFee,price);
            }
            uint256 _finalPrice = platformFeeTotal+royaltyFeeTotal+price;
            emit finalAuctionPrice(_bidId, auction, _finalPrice);
            return _finalPrice;

        }
        else{
            EnglishBid memory currBid = AllEnglishBids[_bidId];
            uint price = currBid.highestBid;
            address _nftaddress = currBid.nftAddress;
            uint platformFeeTotal = Marketplace.getPlatformFee(price);
            uint royaltyFeeTotal=0;
            if(NFTFactory.isMundumNFT(_nftaddress)){
                _royaltyFee = ERC721MUNDUMNFT(_nftaddress).getRoyaltyFee();
                royaltyFeeTotal = getTotalRoyaltyFee(_royaltyFee,price);
            }
            uint256 _finalPrice = bidValue+platformFeeTotal+royaltyFeeTotal-amountBid[msg.sender][_bidId];
            emit finalAuctionPrice(_bidId, auction, _finalPrice);
            return _finalPrice;
        }
    }

    function getFinalPrice(uint256 _bidId,uint auction) public returns(uint _amount)
    {
        //Taking maximum 7 percent fees, extra will be refunded
        uint256 price;
        if(auction==0)
        {
            price = getDutchPrice(_bidId);
            return (price*107)/100;
        }
        else{
            EnglishBid memory currBid = AllEnglishBids[_bidId];
            price = currBid.highestBid;
            return (price*107)/100;
        }
 
    }     

    function getTotalRoyaltyFee(uint256 _price,uint256 royaltyFee) private view returns(uint256){
        uint256 totalroyaltyfee = (_price * royaltyFee) /100;
        return totalroyaltyfee;    
    }
}