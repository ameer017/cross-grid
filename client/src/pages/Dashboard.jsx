import { Contract } from "ethers";
import EnergyDashboard from "../components/EnergyDashboard";
import { useAppKitAccount } from "@reown/appkit/react";
import { readOnlyProvider } from "../util/ReadOnlyProvider";
import ABI from "../util/EnergyTrading.json";

const Dashboard = () => {
  const { address } = useAppKitAccount();

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  const userProfile = contract.getUserProfile(address);
  console.log(userProfile);

  return (
    <div className="px-20 pt-40">
      <div>
        {userProfile ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome, {userProfile.name}</h1>
            <p className="text-gray-600">
              Preference: {userProfile.preferences}
            </p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
      <EnergyDashboard />
    </div>
  );
};

export default Dashboard;
