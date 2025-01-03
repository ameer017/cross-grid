

// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UserModule = buildModule("UserModule", (m) => {
    const userManagement = m.contract("UserManagement");

    return { userManagement };
});

export default UserModule;
