// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ISBTRegistry.sol";

contract UserSBT is ERC721, Ownable, Pausable {
    uint256 public tokenIdCounter;
    IISBTRegistry public immutable registry;

    // REFACTOR: Tambahkan satu variabel untuk menyimpan URI untuk seluruh koleksi.
    string private _credentialURI;

    struct SBTData {
        address issuer;
        uint256 expiry; // 0 = permanen
    }
    
    mapping(uint256 => SBTData) public sbtMetadata;

    event Minted(address indexed to, uint256 indexed tokenId, uint256 expiry);
    event Revoked(uint256 indexed tokenId);
    event Expired(uint256 indexed tokenId);
    event Renewed(uint256 indexed tokenId, uint256 newExpiry);

    constructor(
        address registryAddr,
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        registry = IISBTRegistry(registryAddr);
    }

    modifier onlyVerifiedEntity() {
        require(
            registry.isVerifiedEntity(msg.sender),
            "Caller is not a verified entity"
        );
        _;
    }

    /**
     * @notice Override fungsi tokenURI untuk mengembalikan URI kredensial yang sama
     * untuk semua token dalam koleksi ini.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        require(bytes(_credentialURI).length > 0, "UserSBT: Token URI not set");
        return _credentialURI;
    }

    /**
     * @notice Mint satu token. Hanya bisa dipanggil oleh pemilik kontrak.
     */
    function mint(
        address to,
        string memory uri,
        uint256 expiryTimestamp
    ) external onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "Invalid expiry");
        
        // REFACTOR: Set URI hanya jika belum ada.
        if (bytes(_credentialURI).length == 0) {
            _credentialURI = uri;
        }

        uint256 id = ++tokenIdCounter;
        _safeMint(to, id);
        // REFACTOR: Hapus _setTokenURI dari sini.
        sbtMetadata[id] = SBTData(owner(), expiryTimestamp);
        
        emit Minted(to, id, expiryTimestamp);
    }

    /**
     * @notice Mint token secara massal. JAUH LEBIH EFISIEN.
     */
    function mintBatch(
        address[] calldata recipients,
        string calldata uri,
        uint256 expiryTimestamp
    ) external onlyOwner whenNotPaused {
        require(recipients.length > 0, "Empty recipients array");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "Invalid expiry");

        // REFACTOR: Set URI hanya sekali di awal untuk seluruh batch.
        if (bytes(_credentialURI).length == 0) {
            _credentialURI = uri;
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address to = recipients[i];
            if (to != address(0)) {
                uint256 id = ++tokenIdCounter;
                _safeMint(to, id);
                // REFACTOR: Hapus _setTokenURI dari dalam loop.
                sbtMetadata[id] = SBTData(owner(), expiryTimestamp);
                emit Minted(to, id, expiryTimestamp);
            }
        }
    }

    function revoke(uint256 tokenId) external onlyVerifiedEntity whenNotPaused {
        // FIX: Menggunakan _ownerOf untuk memeriksa keberadaan token.
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(sbtMetadata[tokenId].issuer == msg.sender, "Caller is not the issuer");
        _burn(tokenId);
        delete sbtMetadata[tokenId];
        emit Revoked(tokenId);
    }

    // REFACTOR: Fungsi sekarang menerima `tokenId` untuk kejelasan.
    function autoRevokeExpired(uint256 tokenId) external whenNotPaused {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 exp = sbtMetadata[tokenId].expiry;
        require(exp != 0, "Token is permanent");
        require(exp < block.timestamp, "Token has not expired yet");

        _burn(tokenId);
        delete sbtMetadata[tokenId];
        
        emit Expired(tokenId);
    }

    // REFACTOR: Fungsi sekarang menerima `tokenId` untuk kejelasan.
    function renewExpiry(uint256 tokenId, uint256 newExpiry)
        external onlyVerifiedEntity whenNotPaused
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(sbtMetadata[tokenId].issuer == msg.sender, "Caller is not the issuer");
        require(newExpiry == 0 || newExpiry > block.timestamp, "Invalid new expiry");

        sbtMetadata[tokenId].expiry = newExpiry;
        emit Renewed(tokenId, newExpiry);
    }

    // ------------------------------ HELPERS ------------------------------

    // REFACTOR: Fungsi sekarang menerima `tokenId` untuk kejelasan.
    function isExpired(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        uint256 exp = sbtMetadata[tokenId].expiry;
        return exp != 0 && exp < block.timestamp;
    }

    // REFACTOR: Menghapus fungsi `_cleanup` karena tidak lagi diperlukan.

    // Logika Soulbound (tidak berubah, sudah benar)
    function _update(address to, uint256 id, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(id);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, id, auth);
    }

    // Kontrol Pausable (tidak berubah, sudah benar)
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
