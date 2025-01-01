import { Battery, BatteryCharging, DollarSign, Zap } from 'lucide-react'


const TransactionsSummary = () => {
    return (
        <>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Energy Purchased</h3>
              <BatteryCharging className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">1,234 kWh</div>
            <p className="text-xs text-gray-500">
              +20.1% from last month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Energy Sold</h3>
              <Battery className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">567 kWh</div>
            <p className="text-xs text-gray-500">
              +10.5% from last month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Net Earnings</h3>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">$789.00</div>
            <p className="text-xs text-gray-500">
              +15.2% from last month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active Disputes</h3>
              <Zap className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">
              -2 from last month
            </p>
          </div>
        </>
      )
}

export default TransactionsSummary




