// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import {EnergyCredits} from "./EnergyCredits.sol";

contract EnergyTrading is EnergyCredits {
    struct EnergyListing {
        address producer;
        // Amount of energy in kWh
        uint256 amount;
        // Price per kWh in wei
        uint256 price;
        // Whether the listing is active
        bool active;
    }

    uint256 public dynamicPrice;
    mapping(address => EnergyListing) public energyListings;
    mapping(address => uint256) public customerDemand;

    event EnergyListed(address indexed producer, uint256 amount, uint256 price);
    event EnergyBought(
        address indexed producer,
        address indexed consumer,
        uint256 amount,
        uint256 price
    );
    event PU(uint256 oldPrice, uint256 newPrice);

    constructor(uint256 initialPrice) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
    }

    /**
     * @dev Update the dynamic price based on supply and demand.
     * @param supply Total energy supply in the system (kWh).
     * @param demand Total energy demand in the system (kWh).
     */
    function updatePrice(uint256 supply, uint256 demand) public {
        require(supply > 0, "Supply must be greater than zero");
        require(demand > 0, "Demand must be greater than zero");

        uint256 oldPrice = dynamicPrice;
        dynamicPrice = (demand * oldPrice) / supply;

        emit PU(oldPrice, dynamicPrice);
    }

    /**
     * @dev List energy for sale.
     * @param amount Amount of energy available (kWh).
     */
    function listEnergy(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");

        energyListings[msg.sender] = EnergyListing({
            producer: msg.sender,
            amount: amount,
            price: dynamicPrice,
            active: true
        });

        emit EnergyListed(msg.sender, amount, dynamicPrice);
    }

    /**
     * @dev Register energy demand for a consumer.
     * @param amount Amount of energy required (kWh).
     */
    function registerDemand(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        customerDemand[msg.sender] += amount;
    }

    /**
     * @dev Buy energy from a producer.
     * @param producer Address of the energy producer.
     * @param amount Amount of energy to buy (kWh).
     */
    function buyEnergy(address producer, uint256 amount) public {
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

        // Ensure the consumer has enough tokens to pay for the energy
        require(
            balances[msg.sender] >= totalCost,
            "Insufficient token balance"
        );

        // Transfer the total cost in tokens from consumer to producer
        transferFrom(msg.sender, producer, totalCost);

        // Deduct 1% fee from the producer's balance and transfer to the contract owner
        uint256 fee = (totalCost * 1) / 100;
        require(
            balances[producer] >= fee,
            "Producer has insufficient balance for fee"
        );
        transfer(owner, fee);

        // Update energy listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        // Update consumer demand
        customerDemand[msg.sender] -= amount;

        emit EnergyBought(producer, msg.sender, amount, listing.price);
    }
}
