// File: contracts/VerifiedEntitySBT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// Impor interface yang telah diperbarui
import "./interfaces/ISBTRegistry.sol";

contract VerifiedEntitySBT is ERC721, Ownable {
    using Strings for uint256;

    struct MintRequest {
        bytes32 cid;
        bool approved;
        bool claimed;
    }

    uint256 public tokenIdCounter;
    IISBTRegistry public immutable registry;

    mapping(address => MintRequest) public mintRequests;
    mapping(address => uint256) public claimedTokenId;
    mapping(uint256 => bytes32) private _tokenCIDs;

    event MintRequested(address indexed requester);
    event MintApproved(address indexed requester, bytes32 cid);
    event Minted(address indexed to, uint256 indexed tokenId, bytes32 cid);

    constructor(
        address registry_,
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        registry = IISBTRegistry(registry_);
        // REFACTOR: Memanggil fungsi baru dan pesan error yang sesuai
        require(registry.isVerifiedEntity(initialOwner), "Owner is not a verified entity");
    }

    function requestMint() external {
        // REFACTOR: Memanggil fungsi baru dan pesan error yang sesuai
        require(registry.isVerifiedEntity(msg.sender), "Sender is not a verified entity");
        require(!mintRequests[msg.sender].claimed, "SBT already claimed");

        mintRequests[msg.sender] = MintRequest({
            cid: bytes32(0),
            approved: false,
            claimed: false
        });

        emit MintRequested(msg.sender);
    }

    function claim() external {
        MintRequest storage request = mintRequests[msg.sender];
        require(request.approved, "Request has not been approved yet");
        require(!request.claimed, "SBT already claimed");
        require(request.cid != bytes32(0), "Metadata CID has not been set by admin");

        uint256 tokenId = ++tokenIdCounter;
        _mint(msg.sender, tokenId);

        _tokenCIDs[tokenId] = request.cid;

        request.claimed = true;
        claimedTokenId[msg.sender] = tokenId;

        emit Minted(msg.sender, tokenId, request.cid);
    }

    function approveMintRequest(address to, bytes32 cid) external onlyOwner {
        // REFACTOR: Memanggil fungsi baru dan pesan error yang sesuai
        require(registry.isVerifiedEntity(to), "Recipient is not a verified entity");
        require(!mintRequests[to].approved, "Request already approved");
        require(!mintRequests[to].claimed, "SBT already claimed by this address");
        require(cid != bytes32(0), "CID cannot be empty");

        mintRequests[to].cid = cid;
        mintRequests[to].approved = true;

        emit MintApproved(to, cid);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");

        bytes32 cid = _tokenCIDs[tokenId];
        require(cid != bytes32(0), "ERC721: Token URI not set");

        return string(abi.encodePacked("ipfs://", _bytes32ToHexString(cid)));
    }

    function _bytes32ToHexString(bytes32 _bytes) private pure returns (string memory) {
        bytes memory buffer = new bytes(64);
        for (uint i = 0; i < 32; i++) {
            buffer[i*2] = _toHexDigit(uint8(_bytes[i] >> 4));
            buffer[i*2+1] = _toHexDigit(uint8(_bytes[i] & 0x0f));
        }
        return string(abi.encodePacked("0x", buffer));
    }

    function _toHexDigit(uint8 _digit) private pure returns (bytes1) {
        if (_digit < 10) {
            return bytes1(uint8(bytes1('0')) + _digit);
        } else {
            return bytes1(uint8(bytes1('a')) + _digit - 10);
        }
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        // REFACTOR: Memanggil fungsi baru dan pesan error yang sesuai
        require(registry.isVerifiedEntity(newOwner), "New owner is not a verified entity");
        super.transferOwnership(newOwner);
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }

    function burnSBT(address user) external {
        require(msg.sender == registry.owner(), "Only registry owner");
        uint256 tokenId = claimedTokenId[user];
        if (ownerOf(tokenId) == user) {
            _burn(tokenId);
        }
    }
}
