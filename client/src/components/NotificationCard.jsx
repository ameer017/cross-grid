import { Bell, AlertTriangle, DollarSign, Zap } from "lucide-react";
import { ethers } from "ethers";

const NotificationCard = ({ notification }) => {
  const iconMap = {
    transaction: <DollarSign className="h-5 w-5 text-green-500" />,
    dispute: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    system: <Zap className="h-5 w-5 text-blue-500" />,
    default: <Bell className="h-5 w-5 text-gray-500" />,
  };

  const getIcon = (type) => iconMap[type] || iconMap.default;

  const parseHexToString = (hex) => {
    try {
      return ethers ? ethers.utils.toUtf8String(hex) : hex;
    } catch (error) {
      return hex;
    }
  };

  const { title, message, type, timestamp, read } = notification;
  const parsedNotification = {
    title: parseHexToString(title),
    message: parseHexToString(message),
    type,
    timestamp,
    read,
  };


  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
      <div className="flex-shrink-0 mr-3">
        {getIcon(parsedNotification.type)}
      </div>
      <div className="flex-grow">
        <h2 className="text-lg font-semibold">{parsedNotification.title}</h2>
        <p className="text-gray-600">{parsedNotification.message}</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(parsedNotification.timestamp).toLocaleString()}
        </p>
      </div>
      {!parsedNotification.read && (
        <div className="flex-shrink-0 ml-3">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
