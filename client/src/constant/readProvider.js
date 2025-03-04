import { JsonRpcProvider } from "ethers";

export const readOnlyProvider = new JsonRpcProvider(
  `https://crossfi-testnet.g.alchemy.com/v2/${
    import.meta.env.VITE_APP_NODE_URL
  }`
);
