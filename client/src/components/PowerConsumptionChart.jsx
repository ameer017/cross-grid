import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'


const data = [
  { date: 'Jan 1', consumption: 157 },
  { date: 'Jan 2', consumption: 165 },
  { date: 'Jan 3', consumption: 184 },
  { date: 'Jan 4', consumption: 151 },
  { date: 'Jan 5', consumption: 172 },
  { date: 'Jan 6', consumption: 190 },
  { date: 'Jan 7', consumption: 168 },
]

const PowerConsumptionChart = () => {
    return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="consumption" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )
}

export default PowerConsumptionChart
