// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CourseManager is ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- STATE VARIABLES (DIRINGKAS) ---
    uint256 public price;
    uint256 public enrolledCount;
    bool public isActive = true;
    address public immutable creator;
    address public immutable treasury;
    address public immutable paymentToken;
    uint256 public immutable treasuryFee;
    uint256 public immutable createdAt;
    mapping(address => bool) public isEnrolled;
    mapping(address => uint256) public studentTokenId;
    string private _baseTokenURI;
    uint256 private _nextTokenId = 1;

    // --- EVENTS ---
    event StudentEnrolled(address indexed student, uint256 indexed tokenId, uint256 pricePaid);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event CourseStatusChanged(bool isActive);
    event PaymentDistributed(uint256 treasuryAmount, uint256 creatorAmount);
    event MetadataUpdated(string newBaseURI);

    // --- ERRORS ---
    error CourseInactive();
    error AlreadyEnrolled();
    error InsufficientPayment();
    error TransferFailed();
    error WrongPaymentMethod();

    // --- MODIFIERS ---
    modifier onlyActiveAndNotEnrolled() {
        if (!isActive) revert CourseInactive();
        if (isEnrolled[msg.sender]) revert AlreadyEnrolled();
        _;
    }
    modifier onlyCreator() {
        if (msg.sender != creator) revert("Unauthorized");
        _;
    }

    // --- CONSTRUCTOR (DIREFACTOR) ---
    constructor(
        string memory courseName,
        string memory courseSymbol,
        uint256 _price,
        address _creator,
        address _treasury,
        address _paymentToken,
        uint256 _treasuryFee,
        string memory _baseURI
    ) ERC721(courseName, courseSymbol) Ownable(_treasury) {
        creator = _creator;
        treasury = _treasury;
        paymentToken = _paymentToken;
        treasuryFee = _treasuryFee;
        price = _price;
        createdAt = block.timestamp;
        _baseTokenURI = _baseURI;
    }

    // --- ENROLLMENT FUNCTIONS ---
    function enrollWithETH() external payable nonReentrant onlyActiveAndNotEnrolled {
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
            IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), price);
            _distributeTokens(price);
        }
        _enrollStudent(msg.sender);
    }

    // --- INTERNAL FUNCTIONS ---
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
        uint256 treasuryAmount = (totalAmount * treasuryFee) / 100;
        uint256 creatorAmount = totalAmount - treasuryAmount;
        if (treasuryAmount > 0) {
            (bool s1, ) = payable(treasury).call{value: treasuryAmount}("");
            if (!s1) revert TransferFailed();
        }
        if (creatorAmount > 0) {
            (bool s2, ) = payable(creator).call{value: creatorAmount}("");
            if (!s2) revert TransferFailed();
        }
        emit PaymentDistributed(treasuryAmount, creatorAmount);
    }

    function _distributeTokens(uint256 totalAmount) private {
        if (totalAmount == 0) return;
        IERC20 token = IERC20(paymentToken);
        uint256 treasuryAmount = (totalAmount * treasuryFee) / 100;
        uint256 creatorAmount = totalAmount - treasuryAmount;
        if (treasuryAmount > 0) token.safeTransfer(treasury, treasuryAmount);
        if (creatorAmount > 0) token.safeTransfer(creator, creatorAmount);
        emit PaymentDistributed(treasuryAmount, creatorAmount);
    }

    // --- CREATOR FUNCTIONS ---
    function updatePrice(uint256 newPrice) external onlyCreator {
        uint256 oldPrice = price;
        price = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    function toggleCourseStatus() external onlyCreator {
        isActive = !isActive;
        emit CourseStatusChanged(isActive);
    }

    function setBaseURI(string memory newBaseURI) external onlyCreator {
        _baseTokenURI = newBaseURI;
        emit MetadataUpdated(newBaseURI);
    }

    // --- VIEW FUNCTIONS ---
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(_baseTokenURI).length > 0 
            ? string(abi.encodePacked(_baseTokenURI, _toString(tokenId), ".json"))
            : "";
    }

    function baseURI() external view returns (string memory) { return _baseTokenURI; }
    
    function getStudentInfo(address student) external view returns (bool enrolled, uint256 tokenId) {
        return (isEnrolled[student], studentTokenId[student]);
    }

    // --- SOULBOUND & UTILITY ---
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert("Certificate is non-transferable");
        return super._update(to, tokenId, auth);
    }
    
    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }
}