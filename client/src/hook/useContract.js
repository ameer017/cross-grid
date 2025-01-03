import { useMemo } from "react";
import { Contract } from "ethers";
import CONTRACT from "../util/EnergyTrading.json";
import useSignerOrProvider from "./useSignerOrProvider";

const useContract = (withSigner = false) => {
  const { signer, readOnlyProvider } = useSignerOrProvider();
  return useMemo(() => {
    if (withSigner) {
      if (!signer) return null;
      return new Contract(CONTRACT.address, CONTRACT.abi, signer);
    } else {
      return new Contract(CONTRACT.address, CONTRACT.abi, readOnlyProvider);
    }
  }, [signer, readOnlyProvider, withSigner]);
};

export default useContract;
