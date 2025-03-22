const disputes = [
  {
    id: "1",
    date: "2023-04-01",
    type: "Billing",
    amount: "50 kWh",
    status: "Open",
  },
  {
    id: "2",
    date: "2023-04-05",
    type: "Metering",
    amount: "100 kWh",
    status: "Under Review",
  },
  {
    id: "3",
    date: "2023-04-10",
    type: "Quality",
    amount: "75 kWh",
    status: "Resolved",
  },
];

const DisputesTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {disputes.map((dispute) => (
            <tr key={dispute.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dispute.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dispute.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dispute.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {dispute.status}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button className="text-blue-500 hover:text-blue-700">
                  Add Council Member
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisputesTable;
