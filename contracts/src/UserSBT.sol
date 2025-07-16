// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IISBTRegistry {
    function isRegisteredInstitution(address) external view returns (bool);
}

contract UserSBT is ERC721URIStorage, Ownable, Pausable {
    uint256 public tokenIdCounter;
    IISBTRegistry public immutable registry;

    struct SBTData { address issuer; uint256 expiry; } // 0 = permanen
    mapping(address => uint256) public ownedToken;     // user → tokenId
    mapping(uint256 => SBTData) public sbtMetadata;    // tokenId → data
    mapping(address => address) public issuedBy;       // user → issuer

    event Minted  (address indexed to,   uint256 indexed id, uint256 expiry);
    event Revoked (address indexed user, uint256 indexed id);
    event Expired (address indexed user, uint256 indexed id);
    event Renewed (address indexed user, uint256 indexed id, uint256 newExpiry);

    constructor(
        address registryAddr,
        string  memory name_,
        string memory symbol_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        registry = IISBTRegistry(registryAddr);
    }

    modifier onlyInstitution() {
        require(
            registry.isRegisteredInstitution(msg.sender),
            "Not verified institution"
        );
        _;
    }

    // ------------------------------ CORE LOGIC ------------------------------

    function mint(
        address to,
        string memory uri,
        uint256 expiryTimestamp
    ) external onlyInstitution whenNotPaused {
        require(ownedToken[to] == 0, "User already has SBT");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "Invalid expiry");

        uint256 id = ++tokenIdCounter;
        _safeMint(to, id);
        _setTokenURI(id, uri);

        ownedToken[to]      = id;
        sbtMetadata[id]     = SBTData(msg.sender, expiryTimestamp);
        issuedBy[to]        = msg.sender;

        emit Minted(to, id, expiryTimestamp);
    }

    function revoke(address user) external onlyInstitution whenNotPaused {
        uint256 id = ownedToken[user];
        require(id != 0, "No SBT");                 // existence
        require(sbtMetadata[id].issuer == msg.sender, "Not issuer");

        _burn(id);
        _cleanup(user, id);
        emit Revoked(user, id);
    }

    function autoRevokeExpired(address user) external whenNotPaused {
        uint256 id = ownedToken[user];
        require(id != 0, "No SBT");
        uint256 exp = sbtMetadata[id].expiry;
        require(exp != 0, "Permanent SBT");
        require(exp < block.timestamp, "Not expired");

        _burn(id);
        _cleanup(user, id);
        emit Expired(user, id);
    }

    function renewExpiry(address user, uint256 newExpiry)
        external onlyInstitution whenNotPaused
    {
        uint256 id = ownedToken[user];
        require(id != 0, "No SBT");
        require(sbtMetadata[id].issuer == msg.sender, "Not issuer");
        require(newExpiry == 0 || newExpiry > block.timestamp, "Invalid expiry");

        sbtMetadata[id].expiry = newExpiry;
        emit Renewed(user, id, newExpiry);
    }

    // ------------------------------ HELPERS ------------------------------

    function isExpired(address user) external view returns (bool) {
        uint256 id = ownedToken[user];
        if (id == 0) return false;
        uint256 exp = sbtMetadata[id].expiry;
        return exp != 0 && exp < block.timestamp;
    }

    function _cleanup(address user, uint256 id) internal {
        delete ownedToken[user];
        delete issuedBy[user];
        delete sbtMetadata[id];
    }

    // lock transfers
    function _update(address to, uint256 id, address auth)
        internal override returns (address)
    {
        address from = super._ownerOf(id);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, id, auth);
    }

    // pause controls
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
