import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const EnergyModule = buildModule("EnergyModule", (m) => {


  const energy = m.contract("EnergySharing", []);

  return { energy };
});

export default EnergyModule;