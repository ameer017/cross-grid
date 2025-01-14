// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";

/**
 * @title CrossGridContract
 * @dev A decentralized platform for managing energy production, consumption, and trading using blockchain technology.
 */
contract CrossGridContract {
    uint256 public dynamicPrice;
    IEnergy public token;

    struct Dispute {
        address initiator;
        address respondent;
        string reason;
        string resolutionDetails;
        bool resolved;
        uint256 timestamp;
    }

    enum EnergyType {
        Solar,
        Wind,
        Biomass,
        Tidal
    }

    struct EnergyListing {
        address producer;
        uint256 amount; // Amount of energy available for sale in kwh.
        uint256 price; // Price per unit of energy.
        EnergyType energyType;
        bool active;
    }

    struct Notification {
        string message;
        uint256 timestamp;
    }

    mapping(address => Notification[]) public notifications;

    enum UserType {
        None,
        Producer,
        Consumer
    }

    struct User {
        string name;
        UserType userType; // User type: Producer or Consumer.
        bool registered;
    }

    struct EnergyProducedRecord {
        uint256 produced;
        uint256 timestamp;
        EnergyType energyType;
    }

    struct EnergyConsumedRecord {
        uint256 consumed;
        uint256 timestamp;
        EnergyType energyType;
    }

    address public owner;
    address[] private userList;
    bool internal locked;
    Dispute[] public disputes;
    uint256 public totalSupplyAggregated;
    uint256 public totalDemandAggregated;

    mapping(address => EnergyListing[]) public energyListings;
    mapping(address => EnergyProducedRecord[]) public producedRecords;
    mapping(address => EnergyConsumedRecord[]) public consumedRecords;
    mapping(address => uint256) public customerDemand;
    mapping(address => User) public users;
    mapping(address => uint256) public totalProduced;
    mapping(address => uint256) public totalConsumed;
    mapping(address => uint256) public userEarned;
    mapping(address => uint256) public userSpent;

    event DataReset(address indexed user, uint256 timestamp);
    event DisputeInitiated(
        address indexed initiator,
        address indexed respondent,
        string reason
    );
    event DisputeResolved(uint256 indexed disputeId, string resolutionDetails);
    event EnergyBought(
        address indexed producer,
        address indexed consumer,
        uint256 amount,
        uint256 price
    );
    event EnergyConsumed(
        address indexed consumer,
        uint256 amount,
        uint256 timestamp
    );
    event EnergyListed(
        address indexed producer,
        uint256 amount,
        uint256 price,
        string energyType
    );
    event EnergyProduced(
        address indexed producer,
        uint256 amount,
        EnergyType energyType,
        uint256 timestamp
    );
    event NotificationAdded(
        address indexed user,
        string message,
        uint256 timestamp
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event UserRegistered(address indexed user, UserType userType);
    event NotificationEmitted(address indexed user, string message);

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

    /**
     * @notice Initializes the contract with the initial price and token address.
     * @param initialPrice The initial price per unit of energy.
     * @param _token Address of the ERC-20 token used for transactions.
     */
    constructor(uint256 initialPrice, address _token) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);

        owner = msg.sender;
    }

    /**
     * @notice Adds a notification for a specific user.
     * @dev Stores the message and the current timestamp as a notification for the given user address.
     * @param user The address of the user to whom the notification is being added.
     * @param message The message content of the notification.
     * Emits a {NotificationAdded} event.
     */

    function addNotification(address user, string memory message) internal {
        notifications[user].push(
            Notification({message: message, timestamp: block.timestamp})
        );
        emit NotificationAdded(user, message, block.timestamp);
    }

    /**
     * @notice Retrieves all notifications for a specific user.
     * @param user The address of the user whose notifications are to be fetched.
     * @return An array of `Notification` structs containing message and timestamp.
     */
    function getNotifications(
        address user
    ) external view returns (Notification[] memory) {
        return notifications[user];
    }

    /**
     * @notice Clears all notifications for the caller.
     * @dev Deletes all notifications stored for the message sender.
     */
    function clearNotifications() external {
        delete notifications[msg.sender];
    }

    /**
     * @notice Emits a notification event and stores it for the caller.
     * @dev Internally calls `addNotification` and emits a {NotificationEmitted} event.
     * @param message The message content of the notification.
     * Emits a {NotificationEmitted} event.
     */
    function notifyEventEmission(string memory message) internal {
        addNotification(msg.sender, message);
        emit NotificationEmitted(msg.sender, message);
    }

    /**
     * @notice Allows the caller to register as a producer or consumer.
     * @dev This function uses `msg.sender` to register the user and ensures the address is valid, the user type is valid, and the user is not already registered.
     * @param name The name of the user to register.
     * @param userType The type of user (Producer or Consumer).
     */

    function registerUser(string memory name, UserType userType) external {
        require(msg.sender != address(0), "Invalid user address");
        require(userType != UserType.None, "Invalid user type");
        require(!users[msg.sender].registered, "User is already registered");

        users[msg.sender] = User({
            name: name,
            userType: userType,
            registered: true
        });
        userList.push(msg.sender);

        emit UserRegistered(msg.sender, userType);
        notifyEventEmission("Registration successful.");
    }

    /**
     * @notice Checks if a user is registered.
     * @param user The address of the user to check.
     * @return True if the user is registered, otherwise false.
     */
    function isRegistered(address user) public view returns (bool) {
        return users[user].registered;
    }

    /**
     * @notice Retrieves the type of a registered user.
     * @dev Reverts if the user is not registered.
     * @param user The address of the user.
     * @return The UserType of the specified user.
     */
    function getUserType(address user) public view returns (UserType) {
        require(users[user].registered, "User is not registered");
        return users[user].userType;
    }

    /**
     * @notice Retrieves a list of all registered users.
     * @return An array of addresses representing all registered users.
     */
    function getAllUsers() external view returns (address[] memory) {
        return userList;
    }

    /**
     * @dev Update the dynamic price based on current supply and demand.
     */
    function updateDynamicPrice() internal {
        require(
            totalSupplyAggregated > 0,
            "Total supply must be greater than zero"
        );
        require(
            totalDemandAggregated > 0,
            "Total demand must be greater than zero"
        );

        uint256 oldPrice = dynamicPrice;
        dynamicPrice =
            (totalDemandAggregated * oldPrice) /
            totalSupplyAggregated;

        emit PriceUpdated(oldPrice, dynamicPrice);
    }

    /**
     * @notice Allows a producer to list energy for sale.
     * @param amount The amount of energy to list.
     * @param price The price per unit of energy.
     * @param energyType The type of energy to list.
     */
    function listEnergy(
        uint256 amount,
        uint256 price,
        EnergyType energyType
    ) public noReentrancyGuard onlyRegisteredProducer {
        require(amount > 0, "Amount must be greater than zero");
        require(price > 0, "Price must be greater than zero");

        totalSupplyAggregated += amount;

        energyListings[msg.sender].push(
            EnergyListing({
                producer: msg.sender,
                amount: amount,
                price: price,
                energyType: energyType,
                active: true
            })
        );

        // Record production.
        recordProduction(msg.sender, amount, energyType);
        updateDynamicPrice();

        emit EnergyListed(
            msg.sender,
            amount,
            dynamicPrice,
            energyTypeToString(energyType)
        );
        notifyEventEmission("Energy listed successfully.");
    }

    /**
     * @notice Allows a consumer to buy energy from a producer by specifying the price they are willing to pay.
     * @param producer The address of the producer.
     * @param price The price the consumer wants to pay.
     */
    function buyEnergy(
        address producer,
        uint256 listingIndex,
        uint256 price
    ) public noReentrancyGuard {
        EnergyListing storage listing = energyListings[producer][listingIndex];

        require(listing.active, "Energy is not available for sale");
        require(
            price > 0 && price <= (listing.amount * listing.price),
            "Invalid price or exceeds producer's supply"
        );

        // Calculate the equivalent energy amount based on the price
        uint256 amountToBuy = price / listing.price;
        require(
            amountToBuy <= listing.amount,
            "Producer does not have enough energy"
        );

        // Check the buyer's token balance and allowance
        require(
            token.allowance(msg.sender, address(this)) >= price,
            "Allowance insufficient"
        );
        require(
            token.balanceOf(msg.sender) >= price,
            "Insufficient token balance"
        );

        // Transfer the tokens from the buyer to the producer
        token.transferFrom(msg.sender, producer, price);

        totalSupplyAggregated -= amountToBuy;
        totalDemandAggregated += amountToBuy;
        // Adjust the producer's energy supply
        listing.amount -= amountToBuy;
        if (listing.amount == 0) {
            listing.active = false;
        }

        userEarned[producer] += price;
        userSpent[msg.sender] += price;

        // Record the consumer's energy purchase
        recordConsumption(msg.sender, amountToBuy, listing.energyType);
        updateDynamicPrice();

        emit EnergyBought(producer, msg.sender, amountToBuy, listing.price);
        notifyEventEmission("Energy purchased successfully.");
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
        producedRecords[producer].push(
            EnergyProducedRecord({
                produced: amount,
                timestamp: block.timestamp,
                energyType: energyType
            })
        );

        emit EnergyProduced(producer, amount, energyType, block.timestamp);
    }

    /**
     * @dev Record energy consumption.
     */
    function recordConsumption(
        address consumer,
        uint256 amount,
        EnergyType energyType
    ) internal {
        require(amount > 0, "Consumed amount must be greater than zero");

        totalConsumed[consumer] += amount;
        consumedRecords[consumer].push(
            EnergyConsumedRecord({
                consumed: amount,
                timestamp: block.timestamp,
                energyType: energyType
            })
        );

        emit EnergyConsumed(consumer, amount, block.timestamp);
    }

    /**
     * @dev Returns the list of energy produced records for a given user.
     * Each record contains details about the produced energy, including
     * the amount, timestamp, and energy type.
     *
     * @param user The address of the user whose production records are being queried.
     * @return An array of `EnergyProducedRecord` structs, containing the energy production details.
     */

    function getProducedRecords(
        address user
    ) external view returns (EnergyProducedRecord[] memory) {
        return producedRecords[user];
    }

    /**
     * @dev Returns the list of energy consumed records for a given user.
     * Each record contains details about the consumed energy, including
     * the amount, timestamp, and energy type.
     *
     * @param user The address of the user whose consumption records are being queried.
     * @return An array of `EnergyConsumedRecord` structs, containing the energy consumption details.
     */
    function getConsumedRecords(
        address user
    ) external view returns (EnergyConsumedRecord[] memory) {
        return consumedRecords[user];
    }

    /**
     * @notice Retrieves all active energy listings.
     * @return An array of EnergyListing structs containing all active listings.
     */
    function fetchAllEnergyListings()
        public
        view
        returns (EnergyListing[] memory)
    {
        // Step 1: Count total listings across all users
        uint256 totalListings = 0;

        for (uint256 i = 0; i < userList.length; i++) {
            address user = userList[i];
            totalListings += energyListings[user].length;
        }

        // Step 2: Create a dynamic array for all listings
        EnergyListing[] memory allListings = new EnergyListing[](totalListings);
        uint256 index = 0;

        // Step 3: Populate the array with all listings
        for (uint256 i = 0; i < userList.length; i++) {
            address user = userList[i];
            EnergyListing[] storage userListings = energyListings[user];
            for (uint256 j = 0; j < userListings.length; j++) {
                allListings[index] = userListings[j];
                index++;
            }
        }

        return allListings;
    }

    /**
     * @dev Returns the total aggregated supply of energy across all producers
     * @return uint256 The total aggregated supply value
     */
    function getAggregatedSupply() public view returns (uint256) {
        return totalSupplyAggregated;
    }

    /**
     * @dev Returns the total aggregated demand of energy across all consumers
     * @return uint256 The total aggregated demand value
     */

    function getAggregatedDemand() public view returns (uint256) {
        return totalDemandAggregated;
    }

    /**
     * @dev Returns the list of energy listings for a given producer.
     * @param producer The address of the producer whose listings are being fetched.
     * @return An array of EnergyListing structs representing the producer's energy listings.
     */

    function getListings(
        address producer
    ) public view returns (EnergyListing[] memory) {
        return energyListings[producer];
    }

    /**
     * @dev Reset energy data for a user. Only callable by the owner.
     */
    function resetData(address user) external onlyOwner {
        delete producedRecords[user];
        delete consumedRecords[user];
        totalProduced[user] = 0;
        totalConsumed[user] = 0;

        emit DataReset(user, block.timestamp);
    }

    /**
     * @dev Converts an energy type enum to its string representation.
     * @param energyType The energy type to convert.
     * @return The string representation of the energy type.
     */
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

    /**
     * @notice Initiates a new dispute.
     * @dev Adds a new dispute to the list with the given respondent and reason.
     * @param respondent The address of the party against whom the dispute is raised.
     * @param reason A brief explanation of the dispute.
     * Emits a {DisputeInitiated} event.
     */

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
        emit DisputeInitiated(msg.sender, respondent, reason);
        notifyEventEmission("Dispute initiated successfully.");
    }

    /**
     * @notice Resolves an existing dispute.
     * @dev Updates the resolution details and marks the dispute as resolved.
     *      Can only be called by the contract owner.
     * @param disputeId The ID of the dispute to resolve.
     * @param resolutionDetails Details about how the dispute was resolved.
     * Emits a {DisputeResolved} event.
     */
    function resolveDispute(
        uint256 disputeId,
        string memory resolutionDetails
    ) public onlyOwner {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolutionDetails = resolutionDetails;
        dispute.resolved = true;

        emit DisputeResolved(disputeId, resolutionDetails);
    }

    /**
     * @notice Retrieves details of a specific dispute.
     * @dev Ensures the dispute ID exists before returning the details.
     * @param disputeId The ID of the dispute to retrieve.
     * @return A `Dispute` struct containing the dispute details.
     */

    function getDispute(
        uint256 disputeId
    ) public view returns (Dispute memory) {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        return disputes[disputeId];
    }

    /**
     * @notice Retrieves the list of all disputes.
     * @dev Returns an array of all disputes in the contract.
     * @return An array of `Dispute` structs.
     */
    function getDisputes() public view returns (Dispute[] memory) {
        return disputes;
    }
}
