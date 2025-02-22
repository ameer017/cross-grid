// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";
import Token_Add from "../deployments/chain-4157/deployed_addresses.json"

const ContractModule = buildModule("ContractModule", (m) => {
  const _initialPrice = hre.ethers.parseEther("0.2");

  const energy = m.contract("CrossGridContract", [
    _initialPrice,
    Token_Add["EnergyTokenModule#EnergyCredits"],
    
  ]);

  return { energy };
});

export default ContractModule;
