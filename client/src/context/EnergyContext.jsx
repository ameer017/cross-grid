import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import useContract from "../hook/useContract";
import { Contract } from "ethers";
import { readOnlyProvider } from "../util/readOnlyProvider";
import ABI from "../util/EnergyTrading.json";

const EnergyContext = createContext({
  energies: [],
  reloadEnergies: () => {},
});

export const EnergyContextProvider = ({ children }) => {
  const [energies, setEnergies] = useState([]);

  const readOnlyEnergyContract = useContract();

  const getDatas = useCallback(async () => {
    if (!readOnlyEnergyContract) return;

    try {
      const testContract = new Contract(ABI.address, ABI.abi, readOnlyProvider);
      const data = await testContract.fetchAllEnergyListings();
    //   console.log(data);

      setEnergies(data);
    } catch (error) {
      console.log("Error fetching data", error);
    }
  }, [readOnlyEnergyContract]);

  useEffect(() => {
    getDatas();
  }, [getDatas]);

  return (
    <EnergyContext.Provider value={{ energies }}>
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  return context;
};
