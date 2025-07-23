// File: contracts/UserSBTFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserSBT.sol";
import "./interfaces/ISBTRegistry.sol";

/**
 * @title UserSBTFactory
 * @author Nexaverse (Arsitektur oleh Gemini)
 * @notice Kontrak ini berfungsi sebagai "pabrik" terpusat untuk men-deploy
 * instance baru dari kontrak UserSBT.
 *
 * --- Pola Arsitektur: Operator Terpercaya ---
 * 1.  Kontrak ini `Ownable`, dan pemiliknya (`owner`) adalah wallet server backend.
 * 2.  Hanya `owner` (server) yang dapat memanggil fungsi `createSbtContract`.
 * 3.  Saat dipanggil, fungsi ini men-deploy kontrak UserSBT baru, tetapi
 * menetapkan kepemilikan (`owner`) dari kontrak baru tersebut kepada
 * `credentialOwner` (kreator/komunitas), bukan kepada server.
 * Ini memastikan kedaulatan penuh bagi kreator atas kredensial mereka.
 */
contract UserSBTFactory is Ownable {
    // Alamat dari Registry utama kita, ditetapkan saat deploy
    IISBTRegistry public immutable registry;

    // Daftar semua kontrak UserSBT yang telah dibuat untuk pelacakan
    address[] public allSbtContracts;

    // Event yang akan didengarkan oleh backend (baik listener maupun Server Action)
    event SBTContractCreated(
        address indexed newContractAddress,
        address indexed owner, // Pemilik dari kontrak baru (kreator)
        string name,
        string symbol
    );

    /**
     * @param _registryAddress Alamat dari kontrak ISBTRegistry yang sudah di-deploy.
     * @param initialOwner Alamat yang akan menjadi pemilik Pabrik ini (wallet server).
     */
    constructor(address _registryAddress, address initialOwner) Ownable(initialOwner) {
        registry = IISBTRegistry(_registryAddress);
    }

    /**
     * @notice Fungsi untuk membuat dan men-deploy instance baru dari UserSBT.
     * @dev HANYA BISA DIPANGGIL OLEH OWNER (wallet server).
     * @param name Nama untuk koleksi SBT baru (misal, "Sertifikat Webinar Solidity").
     * @param symbol Simbol untuk koleksi SBT baru (misal, "NEXA-SOL-ADV").
     * @param credentialOwner Alamat pengguna/kreator yang akan menjadi pemilik dari kontrak baru.
     * @return newSbtAddress Alamat dari kontrak UserSBT yang baru saja dibuat.
     */
    function createSbtContract(
        string memory name,
        string memory symbol,
        address credentialOwner
    ) external onlyOwner returns (address newSbtAddress) {
        // Keamanan: Pastikan target pemilik adalah entitas yang terverifikasi di Registry
        require(registry.isVerifiedEntity(credentialOwner), "Factory: Target owner is not a verified entity");

        // Deploy instance baru dari UserSBT
        UserSBT newUserSbt = new UserSBT(
            address(registry),
            name,
            symbol,
            credentialOwner // `credentialOwner` menjadi pemilik dari kontrak UserSBT yang baru
        );

        newSbtAddress = address(newUserSbt);
        allSbtContracts.push(newSbtAddress);

        emit SBTContractCreated(newSbtAddress, credentialOwner, name, symbol);
    }

    /**
     * @notice Fungsi view untuk mendapatkan jumlah total kontrak yang telah dibuat.
     */
    function getSbtContractsCount() external view returns (uint256) {
        return allSbtContracts.length;
    }
}