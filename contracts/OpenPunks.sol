// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OpenPunks is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string baseURI;
    string public baseExtension = ".json";
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMintAmount = 1;
    uint256 public timeDeployed;
    uint256 public allowMintingAfter = 0;
    bool public isPaused = false;
    bool public isRevealed = true;
    string public notRevealedUri;
    address from;
    //uint256 public tokenCount;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn, // in sec?
        string memory _initBaseURI,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {

        timeDeployed = block.timestamp; // in sec

        require(_allowMintingOn > timeDeployed, "Minting in the past not permitted!");

        if (_allowMintingOn > timeDeployed) {
            allowMintingAfter = _allowMintingOn - timeDeployed;
        }

        cost = _cost;
        maxSupply = _maxSupply;       

        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedUri);
    } 

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function getBlockTime() public view returns (uint256) {
        return block.timestamp;
    }

    // public
    function mint(uint256 _mintAmount) public payable {
        require(
            block.timestamp >= timeDeployed + allowMintingAfter,
            "Minting not allowed yet"
    
        );

        console.log("block:",block.timestamp);

        //require(balanceOf(msg.sender) == 0, "Only 1 mint per account");
     
        uint256 supply = totalSupply(); // Total amount in existence
        require(!isPaused, "Is paused");
        require(_mintAmount > 0, "Mint amount = 0");
        require(_mintAmount <= maxMintAmount, "Mint amount more than max per mint");
        require(supply + _mintAmount <= maxSupply, "No NFT left");

        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount, "Insufficient ETH sent for NFT");
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    // Return ids of all tokens (in this NFT collection) owned by a particular account
    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount); // Declare size of array upfront
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (isRevealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function getSecondsUntilMinting() public view returns (uint256) {
        if (block.timestamp < timeDeployed + allowMintingAfter) {
            return (timeDeployed + allowMintingAfter) - block.timestamp;
        } else {
            return 0;
        }
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    function getMsgSender() public view returns (address) {
        return msg.sender;
    }    

    // Balance of this contract
    function currentContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Address of this contract
    function currentContractAddress() public view returns (address) {
        return address(this);
    }

    // Only Owner Functions
    function setIsRevealed(bool _state) public onlyOwner {
        isRevealed = _state;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function setIsPaused(bool _state) public onlyOwner {
        isPaused = _state;
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success);        
    }
}
