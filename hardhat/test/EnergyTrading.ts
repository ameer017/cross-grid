import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Energy trading contract", async () => {
    async function deployEnergyContractFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const Token = await hre.ethers.getContractFactory("EnergyCredits");
        const token = await Token.deploy();

        const EnergyMonitoring = await hre.ethers.getContractFactory("EnergyMonitoring");
        const energyMonitoring = await EnergyMonitoring.deploy();

        const NS = await hre.ethers.getContractFactory("NotificationsAndSecurity");
        const notification = await NS.deploy();

        const _i = hre.ethers.parseEther("2");

        const EnergyTrading = await hre.ethers.getContractFactory("EnergyTrading");
        const energyTrading = await EnergyTrading.deploy(_i, token.target, energyMonitoring.target, notification.target);

        console.log(energyTrading);

        return { energyTrading, owner, otherAccount, energyMonitoring, token, notification };
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
    })
})