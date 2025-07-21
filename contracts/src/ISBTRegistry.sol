// File: contracts/ISBTRegistry.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ISBTRegistry is Ownable {
    // REFACTOR: Enum diperluas untuk mencakup target baru kita.
    // Ini membuat kontrak lebih relevan dengan visi jangka panjang.
    enum EntityType {
        UNSET,          // 0
        INSTITUTION,    // 1 (Universitas, Sekolah, Perusahaan)
        CREATOR,        // 2 (Individu, Pengajar)
        COMMUNITY,      // 3 (Guild, Grup Online)
        DAO             // 4
    }

    // REFACTOR: Struct diganti nama menjadi "Entity" dan disederhanakan.
    struct Entity {
        string name;
        string primaryUrl; // Lebih generik daripada "officialWebsite"
        string contactEmail;
        EntityType entityType;
        address walletAddress;
        bool isRegistered;
        uint256 registrationDate;
    }

    mapping(address => Entity) public entities;

    event EntityRegistered(
        address indexed walletAddress,
        string name,
        EntityType entityType
    );
    event EntityRemoved(address indexed walletAddress);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // REFACTOR: Fungsi diganti nama dan parameternya disesuaikan.
    function registerEntity(
        address _walletAddress,
        string calldata _name,
        string calldata _primaryUrl,
        string calldata _email,
        EntityType _entityType
    ) external onlyOwner {
        require(_walletAddress != address(0), "Invalid wallet address");
        require(!entities[_walletAddress].isRegistered, "Entity already registered");

        entities[_walletAddress] = Entity({
            name: _name,
            primaryUrl: _primaryUrl,
            contactEmail: _email,
            entityType: _entityType,
            walletAddress: _walletAddress,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        emit EntityRegistered(_walletAddress, _name, _entityType);
    }
    
    function removeEntity(address _walletAddress) external onlyOwner {
        require(entities[_walletAddress].isRegistered, "Entity not registered");
        delete entities[_walletAddress];
        emit EntityRemoved(_walletAddress);
    }

    // REFACTOR: Nama fungsi diperbarui untuk konsistensi.
    function isVerifiedEntity(address _wallet) external view returns (bool) {
        return entities[_wallet].isRegistered;
    }
    
    function getEntityDetails(address _wallet) external view returns (Entity memory) {
        require(entities[_wallet].isRegistered, "Entity not registered");
        return entities[_wallet];
    }
}