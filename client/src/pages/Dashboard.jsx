import { useState, useEffect } from "react";
import { Contract } from "ethers";
import EnergyDashboard from "../components/EnergyDashboard";
import { useAppKitAccount } from "@reown/appkit/react";
import ABI from "../util/EnergyTrading.json";
import { readOnlyProvider } from "../constant/readProvider";
import { toast } from "react-toastify";
import { Triangle } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { address } = useAppKitAccount();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        const allUsers = await contract.getAllUsers();

        const userAddress = allUsers.find(
          (user) => user.toLowerCase() === address.toLowerCase()
        );

        if (userAddress) {
          const user = await contract.users(userAddress);
          const [name, userTypeValue, registered] = [user[0], user[1], user[2]];
          const userType = userTypeValue === 1n ? "Producer" : "Consumer";

          if (isMounted) {
            setUserProfile({
              name,
              userType,
              registered: registered ? "Yes" : "No",
            });
            setCountdown(null);
          }
        } else {
          if (isMounted) {
            setUserProfile(null);
            if (countdown === null) setCountdown(5);
          }
        }
      } catch (error) {
        toast.error("Error fetching user profile:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (address) {
      fetchUserProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [address, contract]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/get-started");
    }
  }, [countdown, navigate]);

  return (
    <div className="px-20 pt-40">
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-[85vh]">
            <Triangle
              visible={true}
              height="80"
              width="80"
              color="#111827"
              ariaLabel="triangle-loading"
            />
          </div>
        ) : userProfile ? (
          <>
            <div className="mb-8">
              <p className="text-gray-800 text-xl">{userProfile.name}</p>
              <p className="text-gray-600 text-sm">{userProfile.userType}</p>
            </div>
            <EnergyDashboard />
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl font-semibold text-red-600">
              User not found, redirecting to sign-up in {countdown}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
