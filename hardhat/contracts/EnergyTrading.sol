// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";
import {EnergyMonitoring} from "./EnergyMonitoring.sol";
import {NotificationsAndSecurity} from "./NotificationsAndSecurity.sol";
import {UserManagement} from "./UserManagement.sol";

contract EnergyTrading {
    struct EnergyListing {
        address producer;
        uint256 amount;
        uint256 price;
        bool active;
    }

    uint256 public dynamicPrice;
    IEnergy public token;
    EnergyMonitoring public energyMonitoring;
    NotificationsAndSecurity public notificationsAndSecurity;
    UserManagement public userManagement;

    bool internal locked;
    address public owner;

    mapping(address => EnergyListing) public energyListings;
    mapping(address => uint256) public customerDemand;

    event EnergyListed(address indexed producer, uint256 amount, uint256 price);

    event EnergyBought(
        address indexed producer,
        address indexed consumer,
        uint256 amount,
        uint256 price
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event DisputeInitiated(
        address indexed initiator,
        address indexed respondent,
        string reason
    );
    event DisputeResolved(uint256 indexed disputeId, string resolutionDetails);

    modifier noReentrancyGuard() {
        require(!locked, "Reentrancy is not allowed");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyRegisteredProducer() {
        require(
            userManagement.isRegistered(msg.sender),
            "User is not registered"
        );
        require(
            userManagement.getUserType(msg.sender) ==
                UserManagement.UserType.Producer,
            "Only producers can perform this action"
        );
        _;
    }

    modifier onlyRegisteredConsumer() {
        require(
            userManagement.isRegistered(msg.sender),
            "User is not registered"
        );
        require(
            userManagement.getUserType(msg.sender) ==
                UserManagement.UserType.Consumer,
            "Only consumers can perform this action"
        );
        _;
    }

    constructor(
        uint256 initialPrice,
        address _token,
        address _energyMonitoring,
        address _notificationsAndSecurity,
        address _userManagement
    ) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);
        energyMonitoring = EnergyMonitoring(_energyMonitoring);
        notificationsAndSecurity = NotificationsAndSecurity(
            _notificationsAndSecurity
        );
        userManagement = UserManagement(_userManagement);

        owner = msg.sender;
    }

    /**
     * @dev Update the dynamic price based on supply and demand.
     * Fetch total production and consumption from EnergyMonitoring.
     */

    function updatePrice() public onlyOwner {
        uint256 totalSupply = energyMonitoring.totalProduced(owner);
        uint256 totalDemand = energyMonitoring.totalConsumed(owner);

        require(totalSupply > 0, "Supply must be greater than zero");
        require(totalDemand > 0, "Demand must be greater than zero");

        uint256 oldPrice = dynamicPrice;
        dynamicPrice = (totalDemand * oldPrice) / totalSupply;

        emit PriceUpdated(oldPrice, dynamicPrice);
    }

    /**
     * @dev List energy for sale.
     * Also records production in the EnergyMonitoring contract.
     */
    function listEnergy(
        uint256 amount,
        EnergyMonitoring.EnergyType energyType
    ) public noReentrancyGuard onlyRegisteredProducer {
        require(amount > 0, "Amount must be greater than zero");
        require(
            energyListings[msg.sender].active == false,
            "Existing listing must be inactive"
        );

        // Record production.
        energyMonitoring.recordProduction(msg.sender, amount, energyType);

        energyListings[msg.sender] = EnergyListing({
            producer: msg.sender,
            amount: amount,
            price: dynamicPrice,
            active: true
        });

        emit EnergyListed(msg.sender, amount, dynamicPrice);
        notificationsAndSecurity.sendTransactionAlert(
            msg.sender,
            "Energy listed successfully"
        );
    }

    /**
     * @dev Buy energy from a producer.
     * Records consumption in the EnergyMonitoring contract.
     */
    function buyEnergy(
        address producer,
        uint256 amount
    ) public noReentrancyGuard {
        EnergyListing storage listing = energyListings[producer];

        require(listing.active, "Energy is not available for sale");
        require(
            listing.amount >= amount,
            "Producer does not have enough surplus"
        );
        require(
            customerDemand[msg.sender] >= amount,
            "Consumer demand is insufficient"
        );

        uint256 totalCost = amount * listing.price;
        require(
            token.allowance(msg.sender, address(this)) >= totalCost,
            "Allowance insufficient"
        );
        require(
            token.balanceOf(msg.sender) >= totalCost,
            "Insufficient token balance"
        );

        token.transferFrom(msg.sender, producer, totalCost);
        require(token.approve(producer, totalCost), "Approval failed");

        uint256 fee = (totalCost * 1) / 100;
        token.transferFrom(producer, owner, fee);

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        customerDemand[msg.sender] -= amount;

        energyMonitoring.recordConsumption(msg.sender, amount);

        emit EnergyBought(producer, msg.sender, amount, listing.price);

        notificationsAndSecurity.sendPaymentAlert(
            msg.sender,
            producer,
            totalCost
        );
    }

    function initiateDispute(address respondent, string memory reason) public {
        notificationsAndSecurity.initiateDispute(respondent, reason);
        emit DisputeInitiated(msg.sender, respondent, reason);
    }

    function resolveDispute(
        uint256 disputeId,
        string memory resolutionDetails
    ) public onlyOwner {
        notificationsAndSecurity.resolveDispute(disputeId, resolutionDetails);
        emit DisputeResolved(disputeId, resolutionDetails);
    }

    /**
     * @dev Retrieves all energy records for a user from the EnergyMonitoring contract.
     * @param user address.
     */
    function fetchRecords(
        address user
    ) public view returns (EnergyMonitoring.EnergyRecord[] memory) {
        return energyMonitoring.getRecords(user);
    }

    function resetUserData(address user) public onlyOwner {
        energyMonitoring.resetData(user);
    }

    /**
     * @dev Retrieves all records stored in EnergyMonitoring.
     */

    function fetchAllRecords()
        public
        view
        returns (EnergyMonitoring.EnergyRecord[] memory)
    {
        return energyMonitoring.getAllRecords();
    }

    function getUserProfile(
        address userAddress
    ) external view returns (UserManagement.UserProfile memory) {
        return userManagement.getUserProfile(userAddress);
    }

    function isRegistered(address userAddress) external view returns (bool) {
        return userManagement.isRegistered(userAddress);
    }

    function getUserType(
        address userAddress
    ) external view returns (UserManagement.UserType) {
        return userManagement.getUserType(userAddress);
    }

    function updatePreferences(string memory newPreferences) external {
        userManagement.updatePreferences(newPreferences);
    }

    function getAllUsers() external view returns (address[] memory) {
        return userManagement.getAllUsers();
    }
}
