// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleClaimSBT is ERC721URIStorage, Ownable {
    bytes32 public immutable merkleRoot;
    string public metadataURI;
    uint256 private _tokenIdCounter;
    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed claimant, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        bytes32 _merkleRoot,
        string memory _metadataURI
    ) ERC721(name_, symbol_) Ownable(owner_) {
        merkleRoot = _merkleRoot;
        metadataURI = _metadataURI;
    }

    function claim(bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );

        hasClaimed[msg.sender] = true;
        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit Claimed(msg.sender, tokenId);
    }

    // --- Logika Soulbound ---
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0))
            revert("Certificate is non-transferable");
        return super._update(to, tokenId, auth);
    }
}
