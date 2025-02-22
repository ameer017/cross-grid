import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  DollarSign,
  Type,
  Zap,
} from "lucide-react";
import { Contract, ethers } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { readOnlyProvider } from "../constant/readProvider";
import { GiAxeSword } from "react-icons/gi";

const TransactionsSummary = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [allRecords, setAllRecords] = useState([]);
  const [userEarned, setUserEarned] = useState(0);
  const [userSpent, setUserSpent] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const { address } = useAppKitAccount();
  const [dispute, setDispute] = useState(null);

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  useEffect(() => {
    const fetchTotalEnergy = async () => {
      setLoading(true);
      try {
        const priceInWei = await contract.dynamicPrice();
        const conversionFactor = parseFloat(
          ethers.formatUnits(priceInWei, "ether")
        );

        const formatEnum = (value) => {
          const type = Number(value);
          switch (type) {
            case 0:
              return "Solar";
            case 1:
              return "Wind";
            case 2:
              return "Biomass";
            case 3:
              return "Tidal";
            default:
              return "None";
          }
        };

        const formatUser = (value) => {
          const type = Number(value);
          switch (type) {
            case 1:
              return "Producer";
            case 2:
              return "Consumer";
            default:
              return "None";
          }
        };

        const userType = await contract.getUserType(address);
        setUserType(formatUser(userType));

        // Fetch energy records
        const energyRecord = await contract.getProducedRecords(address);
        const energyConsumed = await contract.getConsumedRecords(address);
        const earned = await contract.userEarned(address);
        const spent = await contract.userSpent(address); // Fetch user's spent value

        setUserEarned(ethers.formatEther(earned));
        setUserSpent(ethers.formatEther(spent)); // Set the user's spent value

        const totalProduced = energyRecord.reduce((acc, record) => {
          const producedValue = parseFloat(record.produced.toString());
          return acc + producedValue;
        }, 0);

        const totalConsumed = energyConsumed.reduce((acc, record) => {
          const consumedValue = parseFloat(record.consumed.toString());
          return acc + consumedValue;
        }, 0);

        contract.on("EnergyBought", (producer, consumer, amount, price) => {
          if (producer === address) {
            setTotalSold(
              (prevTotal) => prevTotal + parseFloat(amount.toString())
            );
          }
        });
        // console.log(totalSold);
        // Format the energy record and store the total produced value
        const formattedRecord = energyRecord.map((record) => {
          const producedValue = record.produced.toString();
          const timestamp = new Date(Number(record.timestamp) * 1000);

          return {
            Produced: producedValue,
            Timestamp: timestamp,
            EnergyType: formatEnum(record.energyType) || record.energyType,
          };
        });

        const fetchDispute = await contract.getAllDisputes();
        // console.log(fetchDispute.length)
        setDispute(fetchDispute.length);

        // console.log(formattedRecord)
        // Update the total produced energy
        setTotal(totalProduced);
        setAllRecords(formattedRecord);
        setTotalConsumed(totalConsumed);
        setLoading(false);
      } catch (error) {
        setLoading(false);
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
      {userType === "Producer" && (
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Produced</h3>
            <BatteryFull className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{`${total.toFixed(2)} kWh`}</div>
          <p className="text-xs text-gray-500">
            +{`${total.toFixed().length}`}% from last month
          </p>
        </div>
      )}

      {userType === "Consumer" && (
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Consumed</h3>
            <BatteryLow className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{`${totalConsumed.toFixed(
            2
          )} kWh`}</div>
        </div>
      )}

      {userType === "Producer" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Energy Sold</h3>
            <Battery className="h-4 w-4 text-gray-500" />
          </div>
          {/* <div className="text-sm font-bold">{`${totalSold.toFixed(2)} kWh`}</div> */}
          <div className="text-sm font-bold">Launching soon!</div>
          <p className="text-xs text-gray-500">+10.5% from last month</p>
        </div>
      )}

      {userType === "Producer" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Net Earnings</h3>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{userEarned} ETC</div>
          {/* <p className="text-xs text-gray-500">+15.2% from last month</p> */}
        </div>
      )}
      {userType === "Consumer" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Net Spending</h3>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{userSpent} ETC</div>
          {/* <p className="text-xs text-gray-500">+15.2% from last month</p> */}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Active Disputes</h3>
          <GiAxeSword className="text-[20px] text-amber-500" />
        </div>
        <div className="text-2xl font-bold">{dispute}</div>
        <p className="text-xs text-gray-500">{dispute}% from last month</p>
      </div>
    </>
  );
};

export default TransactionsSummary;
