// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";

contract EnergyTrading {
    struct EnergyListing {
        address producer;
        uint256 amount;
        uint256 price;
        bool active;
    }

    uint256 public dynamicPrice;
    IEnergy public token;
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

    constructor(uint256 initialPrice, address _token) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);
        owner = msg.sender;
    }

    /**
     * @dev Update the dynamic price based on supply and demand.
     * @param supply Total energy supply in the system (kWh).
     * @param demand Total energy demand in the system (kWh).
     */

    function updatePrice(uint256 supply, uint256 demand) public onlyOwner {
        require(supply > 0, "Supply must be greater than zero");
        require(demand > 0, "Demand must be greater than zero");

        uint256 oldPrice = dynamicPrice;
        dynamicPrice = (demand * oldPrice) / supply;

        emit PriceUpdated(oldPrice, dynamicPrice);
    }

    /**
     * @dev List energy for sale.
     * @param amount Amount of energy available (kWh).
     */

    function listEnergy(uint256 amount) public noReentrancyGuard {
        require(amount > 0, "Amount must be greater than zero");
        require(
            energyListings[msg.sender].active == false,
            "Existing listing must be inactive"
        );

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

    function registerDemand(uint256 amount) public noReentrancyGuard {
        require(amount > 0, "Amount must be greater than zero");
        customerDemand[msg.sender] += amount;
    }

    /**
     * @dev Buy energy from a producer.
     * @param producer Address of the energy producer.
     * @param amount Amount of energy to buy (kWh).
     */

    function buyEnergy(address producer, uint256 amount)
        public
        noReentrancyGuard
    {
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
        require(token.approve(producer, totalCost));

        uint256 fee = (totalCost * 1) / 100;
        token.transferFrom(producer, owner, fee);

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        customerDemand[msg.sender] -= amount;

        emit EnergyBought(producer, msg.sender, amount, listing.price);
    }
}
