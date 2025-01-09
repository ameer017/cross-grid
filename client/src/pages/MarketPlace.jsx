import EnergyList from "../components/EnergyList";
import { Contract, ethers } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { useEffect, useState } from "react";
import { readOnlyProvider } from "../constant/readProvider";

const MarketPlace = () => {
  const [data, setData] = useState([]);
  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const datas = await contract.fetchAllEnergyListings();

        const formattedData = datas.map((item) => {
          const producedValue = item.amount.toString();

          return {
            Producer: item.producer,
            Amount: producedValue,
            Price: ethers.formatUnits(item.price, "ether"),
            EnergyType: formatEnum(item.energyType),
          };
        });

        setData(formattedData);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="px-20 pt-40">
      <EnergyList data={data} />
    </div>
  );
};

export default MarketPlace;
