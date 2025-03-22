import { JsonRpcProvider } from "ethers";

export const readOnlyProvider = new JsonRpcProvider(
  "https://alfajores-forno.celo-testnet.org/"
);
