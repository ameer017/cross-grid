// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";

contract EnergyResource {
    uint256 public dynamicPrice;
    IEnergy public token;

    enum UserType {
        None,
        Producer,
        Consumer
    }

    enum EnergyType {
        Solar,
        Wind,
        Biomass,
        Tidal
    }

    struct EnergyRecord {
        uint256 produced;
        uint256 consumed;
        uint256 timestamp;
        EnergyType energyType;
    }

    struct EnergyListing {
        address producer;
        uint256 amount;
        uint256 price;
        EnergyType energyType;
        bool active;
    }

    struct User {
        UserType userType;
        bool registered;
    }

    struct Dispute {
        address initiator;
        address respondent;
        string reason;
        string resolutionDetails;
        bool resolved;
        uint256 timestamp;
    }

    Dispute[] public disputes;

    bool internal locked;
    address public owner;

    mapping(address => EnergyListing) public energyListings;
    mapping(address => uint256) public customerDemand;
    mapping(address => User) public users;
    address[] private userList;

    mapping(address => EnergyRecord[]) private energyRecords;
    mapping(address => uint256) public totalProduced;
    mapping(address => uint256) public totalConsumed;

    event EnergyListed(
        address indexed producer,
        uint256 amount,
        uint256 price,
        string energyType
    );
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
    event UserRegistered(address indexed user, UserType userType);

    event DataReset(address indexed user, uint256 timestamp);

    event EnergyProduced(
        address indexed producer,
        uint256 amount,
        EnergyType energyType,
        uint256 timestamp
    );
    event EnergyConsumed(
        address indexed consumer,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeInitiated(
        address indexed initiator,
        address indexed respondent,
        string reason,
        uint256 timestamp
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        string resolutionDetails,
        uint256 timestamp
    );

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
            users[msg.sender].registered &&
                users[msg.sender].userType == UserType.Producer,
            "Only registered producers can perform this action"
        );
        _;
    }

    modifier onlyRegisteredConsumer() {
        require(
            users[msg.sender].registered &&
                users[msg.sender].userType == UserType.Consumer,
            "Only registered consumers can perform this action"
        );
        _;
    }

    constructor(
        uint256 initialPrice,
        address _token
    ) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);
       

        owner = msg.sender;
    }

    function registerUser(address user, UserType userType) external {
        require(user != address(0), "Invalid user address");
        require(userType != UserType.None, "Invalid user type");
        require(!users[user].registered, "User is already registered");

        users[user] = User({userType: userType, registered: true});
        userList.push(user);

        emit UserRegistered(user, userType);
    }

    function isRegistered(address user) public view returns (bool) {
        return users[user].registered;
    }

    function getUserType(address user) public view returns (UserType) {
        require(users[user].registered, "User is not registered");
        return users[user].userType;
    }

    function getAllUsers() external view returns (address[] memory) {
        return userList;
    }

    /**
     * @dev Update the dynamic price based on supply and demand.
     * Fetch total production and consumption from EnergyMonitoring.
     */
    function updatePrice() public onlyOwner {
        uint256 totalSupply = totalProduced[owner];
        uint256 totalDemand = totalConsumed[owner];

        require(totalSupply > 0, "Supply must be greater than zero");
        require(totalDemand > 0, "Demand must be greater than zero");

        uint256 oldPrice = dynamicPrice;
        dynamicPrice = (totalDemand * oldPrice) / totalSupply;

        emit PriceUpdated(oldPrice, dynamicPrice);
    }

    /**
     * @dev List energy for sale.
     * Fetch production data from the EnergyMonitoring contract.
     */
    function listEnergy(
        uint256 amount,
        EnergyType energyType
    ) public noReentrancyGuard onlyRegisteredProducer {
        require(amount > 0, "Amount must be greater than zero");
        require(
            energyListings[msg.sender].active == false,
            "Existing listing must be inactive"
        );

        // Check production data without modifying it.
        totalProduced[msg.sender];

        energyListings[msg.sender] = EnergyListing({
            producer: msg.sender,
            amount: amount,
            price: dynamicPrice,
            energyType: energyType,
            active: true
        });

        // Record production.
        recordProduction(msg.sender, amount, energyType);

        emit EnergyListed(
            msg.sender,
            amount,
            dynamicPrice,
            energyTypeToString(energyType)
        );
    }

    /**
     * @dev Buy energy from a producer.
     * Fetch consumption data from the EnergyMonitoring contract.
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

        uint256 fee = (totalCost * 1) / 100;
        token.transferFrom(producer, owner, fee);
        require(token.approve(producer, totalCost), "Approval failed");

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        recordConsumption(msg.sender, amount);

        customerDemand[msg.sender] -= amount;

        emit EnergyBought(producer, msg.sender, amount, listing.price);
    }

    /**
     * @dev Record energy production.
     */
    function recordProduction(
        address producer,
        uint256 amount,
        EnergyType energyType
    ) internal {
        require(amount > 0, "Produced amount must be greater than zero");

        totalProduced[producer] += amount;
        energyRecords[producer].push(
            EnergyRecord({
                produced: amount,
                consumed: 0,
                timestamp: block.timestamp,
                energyType: energyType
            })
        );

        emit EnergyProduced(producer, amount, energyType, block.timestamp);
    }

    /**
     * @dev Record energy consumption.
     */
    function recordConsumption(address consumer, uint256 amount) internal {
        require(amount > 0, "Consumed amount must be greater than zero");

        totalConsumed[consumer] += amount;
        energyRecords[consumer].push(
            EnergyRecord({
                produced: 0,
                consumed: amount,
                timestamp: block.timestamp,
                energyType: EnergyType.Solar
            })
        );

        emit EnergyConsumed(consumer, amount, block.timestamp);
    }

    /**
     * @dev Get all energy records for a user.
     */
    function getRecords(
        address user
    ) external view returns (EnergyRecord[] memory) {
        return energyRecords[user];
    }

    /**
     * @dev Reset energy data for a user. Only callable by the owner.
     */
    function resetData(address user) external onlyOwner {
        delete energyRecords[user];
        totalProduced[user] = 0;
        totalConsumed[user] = 0;

        emit DataReset(user, block.timestamp);
    }

    function energyTypeToString(
        EnergyType energyType
    ) internal pure returns (string memory) {
        if (energyType == EnergyType.Solar) {
            return "Solar";
        } else if (energyType == EnergyType.Wind) {
            return "Wind";
        } else if (energyType == EnergyType.Biomass) {
            return "Biomass";
        } else if (energyType == EnergyType.Tidal) {
            return "Tidal";
        }
        return "Unknown";
    }

    function initiateDispute(address respondent, string memory reason) public {
        disputes.push(
            Dispute({
                initiator: msg.sender,
                respondent: respondent,
                reason: reason,
                resolutionDetails: "",
                resolved: false,
                timestamp: block.timestamp
            })
        );
        emit DisputeInitiated(msg.sender, respondent, reason, block.timestamp);
    }

    function resolveDispute(
        uint256 disputeId,
        string memory resolutionDetails
    ) public onlyOwner {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolutionDetails = resolutionDetails;
        dispute.resolved = true;

        emit DisputeResolved(disputeId, resolutionDetails, block.timestamp);
    }

    function getDispute(uint256 disputeId) public view returns (Dispute memory) {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        return disputes[disputeId];
    }


    function getDisputes() public view returns (Dispute[] memory) {
        return disputes;
    }
}
