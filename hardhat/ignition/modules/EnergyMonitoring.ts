// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EnergyMonitoringModule = buildModule("EnergMonitoringnModule", (m) => {
    const monitoring = m.contract("EnergyMonitoring");

    return { monitoring };
});

export default EnergyMonitoringModule;

