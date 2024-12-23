// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract NotificationsAndSecurity {
    address public owner;
    
    // Events for notifications
    event TransactionAlert(address indexed user, string message, uint256 timestamp);
    event PaymentAlert(address indexed payer, address indexed payee, uint256 amount, uint256 timestamp);
    event EnergyUsageAlert(address indexed user, uint256 energyUsed, uint256 timestamp);
    event DisputeInitiated(address indexed initiator, address indexed respondent, string reason, uint256 timestamp);
    event DisputeResolved(uint256 indexed disputeId, string resolutionDetails, uint256 timestamp);
    event AuditLog(address indexed auditor, string report, uint256 timestamp);

    // Data structures
    struct Dispute {
        address initiator;
        address respondent;
        string reason;
        string resolutionDetails;
        bool resolved;
        uint256 timestamp;
    }

    Dispute[] public disputes;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Notifications
    function sendTransactionAlert(address user, string memory message) public onlyOwner {
        emit TransactionAlert(user, message, block.timestamp);
    }

    function sendPaymentAlert(address payer, address payee, uint256 amount) public onlyOwner {
        emit PaymentAlert(payer, payee, amount, block.timestamp);
    }

    function sendEnergyUsageAlert(address user, uint256 energyUsed) public onlyOwner {
        emit EnergyUsageAlert(user, energyUsed, block.timestamp);
    }

    // Dispute resolution
    function initiateDispute(address respondent, string memory reason) public {
        disputes.push(Dispute({
            initiator: msg.sender,
            respondent: respondent,
            reason: reason,
            resolutionDetails: "",
            resolved: false,
            timestamp: block.timestamp
        }));
        emit DisputeInitiated(msg.sender, respondent, reason, block.timestamp);
    }

    function resolveDispute(uint256 disputeId, string memory resolutionDetails) public onlyOwner {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolutionDetails = resolutionDetails;
        dispute.resolved = true;

        emit DisputeResolved(disputeId, resolutionDetails, block.timestamp);
    }

    // Auditing and compliance
    function logAudit(string memory report) public onlyOwner {
        emit AuditLog(msg.sender, report, block.timestamp);
    }

    // Getter for disputes
    function getDispute(uint256 disputeId) public view returns (Dispute memory) {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        return disputes[disputeId];
    }

    // Security features: Ownership transfer
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
}
