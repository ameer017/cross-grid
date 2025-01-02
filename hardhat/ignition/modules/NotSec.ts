// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NotSecModule = buildModule("NotSecModule", (m) => {
    const notSec = m.contract("NotificationsAndSecurity");

    return { notSec };
});

export default NotSecModule;

