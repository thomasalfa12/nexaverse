// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MerkleClaimSBT.sol";
// REFACTOR: Tambahkan impor untuk ISBTRegistry
import "./interfaces/ISBTRegistry.sol";

contract MerkleClaimSBTFactory is Ownable {
    // REFACTOR: Tambahkan variabel untuk registry
    IISBTRegistry public immutable registry;
    address[] public allMerkleContracts;

    event MerkleClaimSBTCreated(
        address indexed newContractAddress,
        address indexed owner,
        string name,
        bytes32 merkleRoot
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

    // REFACTOR: Ubah constructor untuk menerima alamat registry
    constructor(address _registryAddress, address initialOwner) Ownable(initialOwner) {
        require(_registryAddress != address(0), "Factory: Registry address cannot be zero");
        registry = IISBTRegistry(_registryAddress);
    }

    /**
     * @notice Fungsi untuk membuat dan men-deploy instance baru dari MerkleClaimSBT.
     * @dev PERUBAHAN KUNCI: Sekarang bisa dipanggil oleh kreator terverifikasi mana pun.
     * Kreator yang memanggil (`msg.sender`) akan membayar gas dan menjadi pemilik kontrak baru.
     * @param name Nama untuk koleksi SBT baru.
     * @param symbol Simbol untuk koleksi SBT baru.
     * @param merkleRoot Akar dari Merkle Tree untuk verifikasi klaim.
     * @param metadataURI URI ke metadata JSON untuk semua token.
     * @return newContractAddress Alamat dari kontrak MerkleClaimSBT yang baru.
     */
    function createMerkleClaimSBT(
        string memory name,
        string memory symbol,
        bytes32 merkleRoot,
        string memory metadataURI
    ) external onlyVerifiedEntity returns (address newContractAddress) {
        // PERUBAHAN KUNCI: `credentialOwner` dihapus dari argumen dan
        // secara otomatis diatur ke `msg.sender`.
        address credentialOwner = msg.sender;

        MerkleClaimSBT newContract = new MerkleClaimSBT(
            name,
            symbol,
            credentialOwner,
            merkleRoot,
            metadataURI
        );

        newContractAddress = address(newContract);
        allMerkleContracts.push(newContractAddress);

        emit MerkleClaimSBTCreated(newContractAddress, credentialOwner, name, merkleRoot);
    }
}