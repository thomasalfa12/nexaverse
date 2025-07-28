// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserSBT.sol";
import "./interfaces/ISBTRegistry.sol";

contract UserSBTFactory is Ownable {
    // Alamat dari Registry utama kita, ditetapkan saat deploy
    IISBTRegistry public immutable registry;

    // Daftar semua kontrak UserSBT yang telah dibuat untuk pelacakan
    address[] public allSbtContracts;

    // Event yang akan didengarkan oleh frontend untuk mendapatkan alamat kontrak baru
    event SBTContractCreated(
        address indexed newContractAddress,
        address indexed owner, // Pemilik dari kontrak baru (kreator)
        string name,
        string symbol
    );

    /**
     * @dev Modifier untuk memastikan hanya alamat yang terverifikasi di registry
     * yang dapat memanggil fungsi.
     */
    modifier onlyVerifiedEntity() {
        require(
            registry.isVerifiedEntity(msg.sender),
            "Factory: Caller is not a verified entity"
        );
        _;
    }

    /**
     * @param _registryAddress Alamat dari kontrak ISBTRegistry yang sudah di-deploy.
     * @param initialOwner Alamat yang akan menjadi pemilik Pabrik ini (misalnya, deployer awal).
     */
    constructor(address _registryAddress, address initialOwner) Ownable(initialOwner) {
        require(_registryAddress != address(0), "Factory: Registry address cannot be zero");
        registry = IISBTRegistry(_registryAddress);
    }

    function createSbtContract(
        string memory name,
        string memory symbol
    ) external onlyVerifiedEntity returns (address newSbtAddress) {
        // PERUBAHAN KUNCI: Parameter `credentialOwner` dihapus.
        // `msg.sender` (kreator yang memanggil) secara otomatis menjadi pemilik.
        address credentialOwner = msg.sender;

        // Deploy instance baru dari UserSBT
        UserSBT newUserSbt = new UserSBT(
            address(registry),
            name,
            symbol,
            credentialOwner // `credentialOwner` (yaitu msg.sender) menjadi pemilik dari kontrak UserSBT
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