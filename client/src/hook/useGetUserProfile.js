import { useCallback } from "react";
import { Contract } from "ethers";
import { readOnlyProvider } from "../util/readOnlyProvider";
import ABI from "../util/EnergyTrading.json";

const useGetUserProfile = () => {

  return (
    useCallback(async () => {
      try {
        const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

        console.log(contract.functions)
        const userProfile = await contract.getUserProfile();
        console.log("User Profile:", userProfile);

        return userProfile;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    }),
    [readOnlyProvider]
  );
};

export default useGetUserProfile;
