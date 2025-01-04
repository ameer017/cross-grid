import { useMemo } from "react";
import { Contract } from "ethers";
import ABI from "../util/EnergyTrading.json";
import useSignerOrProvider from "./useSignerOrProvider";

const useContract = (withSigner = false) => {
  const { signer, readOnlyProvider } = useSignerOrProvider();
  return useMemo(() => {
    if (withSigner) {
      if (!signer) return null;
      return new Contract(ABI.address, ABI.abi, signer);
    } else {
      return new Contract(ABI.address, ABI.abi, readOnlyProvider);
    }
  }, [signer, readOnlyProvider, withSigner]);
};

export default useContract;
