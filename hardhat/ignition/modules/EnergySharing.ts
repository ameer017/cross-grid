// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EnergyTokenModule = buildModule("EnergyTokenModule", (m) => {
    const token = m.contract("EnergyToken", ["", ""]);

    return { token };
});

export default EnergyTokenModule;

