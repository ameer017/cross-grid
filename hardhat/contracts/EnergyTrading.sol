// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IEnergy} from "./IEnergy.sol";
import {EnergyMonitoring} from "./EnergyMonitoring.sol";

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

    constructor(
        uint256 initialPrice,
        address _token,
        address _energyMonitoring
    ) {
        require(initialPrice > 0, "Initial price must be greater than zero");
        dynamicPrice = initialPrice;
        token = IEnergy(_token);
        energyMonitoring = EnergyMonitoring(_energyMonitoring);
        owner = msg.sender;
    }

    /**
     * @dev Update the dynamic price based on supply and demand.
     * Fetch total production and consumption from EnergyMonitoring.
     */

    function updatePrice() public onlyOwner {
        uint256 totalSupply = energyMonitoring.totalProduced(owner); // Supply data from monitoring
        uint256 totalDemand = energyMonitoring.totalConsumed(owner); // Demand data from monitoring

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
    ) public noReentrancyGuard {
        require(amount > 0, "Amount must be greater than zero");
        require(
            energyListings[msg.sender].active == false,
            "Existing listing must be inactive"
        );

        // Record production
        energyMonitoring.recordProduction(msg.sender, amount, energyType);

        energyListings[msg.sender] = EnergyListing({
            producer: msg.sender,
            amount: amount,
            price: dynamicPrice,
            active: true
        });

        emit EnergyListed(msg.sender, amount, dynamicPrice);
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
    }
}
