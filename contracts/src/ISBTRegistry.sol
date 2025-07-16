// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ISBTRegistry
 * @dev Kontrak ini berfungsi sebagai database terpusat untuk mendaftarkan
 * dan memverifikasi institusi yang berpartisipasi dalam ekosistem SBT.
 * Pendaftaran dikontrol oleh pemilik kontrak (owner) untuk memastikan
 * semua institusi yang terdaftar adalah sah.
 */
contract ISBTRegistry is Ownable {

    // Enum untuk mempermudah kategorisasi jenis institusi
    enum InstitutionType {
        UNSET,          // 0
        UNIVERSITAS,    // 1
        SEKOLAH,        // 2
        PEMERINTAH,     // 3
        PERUSAHAAN,     // 4
        LAINNYA         // 5
    }

    // Struct untuk menyimpan semua data terkait satu institusi
    struct Institution {
        string name;
        string officialWebsite;
        string contactEmail;
        InstitutionType institutionType;
        address walletAddress; // Alamat wallet resmi institusi
        bool isRegistered;     // Status terdaftar
        uint256 registrationDate; // Waktu pendaftaran
    }

    // Mapping dari alamat wallet ke data institusi
    mapping(address => Institution) public institutions;

    // Event untuk mencatat pendaftaran institusi baru
    event InstitutionRegistered(
        address indexed walletAddress,
        string name,
        InstitutionType institutionType,
        uint256 registrationDate
    );
    
    // Event untuk menghapus pendaftaran institusi
    event InstitutionRemoved(address indexed walletAddress);

    // Modifier untuk memastikan hanya institusi terdaftar yang bisa berinteraksi
    modifier onlyRegistered(address _wallet) {
        require(institutions[_wallet].isRegistered, "Institusi tidak terdaftar");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Fungsi untuk mendaftarkan institusi baru.
     * HANYA BISA DIPANGGIL OLEH OWNER.
     * Owner harus memverifikasi data institusi secara off-chain terlebih dahulu.
     * @param _walletAddress Alamat wallet Ethereum resmi institusi.
     * @param _name Nama resmi institusi.
     * @param _website Website resmi institusi.
     * @param _email Email kontak admin institusi.
     * @param _instType Jenis institusi (Universitas, Pemerintah, dll).
     */
    function registerInstitution(
        address _walletAddress,
        string calldata _name,
        string calldata _website,
        string calldata _email,
        InstitutionType _instType
    ) external onlyOwner {
        require(_walletAddress != address(0), "Alamat wallet tidak valid");
        require(!institutions[_walletAddress].isRegistered, "Institusi sudah terdaftar");

        institutions[_walletAddress] = Institution({
            name: _name,
            officialWebsite: _website,
            contactEmail: _email,
            institutionType: _instType,
            walletAddress: _walletAddress,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        emit InstitutionRegistered(_walletAddress, _name, _instType, block.timestamp);
    }
    
    /**
     * @dev Fungsi untuk menghapus institusi dari registry.
     * HANYA BISA DIPANGGIL OLEH OWNER.
     */
    function removeInstitution(address _walletAddress) external onlyOwner {
        require(institutions[_walletAddress].isRegistered, "Institusi tidak terdaftar");
        delete institutions[_walletAddress];
        emit InstitutionRemoved(_walletAddress);
    }

    /**
     * @dev Fungsi view untuk memeriksa apakah sebuah alamat terdaftar sebagai institusi.
     * Fungsi ini yang akan dipanggil oleh kontrak lain seperti `InstitutionSBT`.
     */
    function isRegisteredInstitution(address _wallet) external view returns (bool) {
        return institutions[_wallet].isRegistered;
    }
    
    /**
     * @dev Fungsi untuk mendapatkan data detail sebuah institusi.
     */
    function getInstitutionDetails(address _wallet) external view returns (Institution memory) {
        require(institutions[_wallet].isRegistered, "Institusi tidak terdaftar");
        return institutions[_wallet];
    }
}