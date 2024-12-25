// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract EnergyMonitoring {
    address public owner;

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

    address[] public users;

    mapping(address => EnergyRecord[]) private energyRecords;
    mapping(address => uint256) public totalProduced;
    mapping(address => uint256) public totalConsumed;

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
    event DataReset(address indexed user, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Record energy production.
     * @param producer The address of the producer.
     * @param amount The amount of energy produced (kWh).
     * @param energyType The type of energy produced.
     */
    function recordProduction(
        address producer,
        uint256 amount,
        EnergyType energyType
    ) external onlyOwner {
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
     * @param consumer The address of the consumer.
     * @param amount The amount of energy consumed (kWh).
     */
    function recordConsumption(
        address consumer,
        uint256 amount
    ) external onlyOwner {
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
     * @param user The address of the user.
     * @return An array of EnergyRecord structs.
     */
    function getRecords(
        address user
    ) external view returns (EnergyRecord[] memory) {
        return energyRecords[user];
    }

    /**
     * @dev Get all energy records created by all users.
     * @return An array of all EnergyRecord structs across all users.
     */
    function getAllRecords() external view returns (EnergyRecord[] memory) {
        uint256 totalRecords = 0;
        for (uint256 i = 0; i < users.length; i++) {
            totalRecords += energyRecords[users[i]].length;
        }

        EnergyRecord[] memory allRecords = new EnergyRecord[](totalRecords);
        uint256 index = 0;

        for (uint256 i = 0; i < users.length; i++) {
            EnergyRecord[] memory userRecords = energyRecords[users[i]];
            for (uint256 j = 0; j < userRecords.length; j++) {
                allRecords[index] = userRecords[j];
                index++;
            }
        }

        return allRecords;
    }

    /**
     * @dev Reset energy data for a user. Only callable by the owner.
     * @param user The address of the user whose data will be reset.
     */
    function resetData(address user) external onlyOwner {
        delete energyRecords[user];
        totalProduced[user] = 0;
        totalConsumed[user] = 0;

        emit DataReset(user, block.timestamp);
    }

    /**
     * @dev Transfer ownership of the contract.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}
