import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'



const data = [
  { name: 'Solar', total: 400 },
  { name: 'Wind', total: 300 },
  { name: 'Hydro', total: 200 },
  { name: 'Biomass', total: 100 },
  { name: 'Geothermal', total: 50 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow">
        <p className="font-bold">{`${label}`}</p>
        <p>{`${payload[0].value} kWh`}</p>
      </div>
    );
  }
  return null;
};


const EnergyTypeChart = () => {
    return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${value} kWh`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )
}

export default EnergyTypeChart
