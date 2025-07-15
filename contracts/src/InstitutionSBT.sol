// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";          // <─❶ tambahkan
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface ISBTRegistry {
    function isRegisteredInstitution(address) external view returns (bool);
}

contract InstitutionSBT is ERC721URIStorage, Ownable, EIP712 {
    using ECDSA for bytes32;

    /* ---------------- state ---------------- */
    uint256 public tokenIdCounter;
    ISBTRegistry public immutable registry;
    mapping(bytes32 => bool) public consumed;

    bytes32 private constant CLAIM_TYPEHASH =
        keccak256("Claim(uint256 tokenId,address to,string uri,uint256 deadline)");

    /* -------------- constructor ------------- */
    constructor(
        address registry_,
        string memory name_,
        string memory symbol_,
        address initialOwner
    )
        ERC721(name_, symbol_)
        Ownable(initialOwner)
        EIP712(name_, "1")
    {
        registry = ISBTRegistry(registry_);
        require(registry.isRegisteredInstitution(initialOwner), "Owner not registered");
    }

    /* --------------- claim ------------------ */
    event Claimed(address indexed to, uint256 indexed tokenId, string uri);

    function claim(
        uint256 tokenId,
        string calldata uri,
        uint256 deadline,
        bytes calldata sig
    ) external {
        require(block.timestamp <= deadline, "Expired");
        require(registry.isRegisteredInstitution(msg.sender), "Not registered");

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    CLAIM_TYPEHASH,
                    tokenId,
                    msg.sender,
                    keccak256(bytes(uri)),
                    deadline
                )
            )
        );

        require(!consumed[digest], "Already claimed");
        consumed[digest] = true;
        require(digest.recover(sig) == owner(), "Bad signature");

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        if (tokenId > tokenIdCounter) tokenIdCounter = tokenId;
        emit Claimed(msg.sender, tokenId, uri);
    }

    /* ---------- soul-bound enforcement ------ */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("SBT: non-transferable");
    }
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("SBT: non-transferable");
    }
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("SBT: non-transferable");
    }
    // hanya varian yg virtual (= yg ada `bytes data`)
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override(ERC721, IERC721) {
        revert("SBT: non-transferable");
    }

    /* -------- owner integrity with registry -------- */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(registry.isRegisteredInstitution(newOwner), "New owner not registered");
        super.transferOwnership(newOwner);
    }
}