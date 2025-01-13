import { useState } from 'react'
import NotificationCard from './NotificationCard'

const mockNotifications = [
  {
    id: '1',
    type: 'transaction',
    title: 'Energy Purchase Successful',
    message: 'You have successfully purchased 100 kWh of solar energy.',
    date: '2023-05-01T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'dispute',
    title: 'Dispute Resolution',
    message: 'Your dispute regarding the billing error has been resolved.',
    date: '2023-04-28T14:30:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Scheduled Maintenance',
    message: 'The platform will undergo maintenance on May 5th from 2 AM to 4 AM UTC.',
    date: '2023-04-25T09:15:00Z',
    read: false,
  },
  {
    id: '4',
    type: 'transaction',
    title: 'Energy Sale Completed',
    message: 'You have successfully sold 50 kWh of wind energy.',
    date: '2023-04-22T16:45:00Z',
    read: true,
  },
]

const Notifications = () => {
  const [filter, setFilter] = useState('all')

  const filteredNotifications = mockNotifications.filter(
    (notification) => filter === 'all' || notification.type === filter
  )

  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="mb-4 flex flex-wrap space-x-2 ">
        <button
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filter === 'transaction' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('transaction')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filter === 'dispute' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('dispute')}
        >
          Disputes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filter === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('system')}
        >
          System
        </button>
      </div>
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}

export default Notifications
