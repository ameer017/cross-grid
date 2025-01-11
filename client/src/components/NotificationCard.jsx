import { Bell, AlertTriangle, DollarSign, Zap } from 'lucide-react'

const NotificationCard = ({ notifications }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'transaction':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'dispute':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'system':
        return <Zap className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div
     
    >
      {/* <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{getIcon(notification.type)}</div>
        <div className="flex-grow">
          <h2 className="text-lg font-semibold">{notification.title}</h2>
          <p className="text-gray-600">{notification.message}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(notification.date).toLocaleString()}
          </p>
        </div>
        {!notification.read && (
          <div className="flex-shrink-0 ml-3">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
          </div>
        )}
      </div> */}
    </div>
  )
}

export default NotificationCard
