pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

    struct Star { 
        string name; 
        string coord_dec;
        string coord_mag;
        string coord_cent;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    uint256[] public totalStars;
    uint256[] public totalStarsForSale;

    modifier onlyUnique(string _coord_dec, string _coord_mag, string _coord_cent) {

        require(!checkIfStarExist(_coord_dec,_coord_mag,_coord_cent), "Coordinates already exist");
        _;
    }

    function createStar(string _name, string _coord_dec, string _coord_mag, string _coord_cent, string _story, uint256 _tokenId)
     public onlyUnique(_coord_dec,_coord_mag,_coord_cent) { 
        Star memory newStar = Star(_name,_coord_dec,_coord_mag,_coord_cent,_story);

        tokenIdToStarInfo[_tokenId] = newStar;
        totalStars.push(_tokenId) - 1;
        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender,"Sender does not match token");

        starsForSale[_tokenId] = _price;
        totalStarsForSale.push(_tokenId) - 1;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExist(string _coord_dec, string _coord_mag, string _coord_cent) public view returns (bool){
        bool exists = false;

        for(uint i; i<totalStars.length; i++){
            if(keccak256(abi.encodePacked(tokenIdToStarInfo[totalStars[i]].coord_dec)) == keccak256(abi.encodePacked(_coord_dec)) &&
            keccak256(abi.encodePacked(tokenIdToStarInfo[totalStars[i]].coord_mag)) == keccak256(abi.encodePacked(_coord_mag)) && 
            keccak256(abi.encodePacked(tokenIdToStarInfo[totalStars[i]].coord_cent)) == keccak256(abi.encodePacked(_coord_cent))){
                exists = true;
                break;
            }
        }

        return exists;
    }
}