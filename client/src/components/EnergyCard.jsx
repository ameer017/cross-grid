import { Zap } from 'lucide-react'

const EnergyCard = ({ type, amount, price, seller }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{type} Energy</h2>
        <Zap className="h-6 w-6 text-yellow-500" />
      </div>
      <p className="text-gray-600 mb-2">Amount: {amount} kWh</p>
      <p className="text-gray-600 mb-2">Price: ${price.toFixed(2)} per kWh</p>
      <p className="text-gray-600 mb-4">Seller: {seller}</p>
      <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300">
        Purchase
      </button>
    </div>
  )
}

export default EnergyCard
