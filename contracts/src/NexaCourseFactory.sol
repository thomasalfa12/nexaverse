// contracts/NexaCourseFactory.sol
// PABRIK BARU YANG MEN-DEPLOY PROXY MURAH

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NexaCourse.sol"; // Impor kontrak logika

contract NexaCourseFactory is Ownable {
    address public implementation; // Alamat kontrak logika NexaCourse
    address public treasury;
    uint256 public treasuryFee; // Basis points, misal: 300 = 3%

    event CourseCreated(
        address indexed courseContract, // Alamat proxy yang baru
        address indexed creator,
        string name,
        string symbol
    );
    event ImplementationUpdated(address indexed newImplementation);
    event TreasuryUpdated(address indexed newTreasury);
    event FeeUpdated(uint256 newFee);

    constructor(
        address _initialOwner,
        address _implementation,
        address _treasury,
        uint256 _fee
    ) Ownable(_initialOwner) {
        require(
            _implementation != address(0),
            "Factory: Invalid implementation"
        );
        require(_treasury != address(0), "Factory: Invalid treasury");
        implementation = _implementation;
        treasury = _treasury;
        treasuryFee = _fee;
    }

    function createCourse(
        string memory name,
        string memory symbol,
        uint256 price,
        address paymentToken,
        string memory baseURI
    ) external returns (address) {
        // 1. Deploy proxy yang sangat murah menggunakan Clones library dari OpenZeppelin
        address proxy = Clones.clone(implementation);

        // 2. Panggil fungsi `initialize` pada proxy yang baru dibuat untuk mengatur state awalnya
        NexaCourse(proxy).initialize(
            name,
            symbol,
            price,
            msg.sender, // Creator adalah yang memanggil fungsi ini
            treasury,
            paymentToken,
            treasuryFee,
            baseURI
        );

        // 3. Emit event dengan alamat proxy yang baru agar backend bisa mencatatnya
        emit CourseCreated(proxy, msg.sender, name, symbol);
        return proxy;
    }

    // --- FUNGSI ADMINISTRATIF (Hanya bisa dipanggil oleh Owner/Treasury Multi-sig) ---

    /**
     * @dev Meng-upgrade semua kursus di masa depan ke versi logika baru.
     * Ini adalah kekuatan utama dari arsitektur proxy.
     */
    function updateImplementation(
        address _newImplementation
    ) external onlyOwner {
        require(
            _newImplementation != address(0),
            "Factory: Invalid implementation"
        );
        implementation = _newImplementation;
        emit ImplementationUpdated(_newImplementation);
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Factory: Invalid treasury");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    function setTreasuryFee(uint256 _newFee) external onlyOwner {
        // Anda bisa menambahkan validasi batas maksimal fee di sini
        treasuryFee = _newFee;
        emit FeeUpdated(_newFee);
    }
}
