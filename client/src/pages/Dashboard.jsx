import { useState, useEffect } from "react";
import { Contract } from "ethers";
import EnergyDashboard from "../components/EnergyDashboard";
import { useAppKitAccount } from "@reown/appkit/react";
import ABI from "../util/EnergyTrading.json";
import { readOnlyProvider } from "../constant/readProvider";
import { toast } from "react-toastify";
import { Triangle } from "react-loader-spinner";

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

          const [name, userTypeValue, registered] = [user[0], user[1], user[2]];

          const userType = userTypeValue === 1n ? "Producer" : "Consumer";

          setUserProfile({
            name,
            userType,
            registered: registered ? "Yes" : "No",
          });
          // console.log(userProfile)
        } else {
          console.log("User not found in the contract");
        }
      } catch (error) {
        toast.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchUserProfile();
    }
  }, [address, contract]);
  // console.log(userProfile.userType)

  return (
    <>
      <div className="px-20 pt-40">
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-[85vh] ">
              <Triangle
                visible={true}
                height="80"
                width="80"
                color="#00FFFF"
                ariaLabel="triangle-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          ) : userProfile ? (
            <>
              <div className="mb-8">
                {/* <h1 className="text-2xl font-bold">User Profile</h1> */}
                <p className="text-gray-800 text-xl">Name: {userProfile.name}</p>
                <p className="text-gray-600 text-sm"> {userProfile.userType}</p>
              </div>
              <EnergyDashboard />
            </>
          ) : (
            <p>User not found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
