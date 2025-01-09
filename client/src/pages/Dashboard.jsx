import { useState, useEffect } from "react";
import { Contract } from "ethers";
import EnergyDashboard from "../components/EnergyDashboard";
import { useAppKitAccount } from "@reown/appkit/react";
import ABI from "../util/EnergyTrading.json";
import { readOnlyProvider } from "../constant/readProvider";

const Dashboard = () => {
  const { address } = useAppKitAccount();
  const [userProfile, setUserProfile] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const allUsers = await contract.getAllUsers();
        setUserList(allUsers);

        // console.log("All registered users:", allUsers);
        // console.log("Current user's address:", address);

        const userAddress = allUsers.find(
          (user) => user.toLowerCase() === address.toLowerCase()
        );
        // console.log(userAddress);

        if (userAddress) {
          const user = await contract.users(userAddress);
          // console.log("User profile fetched:", user);

          const [userTypeValue, registered] = [user[0], user[1]];

          const userType = userTypeValue === 1n ? "Producer" : "Consumer";

          setUserProfile({
            userType,
            registered: registered ? "Yes" : "No",
          });
          // console.log(userProfile)
        } else {
          console.log("User not found in the contract");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchUserProfile();
    }
  }, [address, contract]);

  return (
    <div className="px-20 pt-40">
      <div>
        {loading ? (
          <p>Loading profile...</p>
        ) : userProfile ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-gray-600">User Type: {userProfile.userType}</p>
            <p className="text-gray-600">
              Registered: {userProfile.registered}
            </p>
          </div>
        ) : (
          <p>User not found</p>
        )}
      </div>
      <EnergyDashboard />
    </div>
  );
};

export default Dashboard;
