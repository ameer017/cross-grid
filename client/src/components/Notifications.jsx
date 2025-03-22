import { useState, useEffect } from "react";
import NotificationCard from "./NotificationCard";
import ABI from "../util/EnergyTrading.json";
import { Contract } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { readOnlyProvider } from "../constant/readProvider";
import { MdDeleteOutline } from "react-icons/md";
import useContract from "../hook/useContract";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const { address } = useAppKitAccount();
  const instance = useContract(true);

  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allNotifications = await contract.getNotifications(address);

        const formattedNotifications = allNotifications.map((notif) => ({
          title: notif.message,
          timestamp: Number(notif.timestamp),
        }));
        setNotifications(formattedNotifications);
      } catch (error) {
        toast.error("Error fetching notifications");
        console.error("Error details:", error);
      }
    };

    fetchEvents();
  }, [address, contract]);

  const clearNotif = async () => {
    try {
      if (!instance) {
        throw new Error("Contract instance not initialized");
      }

      const tx = await instance.clearNotifications();
      await tx.wait();

      setNotifications([]);
      toast.success("Notifications cleared successfully!");
    } catch (error) {
      toast.error("Failed to clear notifications");
      console.error("Error clearing notifications:", error);
    }
  };
  
  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || notification.type === filter
  );

  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="flex justify-between items-center">
        <div className="mb-4 flex space-x-2">
          {["all", "transaction", "dispute", "system"].map((type) => (
            <>
              <button
                key={type}
                className={`px-4 py-2 rounded ${
                  filter === type ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </>
          ))}
        </div>
        <button onClick={clearNotif}>
          <MdDeleteOutline size={25} color="red" />
        </button>
      </div>
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

export default Notifications;
