// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CourseManager.sol";

contract CourseFactory is Ownable, ReentrancyGuard {
    // --- STATE VARIABLES (DIRINGKAS) ---
    uint256 public constant MIN_FEE = 3;
    uint256 public constant MAX_FEE = 10;
    address public treasury;
    uint256 public defaultTreasuryFee = 3;
    uint256 public totalCoursesCreated;
    mapping(address => address[]) public creatorCourses;
    mapping(address => bool) public isValidCourse;
    address[] public allCourses;
    mapping(address => uint256) public creatorCourseCount;

    // --- EVENTS ---
    event CourseCreated(address indexed courseContract, address indexed creator, string name, string symbol, uint256 price, address paymentToken, string baseURI);
    event TreasuryFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryAddressUpdated(address indexed oldTreasury, address indexed newTreasury);

    // --- ERRORS ---
    error InvalidTreasuryAddress();
    error InvalidFeePercentage();
    error EmptyCourseName();
    error EmptyCourseSymbol();

    // --- CONSTRUCTOR ---
    constructor(address _treasury, address _owner) Ownable(_owner) {
        if (_treasury == address(0)) revert InvalidTreasuryAddress();
        treasury = _treasury;
    }

    // --- COURSE CREATION (DIREFACTOR) ---
    function createCourse(
        string memory name,
        string memory symbol,
        uint256 price,
        address paymentToken,
        string memory baseURI
    ) external nonReentrant returns (address courseAddress) {
        if (bytes(name).length == 0) revert EmptyCourseName();
        if (bytes(symbol).length == 0) revert EmptyCourseSymbol();
        
        CourseManager newCourse = new CourseManager(
            name,
            symbol,
            price,
            msg.sender,
            treasury,
            paymentToken,
            defaultTreasuryFee,
            baseURI
        );
        courseAddress = address(newCourse);
        
        creatorCourses[msg.sender].push(courseAddress);
        isValidCourse[courseAddress] = true;
        allCourses.push(courseAddress);
        creatorCourseCount[msg.sender]++;
        totalCoursesCreated++;
        
        emit CourseCreated(courseAddress, msg.sender, name, symbol, price, paymentToken, baseURI);
    }

    // --- ADMIN FUNCTIONS ---
    function updateTreasuryFee(uint256 newFee) external onlyOwner {
        if (newFee < MIN_FEE || newFee > MAX_FEE) revert InvalidFeePercentage();
        uint256 oldFee = defaultTreasuryFee;
        defaultTreasuryFee = newFee;
        emit TreasuryFeeUpdated(oldFee, newFee);
    }

    function updateTreasuryAddress(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasuryAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryAddressUpdated(oldTreasury, newTreasury);
    }

    // --- VIEW FUNCTIONS ---
    function getCreatorCourses(address creator) external view returns (address[] memory) { return creatorCourses[creator]; }
    function getAllCourses() external view returns (address[] memory) { return allCourses; }
    function getCoursesPaginated(uint256 startIndex, uint256 endIndex) external view returns (address[] memory) {
        require(startIndex < endIndex && endIndex <= allCourses.length, "Invalid range");
        uint256 length = endIndex - startIndex;
        address[] memory courses = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            courses[i] = allCourses[startIndex + i];
        }
        return courses;
    }
}