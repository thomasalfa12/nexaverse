// contracts/NexaCourse.sol
// INI ADALAH VERSI UPGRADEABLE DARI CourseManager ANDA

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NexaCourse is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // --- STATE VARIABLES ---
    uint256 public price;
    uint256 public enrolledCount;
    bool public isActive;
    address public creator;
    address public treasury;
    address public paymentToken; // Tidak lagi immutable, bisa diubah
    uint256 public treasuryFee;
    uint256 public createdAt;
    mapping(address => bool) public isEnrolled;
    mapping(address => uint256) public studentTokenId;
    string private _baseTokenURI;
    uint256 private _nextTokenId;

    // --- EVENTS & ERRORS (TIDAK BERUBAH) ---
    event StudentEnrolled(
        address indexed student,
        uint256 indexed tokenId,
        uint256 pricePaid
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event PaymentTokenUpdated(address oldToken, address newToken);
    event CourseStatusChanged(bool isActive);
    event PaymentDistributed(uint256 treasuryAmount, uint256 creatorAmount);
    event MetadataUpdated(string newBaseURI);

    error CourseInactive();
    error AlreadyEnrolled();
    error InsufficientPayment();
    error TransferFailed();
    error WrongPaymentMethod();
    error Unauthorized();

    // --- MODIFIERS ---
    modifier onlyActiveAndNotEnrolled() {
        if (!isActive) revert CourseInactive();
        if (isEnrolled[msg.sender]) revert AlreadyEnrolled();
        _;
    }
    modifier onlyCreator() {
        if (_msgSender() != creator) revert Unauthorized();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // --- FUNGSI INITIALIZE (PENGGANTI CONSTRUCTOR) ---
    function initialize(
        string memory courseName,
        string memory courseSymbol,
        uint256 _price,
        address _creator,
        address _treasury,
        address _paymentToken,
        uint256 _treasuryFee,
        string memory _baseURI
    ) public initializer {
        __ERC721_init(courseName, courseSymbol);
        __Ownable_init(_creator); // Owner dari kursus adalah kreatornya
        __ReentrancyGuard_init();

        creator = _creator;
        treasury = _treasury;
        paymentToken = _paymentToken;
        treasuryFee = _treasuryFee;
        price = _price;
        createdAt = block.timestamp;
        _baseTokenURI = _baseURI;
        _nextTokenId = 1;
        isActive = true;
    }

    // --- FUNGSI ENROLLMENT (TIDAK BERUBAH) ---
    function enrollWithETH()
        external
        payable
        nonReentrant
        onlyActiveAndNotEnrolled
    {
        if (paymentToken != address(0)) revert WrongPaymentMethod();
        if (price > 0) {
            if (msg.value < price) revert InsufficientPayment();
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
            _distributeFunds(price);
        }
        _enrollStudent(msg.sender);
    }

    function enrollWithToken() external nonReentrant onlyActiveAndNotEnrolled {
        if (paymentToken == address(0)) revert WrongPaymentMethod();
        if (price > 0) {
            IERC20(paymentToken).safeTransferFrom(
                msg.sender,
                address(this),
                price
            );
            _distributeTokens(price);
        }
        _enrollStudent(msg.sender);
    }

    // --- FUNGSI MANAJEMEN (BARU & DIPERBARUI) ---
    function updatePrice(uint256 newPrice) external onlyCreator {
        uint256 oldPrice = price;
        price = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    function updatePaymentToken(address newPaymentToken) external onlyCreator {
        address oldToken = paymentToken;
        paymentToken = newPaymentToken;
        emit PaymentTokenUpdated(oldToken, newPaymentToken);
    }

    function toggleCourseStatus() external onlyCreator {
        isActive = !isActive;
        emit CourseStatusChanged(isActive);
    }

    function setBaseURI(string memory newBaseURI) external onlyCreator {
        _baseTokenURI = newBaseURI;
        emit MetadataUpdated(newBaseURI);
    }

    // --- FUNGSI INTERNAL & VIEW (TIDAK BERUBAH) ---
    // ... (semua fungsi _distribute, _enroll, tokenURI, dll. tidak berubah)
    function _enrollStudent(address student) private {
        isEnrolled[student] = true;
        enrolledCount++;
        uint256 tokenId = _nextTokenId++;
        studentTokenId[student] = tokenId;
        _safeMint(student, tokenId);
        emit StudentEnrolled(student, tokenId, price);
    }

    function _distributeFunds(uint256 totalAmount) private {
        if (totalAmount == 0) return;
        uint256 treasuryAmount = (totalAmount * treasuryFee) / 10000; // Menggunakan basis points
        uint256 creatorAmount = totalAmount - treasuryAmount;
        if (treasuryAmount > 0) {
            (bool s, ) = payable(treasury).call{value: treasuryAmount}("");
            require(s, "Transfer failed");
        }
        if (creatorAmount > 0) {
            (bool s, ) = payable(creator).call{value: creatorAmount}("");
            require(s, "Transfer failed");
        }
        emit PaymentDistributed(treasuryAmount, creatorAmount);
    }

    function _distributeTokens(uint256 totalAmount) private {
        if (totalAmount == 0) return;
        IERC20 token = IERC20(paymentToken);
        uint256 treasuryAmount = (totalAmount * treasuryFee) / 10000; // Menggunakan basis points
        uint256 creatorAmount = totalAmount - treasuryAmount;
        if (treasuryAmount > 0) token.safeTransfer(treasury, treasuryAmount);
        if (creatorAmount > 0) token.safeTransfer(creator, creatorAmount);
        emit PaymentDistributed(treasuryAmount, creatorAmount);
    }

    function getStudentInfo(
        address student
    ) external view returns (bool enrolled, uint256 tokenId) {
        return (isEnrolled[student], studentTokenId[student]);
    }

    // ... (sisa fungsi view dan utility)

    // Variabel untuk memastikan storage layout aman untuk upgrade
    uint256[49] private __gap;
}
