import { useState } from "react";
import { Search, DollarSign } from "lucide-react";
import EnergyCard from "./EnergyCard";

const mockListings = [
  { id: "1", type: "Solar", amount: 100, price: 50, seller: "SolarCo" },
  { id: "2", type: "Wind", amount: 150, price: 60, seller: "WindPower Inc." },
  {
    id: "3",
    type: "Hydro",
    amount: 200,
    price: 75,
    seller: "HydroEnergy Ltd.",
  },
  { id: "4", type: "Biomass", amount: 80, price: 45, seller: "BioPower Co." },
  {
    id: "5",
    type: "Geothermal",
    amount: 120,
    price: 55,
    seller: "GeoEnergy Corp.",
  },
  { id: "6", type: "Solar", amount: 90, price: 48, seller: "SunPower LLC" },
  { id: "7", type: "Wind", amount: 180, price: 70, seller: "Breeze Energy" },
  { id: "8", type: "Hydro", amount: 250, price: 80, seller: "RiverPower Co." },
];

const EnergyList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [filteredListings, setFilteredListings] = useState(mockListings);

  const handleSearch = () => {
    const isBudgetValid = maxBudget === "" || !isNaN(parseFloat(maxBudget));

    if (!isBudgetValid) {
      alert("Please enter a valid number for the maximum budget.");
      return;
    }

    const filtered = mockListings.filter((listing) => {
      const matchesSearch =
        searchTerm === "" ||
        listing.type.toLowerCase().includes(searchTerm.toLowerCase());
      const withinBudget =
        maxBudget === "" || listing.price <= parseFloat(maxBudget);

      return matchesSearch && withinBudget;
    });

    setFilteredListings(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Energy Marketplace</h1>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Energy Type
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="e.g., Solar, Wind, Hydro"
              className="w-full py-2 pl-10 pr-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Max Budget (per kWh)
          </label>
          <div className="relative">
            <input
              type="number"
              id="budget"
              placeholder="Enter max price"
              className="w-full py-2 pl-10 pr-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-end flex-col">
          <p>&nbsp;</p>
          <button
            className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map((listing) => (
          <EnergyCard
            key={listing.id}
            type={listing.type}
            amount={listing.amount}
            price={listing.price}
            seller={listing.seller}
          />
        ))}
      </div>
    </div>
  );
};

export default EnergyList;
