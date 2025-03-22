// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";
import {DisputeResolution} from "./DisputeManagement.sol";

/**
 * @title CrossGridContract
 * @dev A decentralized platform for managing energy production, consumption, and trading using blockchain technology.
 */
contract CrossGridContract {
    uint256 public dynamicPrice;
    IEnergy public token;
    uint256 public constant fallbackPrice = 300000000000000000;
    DisputeResolution public disputeResolution;

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

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        bool released;
        bool delivered;
    }

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

    // mappings and state variables
    address public owner;
    address[] private userList;
    bool internal locked;
    Dispute[] public disputes;
    uint256 public escrowCounter;
    uint256 public totalSupplyAggregated;
    uint256 public totalDemandAggregated;

    mapping(address => EnergyConsumedRecord[]) public consumedRecords;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => EnergyListing[]) public energyListings;
    mapping(address => EnergyProducedRecord[]) public producedRecords;
    mapping(address => uint256) public customerDemand;
    mapping(address => Notification[]) public notifications;
    mapping(address => uint256) public totalProduced;
    mapping(address => uint256) public totalConsumed;
    mapping(address => User) public users;
    mapping(address => uint256) public userEarned;
    mapping(address => uint256) public userSpent;
    // =====================================================================

    // Events
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
    event FundsReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount
    );

    event NotificationAdded(
        address indexed user,
        string message,
        uint256 timestamp
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event UserRegistered(address indexed user, UserType userType);
    event NotificationEmitted(address indexed user, string message);
    // =====================================================================

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

    // =====================================================================

    /**
     * @notice Initializes the contract with the initial price and token address.
     * @param initialPrice The initial price per unit of energy.
     * @param _token Address of the ERC-20 token used for transactions.
     */
    constructor(
        uint256 initialPrice,
        address _token,
        address _disputeResolution
    ) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);
        disputeResolution = DisputeResolution(_disputeResolution);

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
        uint256 oldPrice = dynamicPrice;

        if (totalSupplyAggregated > 0 && totalDemandAggregated > 0) {
            dynamicPrice =
                (totalDemandAggregated * oldPrice) /
                totalSupplyAggregated;
        } else {
            dynamicPrice = fallbackPrice;
        }

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

        // Transfer the tokens from the buyer's wallet to the contract to be escrowed
        token.transferFrom(msg.sender, address(this), price);

        //initialize escrow
        escrows[escrowCounter] = Escrow({
            buyer: msg.sender,
            seller: producer,
            amount: price,
            released: false,
            delivered: false
        });
        escrowCounter++;

        totalSupplyAggregated -= amountToBuy;
        totalDemandAggregated += amountToBuy;

        // Adjust the producer's energy supply
        listing.amount -= amountToBuy;
        if (listing.amount == 0) {
            listing.active = false;
        }

        userEarned[producer] += price;
        userSpent[msg.sender] += price;

        updateDynamicPrice();

        emit EnergyBought(producer, msg.sender, amountToBuy, listing.price);
        notifyEventEmission(
            "Energy purchased successfully, Funds held in escrow till KW received"
        );
    }

    /**
     * @notice Allows the producer to confirm that they have delivered the energy.
     * @dev This must be done before the buyer can release funds.
     * @param escrowId The ID of the escrow transaction.
     */
    function confirmEnergyDelivery(uint256 escrowId) public {
        Escrow storage escrow = escrows[escrowId];

        require(
            escrow.seller == msg.sender,
            "Only the seller can confirm delivery"
        );
        require(!escrow.delivered, "Delivery already confirmed");

        escrow.delivered = true;

        notifyEventEmission("Energy delivery confirmed by the producer.");
    }

    /**
     * @notice Allows the buyer to release funds held in escrow to the seller.
     * @dev This function can only be called by the buyer associated with the escrow.
     *      It ensures that funds are only released once and transfers the escrowed amount to the seller.
     *      Emits a {FundsReleased} event upon successful release.
     * @param escrowId The ID of the escrow containing the funds to be released.
     * @dev Requirements:
     * - The caller must be the buyer associated with the escrow.
     * - The funds must not have already been released.
     * @dev Effects:
     * - Transfers the escrowed amount to the seller.
     * - Marks the escrow as released.
     * - Updates the seller's earned balance.
     * - Emits a {FundsReleased} event.
     * - Notifies the buyer of the successful release.
     */
    function releaseFunds(uint256 escrowId) public noReentrancyGuard {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.buyer == msg.sender, "Only the buyer can release funds");
        require(escrow.delivered, "Energy delivery not confirmed by producer"); // ✅ Added check
        require(!escrow.released, "Funds already released");

        // Transfer funds from escrow to seller
        token.transfer(escrow.seller, escrow.amount);

        escrow.released = true;
        userEarned[escrow.seller] += escrow.amount;

        // Record energy consumption after funds are released
        recordConsumption(
            escrow.buyer,
            escrow.amount / energyListings[escrow.seller][escrowId].price,
            energyListings[escrow.seller][escrowId].energyType
        );

        emit FundsReleased(escrowId, escrow.seller, escrow.amount);
        notifyEventEmission("Funds released to seller.");
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
     * @param respondent The address of the party against whom the dispute is raised.
     * @param reason A brief explanation of the dispute.
     */
    function initiateDispute(
        address respondent,
        string memory reason
    ) external {
        disputeResolution.initiateDispute(respondent, reason);
    }

    /**
     * @notice Allows council members to vote on a dispute.
     * @param disputeId The ID of the dispute to vote on.
     * @param votedForInitiator True if voting in favor of the initiator, false for the respondent.
     */
    function voteOnDispute(uint256 disputeId, bool votedForInitiator) external {
        disputeResolution.voteOnDispute(disputeId, votedForInitiator);
    }

    /**
     * @notice Retrieves details of a specific dispute.
     * @param disputeId The ID of the dispute to retrieve.
     * @return initiator The address of the initiator.
     * @return respondent The address of the respondent.
     * @return reason The reason for the dispute.
     * @return resolutionDetails The resolution details.
     * @return resolved Whether the dispute is resolved.
     * @return timestamp The timestamp of the dispute.
     * @return votesForInitiator The number of votes in favor of the initiator.
     * @return votesForRespondent The number of votes in favor of the respondent.
     */
    function getDispute(
        uint256 disputeId
    )
        external
        view
        returns (
            address initiator,
            address respondent,
            string memory reason,
            string memory resolutionDetails,
            bool resolved,
            uint256 timestamp,
            uint256 votesForInitiator,
            uint256 votesForRespondent
        )
    {
        return disputeResolution.getDispute(disputeId);
    }

    /**
     * @notice Retrieves the list of all disputes.
     * @return An array of dispute details.
     */
    function getAllDisputes()
        external
        view
        returns (DisputeResolution.Dispute[] memory)
    {
        return disputeResolution.getAllDisputes();
    }
}
