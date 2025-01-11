import { useState, useEffect } from 'react';
import NotificationCard from './NotificationCard'
import ABI from "../util/EnergyTrading.json";
import Web3 from 'web3';

const mockNotifications = [
  {
    id: '1',
    type: 'transaction',
    title: 'Energy Purchase Successful',
    message: 'You have successfully purchased 100 kWh of solar energy.',
    date: '2023-05-01T10:00:00Z',
    read: false,
  }
]

const Notifications = () => {
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState([]);

  
  const web3 = new Web3(`https://crossfi-testnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_NODE_URL}`); 
  const contract = new web3.eth.Contract(ABI.abi, ABI.address);


  const filteredNotifications = mockNotifications.filter(
    (notification) => filter === 'all' || notification.type === filter
  )

  useEffect(() => {
    const fetchEvents = async () => {
      try {
       
        const pastEvents = await web3.eth.getLogs({
          address: ABI.address,
          fromBlock: 0,
          toBlock: 'latest',
        });

        
        const parsedEvents = pastEvents.map((log, index) => ({
          id: `${log.transactionHash}-${index}`,
          type: log.event || 'system', 
          title: log.event || 'Event',
          message: JSON.stringify(log.returnValues), 
          date: new Date(log.timestamp * 1000).toISOString(), 
          read: false,
        }));

        
        setNotifications((prev) => [...prev, ...parsedEvents]);
        console.log(notifications)
        
        contract.events
          .allEvents({
            fromBlock: 'latest',
          })
          .on('data', (event) => {
            const newNotification = {
              id: `${event.transactionHash}-${event.logIndex}`,
              type: event.event || 'system',
              title: event.event || 'Event',
              message: JSON.stringify(event.returnValues),
              date: new Date().toISOString(),
              read: false,
            };
            setNotifications((prev) => [newNotification, ...prev]);
          })
          .on('error', console.error);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);
  // return (
  //   <div className="container mx-auto px-4 py-8">
  //     <h1 className="text-3xl font-bold mb-6">Notifications</h1>
  //     <div className="mb-4 flex space-x-2">
  //       <button
  //         className={`px-4 py-2 rounded ${
  //           filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
  //         }`}
  //         onClick={() => setFilter('all')}
  //       >
  //         All
  //       </button>
  //       <button
  //         className={`px-4 py-2 rounded ${
  //           filter === 'transaction' ? 'bg-blue-500 text-white' : 'bg-gray-200'
  //         }`}
  //         onClick={() => setFilter('transaction')}
  //       >
  //         Transactions
  //       </button>
  //       <button
  //         className={`px-4 py-2 rounded ${
  //           filter === 'dispute' ? 'bg-blue-500 text-white' : 'bg-gray-200'
  //         }`}
  //         onClick={() => setFilter('dispute')}
  //       >
  //         Disputes
  //       </button>
  //       <button
  //         className={`px-4 py-2 rounded ${
  //           filter === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200'
  //         }`}
  //         onClick={() => setFilter('system')}
  //       >
  //         System
  //       </button>
  //     </div>
  //     <div className="space-y-4">
  //       {filteredNotifications.map((notification) => (
  //         <NotificationCard key={notification.id} notification={notification} />
  //       ))}
  //     </div>
  //   </div>
  // )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="mb-4 flex space-x-2">
        {['all', 'transaction', 'dispute', 'system'].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded ${
              filter === type ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notifications} />
        ))}
      </div>
    </div>
  );
}

export default Notifications
