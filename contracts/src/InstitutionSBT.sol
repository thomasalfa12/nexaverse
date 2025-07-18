// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IISBTRegistry {
    function isRegisteredInstitution(address) external view returns (bool);
    function owner() external view returns (address);
}

contract InstitutionSBT is ERC721URIStorage, Ownable {
    /* ========== STRUCTS ========== */
    struct MintRequest {
        string uri;
        bool approved;
        bool claimed;
    }

    /* ========== STATE VARIABLES ========== */
    uint256 public tokenIdCounter;
    IISBTRegistry public immutable registry;

    mapping(address => MintRequest) public mintRequests;
    mapping(address => uint256) public claimedTokenId;

    /* ========== EVENTS ========== */
    event MintRequested(address indexed requester);
    event MintApproved(address indexed requester, string uri);
    event Minted(address indexed to, uint256 indexed tokenId, string uri);

    /* ========== CONSTRUCTOR ========== */
    constructor(
        address registry_,
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        registry = IISBTRegistry(registry_);
        require(registry.isRegisteredInstitution(initialOwner), "Owner not registered");
    }

    /* ========== PUBLIC FUNCTIONS ========== */

    /// @notice Request to mint an SBT
      function requestMint() external {
        require(registry.isRegisteredInstitution(msg.sender), "Not registered");
        require(!mintRequests[msg.sender].claimed, "Already claimed");

        mintRequests[msg.sender] = MintRequest({
            uri: "",
            approved: false,
            claimed: false
        });

        emit MintRequested(msg.sender);
    }

    /// @notice Claim a previously approved SBT
  function claim() external {
        MintRequest storage request = mintRequests[msg.sender];
        require(request.approved, "Not approved yet");
        require(!request.claimed, "Already claimed");
        require(bytes(request.uri).length > 0, "URI not set");

        uint256 tokenId = ++tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, request.uri);

        request.claimed = true;
        claimedTokenId[msg.sender] = tokenId;

        emit Minted(msg.sender, tokenId, request.uri);
    }


    /* ========== ADMIN FUNCTIONS ========== */

    /// @notice Admin approves mint request
     function approveMintRequest(address to, string memory uri) external onlyOwner {
        require(registry.isRegisteredInstitution(to), "Not registered");
        require(!mintRequests[to].approved, "Already approved");
        require(!mintRequests[to].claimed, "Already claimed");

        mintRequests[to].uri = uri;
        mintRequests[to].approved = true;

        emit MintApproved(to, uri);
    }


    /// @notice Transfer ownership only to registered institution
    function transferOwnership(address newOwner) public override onlyOwner {
        require(registry.isRegisteredInstitution(newOwner), "New owner not registered");
        super.transferOwnership(newOwner);
    }

    /* ========== SOULBOUND LOGIC ========== */

    /// @notice Prevent token transfer (non-transferable SBT)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }

    /* ========== BURN FUNCTION ========== */

    /// @notice Registry owner can burn a user's SBT
    function burnSBT(address user) external {
        require(msg.sender == registry.owner(), "Only registry owner");

        uint256 tokenId = claimedTokenId[user];
        if (_ownerOf(tokenId) == user) {
            _burn(tokenId);
        }
    }
}
