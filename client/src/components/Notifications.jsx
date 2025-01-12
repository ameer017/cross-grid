import { useState, useEffect } from "react";
import NotificationCard from "./NotificationCard";
import ABI from "../util/EnergyTrading.json";
import { ethers, JsonRpcProvider } from "ethers";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);

  const provider = new JsonRpcProvider(
    `https://crossfi-testnet.g.alchemy.com/v2/${
      import.meta.env.VITE_APP_NODE_URL
    }`
  );
  const contract = new ethers.Contract(ABI.address, ABI.abi, provider);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const latestBlock = await provider.getBlockNumber();
        const blockStep = 10000;
        let fromBlock = 0;
        let toBlock = fromBlock + blockStep;

        let allEvents = [];

        while (fromBlock <= latestBlock) {
          toBlock = Math.min(toBlock, latestBlock);

          const logs = await provider.getLogs({
            address: ABI.address,
            fromBlock,
            toBlock,
          });

          const parsedEvents = logs.map((log, index) => ({
            id: `${log.transactionHash}-${index}`,
            type: log.topics[0] || "system",
            title: log.topics[0] || "Event",
            message: JSON.stringify(log.data),
            date: new Date().toISOString(),
            read: false,
          }));

          allEvents = [...allEvents, ...parsedEvents];

          fromBlock = toBlock + 1;
          toBlock = fromBlock + blockStep;

          if (fromBlock > latestBlock) break;
        }

        setNotifications(allEvents);

        provider.on("logs", (log) => {
          const event = contract.interface.parseLog(log);
          const newNotification = {
            id: `${log.transactionHash}-${log.logIndex}`,
            type: event.name || "system",
            title: event.name || "Event",
            message: JSON.stringify(event.args),
            date: new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev]);
        });
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();

    return () => {
      provider.removeAllListeners("logs");
    };
  }, [ABI.address, ABI.abi, provider]);

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || notification.type === filter
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="mb-4 flex space-x-2">
        {["all", "transaction", "dispute", "system"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded ${
              filter === type ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
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
