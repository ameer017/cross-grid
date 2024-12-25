import React from 'react';
import NotificationsPage from './NotificationsPage';

const Dashboard = () => {
  const notifications = [
    { message: 'Energy listed successfully.', type: 'success' },
    { message: 'Transaction failed.', type: 'alert' },
  ];

  return (
    <div className="space-y-4 mt-[5rem] ">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {notifications.map((n, idx) => (
        <NotificationsPage key={idx} message={n.message} type={n.type} />
      ))}
    </div>
  );
};

export default Dashboard;
