import React, { useEffect, useState } from "react";
import useContract from "../hook/useContract";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppKitAccount } from "@reown/appkit/react";
import { Contract } from "ethers";
import { readOnlyProvider } from "../constant/readProvider";
import ABI from "../util/EnergyTrading.json";

const Register = () => {
  const { address } = useAppKitAccount();
  const [name, setName] = useState("");
  const [userType, setUserType] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [eventMessage, setEventMessage] = useState("");
  const [alreadyUser, setAlreadyUser] = useState();

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  // console.log(address)
  const navigate = useNavigate();
  const instance = useContract(true);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const allUsers = await contract.getAllUsers();

        // console.log(allUsers);

        const user = allUsers.find(
          (user) => user.toLowerCase() === address.toLowerCase()
        );

        // console.log(user);

        if (!user) {
          setAlreadyUser(null);
          toast.info("not a user");
        }

        if (user) {
          const isUserType = await contract.users(user);
          const [name, userTypeValue, registered] = [
            isUserType[0],
            isUserType[1],
            isUserType[2],
          ];

          console.log;
          const type = userTypeValue === 1n ? "Producer" : "Consumer";

          setAlreadyUser(type);
          toast.info("already a user");
        }
      } catch (error) {
        toast.error("Error fetching user profile:", error);
      }
    };

    fetchUserType();
  }, [address, contract]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setEventMessage("");

    try {
      if (!instance) {
        throw new Error("Contract not initialized");
      }

      if (!name.trim()) {
        throw new Error("Name is required");
      }
      if (userType === "None") {
        throw new Error("Please select a valid user type");
      }

      // Convert userType to corresponding value (Producer: 0, Consumer: 1)
      const userTypeValue = userType === "Producer" ? 1 : 2;

      // console.log("User Type Value:", userTypeValue);

      const gasEstimate = await instance.registerUser.estimateGas(
        name,
        userTypeValue
      );

      // Send the transaction with the estimated gas limit
      const tx = await instance.registerUser(name, userTypeValue, {
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100),
      });

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      setMessage("User registered successfully!");
      toast.success("User registered successfully!");

      instance.once("UserRegistered", (user, userType) => {
        const userTypeText = userType === 1 ? "Producer" : "Consumer";
        setEventMessage(
          `Event: User Registered - Address: ${user}, Type: ${userTypeText}`
        );
        toast.info(`Event emitted: ${userTypeText} registered!`);
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // console.log(userType)

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6 lg:px-8">
        {alreadyUser ? (
          <p>Already Registered as: {alreadyUser}</p>
        ) : (
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
              Register User
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="userType"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Type
                </label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="None">none</option>
                  <option value="Producer">Producer</option>
                  <option value="Consumer">Consumer</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#476124] hover:bg-green-700 focus:ring-green-500"
                  }`}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>

            {message && (
              <p
                className={`mt-4 text-sm font-medium  ${
                  message.startsWith("Error")
                    ? "text-red-500 "
                    : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}

            {eventMessage && (
              <p className="mt-4 text-sm font-medium text-blue-500">
                {eventMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Register;
