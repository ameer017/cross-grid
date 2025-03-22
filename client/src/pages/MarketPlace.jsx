import EnergyList from "../components/EnergyList";
import { Contract, ethers } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { useEffect, useState } from "react";
import { readOnlyProvider } from "../constant/readProvider";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";

const MarketPlace = () => {
  const { address } = useAppKitAccount();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);
  const { isConnected } = useAppKitAccount();
  const [userType, setUserType] = useState("");
  const [userList, setUserList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const users = await contract.getAllUsers();
        setUserList(users);

        const userAdd = users.find(
          (item) => item.toLowerCase() === address.toLowerCase()
        );

        if (userAdd) {
          const profile = await contract.users(userAdd);

          const [name, userTypeValue, registered] = [
            profile[0],
            profile[1],
            profile[2],
          ];

          const userType = userTypeValue === 1n ? "Producer" : "Consumer";

          setUserProfile({
            name,
            userType,
            registered: registered ? "Yes" : "No",
          });
          setUserType(userType);
        } else {
          console.log("User not found in the contract");
        }
      } catch (error) {
        toast.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [address, contract]);

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
          Available: item.active,
        }));

        setData(formattedData);
        // console.log(data);
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
        <EnergyList data={data} userType={userType} contract={contract} />
      </div>
    </>
  );
};

export default MarketPlace;
