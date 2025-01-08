import { Battery, BatteryCharging, DollarSign, Zap } from "lucide-react";
import { readOnlyProvider } from "../util/readOnlyProvider";
import { Contract, ethers } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

const TransactionsSummary = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { address } = useAppKitAccount();

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);
 
  useEffect(() => {
    const fetchTotalEnergy = async () => {
      setLoading(true);
      try {
        // Fetch dynamic price from the contract
        const priceInWei = await contract.dynamicPrice();
        const conversionFactor = parseFloat(ethers.formatUnits(priceInWei, "ether"));
  
        // Fetch energy records
        const totalEnergy = await contract.getRecords(address);
        // console.log("Raw totalEnergy:", totalEnergy);
  
       
  
        // Extract and convert values
        const producedRaw = ethers.toBigInt(totalEnergy[0]);
        const consumedRaw = ethers.toBigInt(totalEnergy[1]);
        const timestampRaw = Number(totalEnergy[2]);
        const energyTypeRaw = Number(totalEnergy[3]);
  
        //  Convert energy values to kWh
        const produced = producedRaw * conversionFactor;
        const consumed = consumedRaw * conversionFactor;
  
        const timestamp = new Date(timestampRaw * 1000).toLocaleString();
        const energyTypeMapping = ["Solar", "Wind", "Biomass", "Tidal"];
        const energyType = energyTypeMapping[energyTypeRaw] || "Unknown";
  
        // // Update state with formatted values
        setTotal({ produced, consumed, timestamp, energyType });
        console.log("Formatted totalEnergy:", { produced, consumed, timestamp, energyType });
      } catch (error) {
        console.error("Error fetching total energy:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (contract && address) {
      fetchTotalEnergy();
    }
  }, [address, contract]);
  
  
  

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Energy Produced</h3>
          <BatteryCharging className="h-4 w-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold"></div>
        <p className="text-xs text-gray-500">+20.1% from last month</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Energy Sold</h3>
          <Battery className="h-4 w-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold">567 kWh</div>
        <p className="text-xs text-gray-500">+10.5% from last month</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Net Earnings</h3>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold">$789.00</div>
        <p className="text-xs text-gray-500">+15.2% from last month</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Active Disputes</h3>
          <Zap className="h-4 w-4 text-gray-500" />
        </div>
        <div className="text-2xl font-bold">3</div>
        <p className="text-xs text-gray-500">-2 from last month</p>
      </div>
    </>
  );
};

export default TransactionsSummary;
