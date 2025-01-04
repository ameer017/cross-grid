import { useCallback } from "react";
import { Contract } from "ethers";
import { readOnlyProvider } from "../util/ReadOnlyProvider";
import ABI from "../util/EnergyTrading.json";

const useGetDynamicPrice = () => {
  return (
    useCallback(async () => {
      try {
        const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

        console.log(contract.functions)
        const dynamicPrice = await contract.dynamicPrice();
        console.log("Dynamic Price:", dynamicPrice.toString());

        return dynamicPrice.toString();
      } catch (error) {
        console.error("Error fetching dynamic price:", error);
        return null;
      }
    }),
    [readOnlyProvider]
  );
};

export default useGetDynamicPrice;
