import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Energy trading contract", async () => {
    async function deployEnergyContractFixture() {
        const [owner, otherAccount, consumerAccount] = await hre.ethers.getSigners();

        const Token = await hre.ethers.getContractFactory("EnergyCredits");
        const token = await Token.deploy();

        const EnergyMonitoring = await hre.ethers.getContractFactory("EnergyMonitoring");
        const energyMonitoring = await EnergyMonitoring.deploy();

        const NS = await hre.ethers.getContractFactory("NotificationsAndSecurity");
        const notification = await NS.deploy();

        const UM = await hre.ethers.getContractFactory("UserManagement");
        const um = await UM.deploy();

        const _i = hre.ethers.parseEther("2");

        const EnergyTrading = await hre.ethers.getContractFactory("EnergyTrading");
        const energyTrading = await EnergyTrading.deploy(_i, token.target, energyMonitoring.target, notification.target, um.target);

        // console.log(energyTrading);

        return {
            energyTrading,
            owner,
            otherAccount,
            consumerAccount,
            energyMonitoring,
            token,
            notification,
            um,
        };
    }


    describe("Deployment", async () => {
        it("Should check if the contract deployed", async function () {
            const { energyTrading, owner } = await loadFixture(deployEnergyContractFixture);

            expect(await energyTrading.owner()).to.equal(owner);
        });

        it("Should correctly update the price based on supply and demand", async function () {
            const { energyTrading, energyMonitoring, owner } = await loadFixture(deployEnergyContractFixture);

            const totalProduced = hre.ethers.parseEther("100");
            const totalConsumed = hre.ethers.parseEther("50");
            const initialPrice = hre.ethers.parseEther("2");

            await energyMonitoring.recordProduction(owner.address, totalProduced, 0); // 0 represents Solar
            await energyMonitoring.recordConsumption(owner.address, totalConsumed);

            expect(await energyTrading.dynamicPrice()).to.equal(initialPrice);


            await energyTrading.updatePrice();


            const expectedPrice = totalConsumed * (initialPrice) / (totalProduced);

            expect(await energyTrading.dynamicPrice()).to.equal(expectedPrice);
        });

        it("Should revert if supply is zero", async function () {
            const { energyTrading } = await loadFixture(deployEnergyContractFixture);

            await expect(energyTrading.updatePrice()).to.be.revertedWith("Supply must be greater than zero");
        });

        it("Should revert if demand is zero", async function () {
            const { energyTrading, energyMonitoring, owner } = await loadFixture(deployEnergyContractFixture);

            const totalProduced = hre.ethers.parseEther("100");

            await energyMonitoring.recordProduction(owner.address, totalProduced, 0);

            await expect(energyTrading.updatePrice()).to.be.revertedWith("Demand must be greater than zero");
        });

        console.info("##### Energy Listing #####")
        it("should allow only registered producers to list energy", async () => {
            const { energyTrading, energyMonitoring, um, owner } = await loadFixture(deployEnergyContractFixture);
            
            const userType = 0;
            const userName = "Al Ameer";
            const userPref = "all";
            const energyAmount = hre.ethers.parseEther("40");
            
            await um.registerUser(userType, userName, userPref);
            
            await energyMonitoring.recordProduction(owner.address, energyAmount, 0);
            
            await expect(energyTrading.connect(owner).listEnergy(energyAmount, 0)).to.be.revertedWith("User is not registered");
            
            await um.registerUser(userType, userName, userPref);
            await expect(energyTrading.listEnergy(energyAmount, 0)).to.not.be.reverted;
        });
        
        console.info("##### Energy Buying #####")
        it("Should allow registered consumers to buy energy", async function () {
            const { energyTrading, energyMonitoring, token, um, owner, consumerAccount } = await loadFixture(deployEnergyContractFixture);
        
            const producerType = 0;
            const consumerType = 1;
            const userName = "Consumer User";
            const energyAmount = hre.ethers.parseEther("50"); // Energy amount as BigNumber
        
            // Register producer and consumer
            await um.registerUser(producerType, "Producer", "all");
            await um.connect(consumerAccount).registerUser(consumerType, userName, "all");
        
            // Producer lists energy
            await energyMonitoring.recordProduction(owner.address, energyAmount, 0);
            await energyTrading.listEnergy(energyAmount, 0);
        
            // Approve tokens for the consumer
            const dynamicPrice = await energyTrading.dynamicPrice();
            const totalCost = energyAmount * dynamicPrice; 
            await token.mint(consumerAccount, totalCost);
            await token.connect(consumerAccount).approve(energyTrading.target, totalCost);
        
            // Consumer buys energy
            await expect(
                energyTrading.connect(consumerAccount).buyEnergy(owner.address, energyAmount)
            ).to.not.be.reverted;
        });
        

        console.info("##### Dispute Management #####")
        it("Should allow initiating and resolving disputes", async function () {
            const { energyTrading, owner, otherAccount } = await loadFixture(deployEnergyContractFixture);

            const disputeReason = "Payment not received";
            await expect(energyTrading.initiateDispute(otherAccount.address, disputeReason))
                .to.emit(energyTrading, "DisputeInitiated")
                .withArgs(owner.address, otherAccount.address, disputeReason);

            const disputeId = 1;
            const resolutionDetails = "Resolved amicably";
            await expect(energyTrading.resolveDispute(disputeId, resolutionDetails))
                .to.emit(energyTrading, "DisputeResolved")
                .withArgs(disputeId, resolutionDetails);
        });
    })
})