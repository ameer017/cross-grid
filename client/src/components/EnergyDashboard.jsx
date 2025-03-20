import { useState } from "react";

import EnergyTypeChart from "./EnergyTypeChart";
import PowerConsumptionChart from "./PowerConsumptionChart";
import DisputesTable from "./DisputesTable";
import TransactionsSummary from "./TransactionsSummary";


const EnergyDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
 
  return (
    <div className="flex-1 space-y-4 mt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Energy Dashboard</h2>
      </div>
      <div className="flex space-x-4 border-b">
        <button
          className={`py-2 px-4 ${
            activeTab === "overview" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "analytics" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "disputes" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("disputes")}
        >
          Disputes
        </button>
      </div>
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <TransactionsSummary />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* <div className="col-span-4 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">
                  Energy Transactions by Type
                </h3>
                <EnergyTypeChart />
              </div>
              <div className="col-span-3 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">
                  Power Consumption
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your daily power consumption over the last 30 days
                </p>
                <PowerConsumptionChart />
              </div> */}
            </div>
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">
                Detailed Energy Analytics
              </h3>
              <p>Detailed analytics content coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === "disputes" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Energy Disputes</h3>
            <DisputesTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyDashboard;
