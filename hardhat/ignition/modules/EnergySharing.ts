// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ADDRESS from "../deployments/chain-4157/deployed_addresses.json";
import hre from "hardhat";

type AddressKeys =
  | "EnergyTokenModule#EnergyCredits"
  | "EnergMonitoringnModule#EnergyMonitoring"
  | "NotSecModule#NotificationsAndSecurity"
  | "UserModule#UserManagement";

const EnergyModule = buildModule("EnergyModule", (m) => {
  const _initialPrice = hre.ethers.parseEther("0.5");

  const requiredKeys: AddressKeys[] = [
    "EnergyTokenModule#EnergyCredits",
    "EnergMonitoringnModule#EnergyMonitoring",
    "NotSecModule#NotificationsAndSecurity",
    "UserModule#UserManagement",
  ];

  requiredKeys.forEach((key) => {
    if (!ADDRESS[key]) {
      throw new Error(`${key} address is missing in the deployed_addresses.json`);
    }
  });

  const energy = m.contract("EnergySharing", [
    _initialPrice,
    ADDRESS["EnergyTokenModule#EnergyCredits"],
    ADDRESS["EnergMonitoringnModule#EnergyMonitoring"],
    ADDRESS["NotSecModule#NotificationsAndSecurity"],
    ADDRESS["UserModule#UserManagement"],
  ]);

  return { energy };
});

export default EnergyModule;
