// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DisputeModule = buildModule("DisputeModule", (m) => {

    const dispute = m.contract("CrossGridContract");

    return { dispute };
});

export default DisputeModule;
