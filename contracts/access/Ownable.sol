// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NexaverseTreasury is ReentrancyGuard, Pausable {
    // --- MULTI-SIGNATURE CONFIGURATION ---
    struct Transaction {
        address to;
        uint256 amount;
        address token; // address(0) for ETH
        bool executed;
        uint256 confirmations;
        uint256 timestamp;
    }
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredConfirmations;
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public hasConfirmed;
    
    // --- Emergency settings ---
    uint256 public dailyWithdrawLimit;
    mapping(uint256 => uint256) public dailyWithdrawn;
    uint256 constant SECONDS_PER_DAY = 86400;
    
    // --- Events ---
    event TransactionProposed(uint256 indexed txId, address indexed proposer, address to, uint256 amount, address token);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionRevoked(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);
    event OwnerAdded(address indexed newOwner);
    event OwnerRemoved(address indexed removedOwner);
    event RequirementChanged(uint256 newRequirement);
    event DailyLimitChanged(uint256 newLimit);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    // --- MODIFIERS ---
    modifier onlyOwner() { require(isOwner[msg.sender], "Treasury: not an owner"); _; }
    modifier transactionExists(uint256 txId) { require(txId < transactions.length, "Treasury: transaction does not exist"); _; }
    modifier notExecuted(uint256 txId) { require(!transactions[txId].executed, "Treasury: transaction already executed"); _; }
    modifier notConfirmed(uint256 txId) { require(!hasConfirmed[txId][msg.sender], "Treasury: transaction already confirmed"); _; }

    // --- CONSTRUCTOR ---
    constructor(address[] memory _owners, uint256 _requiredConfirmations, uint256 _dailyLimit) {
        require(_owners.length > 0, "Treasury: owners required");
        require(_requiredConfirmations > 0 && _requiredConfirmations <= _owners.length, "Treasury: invalid required confirmations");
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0) && !isOwner[owner], "Treasury: invalid or duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }
        requiredConfirmations = _requiredConfirmations;
        dailyWithdrawLimit = _dailyLimit;
    }

    // --- RECEIVE FUNCTIONS ---
    receive() external payable {}
    function receiveTokens(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    // --- TRANSACTION MANAGEMENT ---
    function proposeTransaction(address _to, uint256 _amount, address _token) external onlyOwner whenNotPaused returns (uint256 txId) {
        require(_to != address(0), "Treasury: invalid recipient");
        require(_amount > 0, "Treasury: invalid amount");
        if (_token == address(0)) {
            require(address(this).balance >= _amount, "Treasury: insufficient ETH balance");
        } else {
            require(IERC20(_token).balanceOf(address(this)) >= _amount, "Treasury: insufficient token balance");
        }
        txId = transactions.length;
        transactions.push(Transaction({
            to: _to,
            amount: _amount,
            token: _token,
            executed: false,
            confirmations: 0,
            timestamp: block.timestamp
        }));
        emit TransactionProposed(txId, msg.sender, _to, _amount, _token);
        confirmTransaction(txId);
    }
    
    function confirmTransaction(uint256 txId) public onlyOwner transactionExists(txId) notExecuted(txId) notConfirmed(txId) whenNotPaused {
        hasConfirmed[txId][msg.sender] = true;
        transactions[txId].confirmations++;
        emit TransactionConfirmed(txId, msg.sender);
        if (transactions[txId].confirmations >= requiredConfirmations) {
            executeTransaction(txId);
        }
    }
    
    function revokeConfirmation(uint256 txId) external onlyOwner transactionExists(txId) notExecuted(txId) {
        require(hasConfirmed[txId][msg.sender], "Treasury: transaction not confirmed");
        hasConfirmed[txId][msg.sender] = false;
        transactions[txId].confirmations--;
        emit TransactionRevoked(txId, msg.sender);
    }
    
    function executeTransaction(uint256 txId) public nonReentrant transactionExists(txId) notExecuted(txId) whenNotPaused {
        Transaction storage txn = transactions[txId];
        require(txn.confirmations >= requiredConfirmations, "Treasury: insufficient confirmations");
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        if (txn.amount > dailyWithdrawLimit) {
            require(dailyWithdrawn[today] + txn.amount <= dailyWithdrawLimit * 5, "Treasury: exceeds daily emergency limit");
        }
        txn.executed = true;
        dailyWithdrawn[today] += txn.amount;
        if (txn.token == address(0)) {
            (bool success, ) = txn.to.call{value: txn.amount}("");
            require(success, "Treasury: ETH transfer failed");
        } else {
            IERC20(txn.token).transfer(txn.to, txn.amount);
        }
        emit TransactionExecuted(txId, msg.sender);
    }

    // --- EMERGENCY FUNCTIONS ---
    function emergencyWithdraw(address payable _to, uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= dailyWithdrawLimit, "Treasury: exceeds daily limit");
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        require(dailyWithdrawn[today] + _amount <= dailyWithdrawLimit, "Treasury: daily limit exceeded");
        dailyWithdrawn[today] += _amount;
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Treasury: emergency withdrawal failed");
        emit EmergencyWithdrawal(_to, _amount);
    }
    
    function pause() public onlyOwner { _pause(); }
    function unpause() public onlyOwner { _unpause(); }

    // --- OWNER MANAGEMENT ---
    function addOwner(address _owner) external {
        require(isOwner[msg.sender], "Treasury: not an owner");
        require(_owner != address(0) && !isOwner[_owner], "Treasury: invalid or existing owner");
        isOwner[_owner] = true;
        owners.push(_owner);
        emit OwnerAdded(_owner);
    }
    
    function removeOwner(address _owner) external {
        require(isOwner[msg.sender], "Treasury: not an owner");
        require(isOwner[_owner], "Treasury: not an owner");
        require(owners.length > requiredConfirmations, "Treasury: cannot remove owner");
        isOwner[_owner] = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        emit OwnerRemoved(_owner);
    }
    
    function changeRequirement(uint256 _requiredConfirmations) external onlyOwner {
        require(_requiredConfirmations > 0 && _requiredConfirmations <= owners.length, "Treasury: invalid required confirmations");
        requiredConfirmations = _requiredConfirmations;
        emit RequirementChanged(_requiredConfirmations);
    }
    
    function setDailyLimit(uint256 _limit) external onlyOwner {
        dailyWithdrawLimit = _limit;
        emit DailyLimitChanged(_limit);
    }

    // --- VIEW FUNCTIONS ---
    function getBalance() external view returns (uint256) { return address(this).balance; }
    function getTokenBalance(address token) external view returns (uint256) { return IERC20(token).balanceOf(address(this)); }
    function getTransactionCount() external view returns (uint256) { return transactions.length; }
    function getOwners() external view returns (address[] memory) { return owners; }
    function getTransaction(uint256 txId) external view returns (address, uint256, address, bool, uint256, uint256) {
        Transaction storage txn = transactions[txId];
        return (txn.to, txn.amount, txn.token, txn.executed, txn.confirmations, txn.timestamp);
    }
    function isConfirmed(uint256 txId, address owner) external view returns (bool) { return hasConfirmed[txId][owner]; }
    function getTodayWithdrawn() external view returns (uint256) { return dailyWithdrawn[block.timestamp / SECONDS_PER_DAY]; }
}