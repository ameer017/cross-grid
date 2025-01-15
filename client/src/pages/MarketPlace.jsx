import EnergyList from "../components/EnergyList";
import { Contract, ethers } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { useEffect, useState } from "react";
import { readOnlyProvider } from "../constant/readProvider";
import { useAppKitAccount } from "@reown/appkit/react";

const MarketPlace = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const energyTypes = {
          0: "Solar",
          1: "Wind",
          2: "Biomass",
          3: "Tidal",
        };

        const datas = await contract.fetchAllEnergyListings();
        if (!datas) {
          throw new Error("No energy listings available");
        }

        const formattedData = datas.map((item) => ({
          Producer: item.producer,
          Amount: item.amount.toString(),
          Price: ethers.formatUnits(item.price, "ether"),
          EnergyType: energyTypes[item.energyType] || "None",
        }));

        setData(formattedData);
      } catch (err) {
        setError(err.message || "Error fetching data");
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading energy listings...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!isConnected) {
    return (
      <p className="text-red-500">
        Connect your wallet to see energy listings.
      </p>
    );
  }

  return (
    <>
      <div className="px-20 pt-40">
        <EnergyList data={data} />
      </div>
    </>
  );
};

export default MarketPlace;
