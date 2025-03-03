import { useState, useEffect } from "react";
import { Search, DollarSign } from "lucide-react";
import EnergyCard from "./EnergyCard";

const EnergyList = ({ data, userType, contract }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [filteredListings, setFilteredListings] = useState(data);

  // Re-run the filter whenever the data, searchTerm, or maxBudget changes
  useEffect(() => {
    const isBudgetValid = maxBudget === "" || !isNaN(parseFloat(maxBudget));

    if (!isBudgetValid) {
      alert("Please enter a valid number for the maximum budget.");
      return;
    }

    const filtered = data.filter((listing) => {
      const matchesSearch =
        searchTerm === "" ||
        listing.EnergyType.toLowerCase().includes(searchTerm.toLowerCase());
      const withinBudget =
        maxBudget === "" || listing.Price <= parseFloat(maxBudget);

      return matchesSearch && withinBudget;
    });

    setFilteredListings(filtered);
  }, [data, searchTerm, maxBudget]);

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
            onClick={() => setFilteredListings(filteredListings)}
          >
            Search
          </button>
        </div>
      </div>
      {filteredListings.length === 0 && (
        <div className="h-[60vh] flex items-center justify-center flex-col ">
          <img
            src="https://blogzine.webestica.com/assets/images/icon/empty-cart.svg"
            className="mx-auto w-1/3 "
          />

          <p className=" mt-4 font-bold text-xl ">
            Market is Dry...{" "}
            <span className="text-blue-500"> Try Again later!!</span>
          </p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map((listing, index) => (
          <EnergyCard
            key={index}
            listIndex={index}
            EnergyType={listing.EnergyType}
            Amount={listing.Amount}
            Price={listing.Price}
            Producer={listing.Producer}
            Available={listing.Available}
            userType={userType}
            contract={contract}
          />
        ))}
      </div>
    </div>
  );
};

export default EnergyList;
