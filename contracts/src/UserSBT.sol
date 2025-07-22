// File: contracts/UserSBT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
// REFACTOR: Impor interface yang telah diperbarui
import "./interfaces/ISBTRegistry.sol";

/**
 * @title UserSBT (Refactored)
 * @author Nexaverse (Refactored by Gemini)
 * @notice Kontrak ini adalah template generik untuk menerbitkan kredensial
 * (ijazah, sertifikat, dll.) sebagai SBT kepada pengguna akhir.
 *
 * --- ANALISIS & REFACTORING ---
 * 1.  **Menghapus Batasan "Satu Token per Pengguna":**
 * - Desain sebelumnya (menggunakan `mapping(address => uint256)`) secara fundamental
 * membatasi pengguna untuk hanya bisa memiliki SATU SBT dari kontrak ini.
 * Ini adalah batasan kritis. Bayangkan sebuah universitas yang hanya bisa
 * memberikan satu sertifikat webinar seumur hidup kepada seorang mahasiswa.
 * - REFACTOR: Mapping `ownedToken` dan `issuedBy` telah dihapus. Kontrak sekarang
 * sepenuhnya mengandalkan fungsionalitas standar ERC721 untuk melacak kepemilikan,
 * memungkinkan satu pengguna untuk memiliki BANYAK SBT dari kontrak yang sama.
 *
 * 2.  **Fungsi Berbasis `tokenId`:**
 * - Untuk mendukung banyak token per pengguna, semua fungsi inti (`revoke`, `renewExpiry`,
 * `isExpired`) sekarang beroperasi menggunakan `tokenId` sebagai input utama,
 * bukan alamat `user`. Ini lebih aman, lebih eksplisit, dan bebas ambiguitas.
 *
 * 3.  **Konsistensi Penamaan:**
 * - Semua referensi ke "Institution" telah diubah menjadi "Entity" agar
 * selaras dengan kontrak ISBTRegistry.sol.
 */
contract UserSBT is ERC721URIStorage, Ownable, Pausable {
    uint256 public tokenIdCounter;
    IISBTRegistry public immutable registry;

    struct SBTData {
        address issuer;
        uint256 expiry; // 0 = permanen
    }
    
    // REFACTOR: Menghapus `ownedToken` dan `issuedBy` mappings.
    // `sbtMetadata` sekarang menjadi satu-satunya sumber kebenaran untuk data token.
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

    // REFACTOR: Nama modifier diubah untuk konsistensi.
    modifier onlyVerifiedEntity() {
        // REFACTOR: Memanggil fungsi yang benar dari interface.
        require(
            registry.isVerifiedEntity(msg.sender),
            "Caller is not a verified entity"
        );
        _;
    }

    // ------------------------------ CORE LOGIC ------------------------------

    function mint(
        address to,
        string memory uri,
        uint256 expiryTimestamp
    ) external onlyVerifiedEntity whenNotPaused {
        // REFACTOR: Menghapus `require(ownedToken[to] == 0, "User already has SBT");`
        // Sekarang pengguna bisa menerima banyak kredensial dari penerbit yang sama.
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "Invalid expiry");

        uint256 id = ++tokenIdCounter;
        _safeMint(to, id);
        _setTokenURI(id, uri);

        sbtMetadata[id] = SBTData(msg.sender, expiryTimestamp);

        emit Minted(to, id, expiryTimestamp);
    }

    // REFACTOR: Fungsi sekarang menerima `tokenId` untuk kejelasan.
    function revoke(uint256 tokenId) external onlyVerifiedEntity whenNotPaused {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(sbtMetadata[tokenId].issuer == msg.sender, "Caller is not the issuer");

        // `_burn` secara otomatis menangani pembersihan data kepemilikan.
        _burn(tokenId);
        // Kita hanya perlu membersihkan metadata kustom kita.
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
