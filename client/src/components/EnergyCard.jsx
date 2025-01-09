import { MdSolarPower, MdWindPower } from "react-icons/md";
import { SiTidal } from "react-icons/si";
import { FcBiomass } from "react-icons/fc";
const EnergyCard = ({ EnergyType, Amount, Price, Producer }) => {
  const truncateString = (str) => {
    if (str.length > 10) {
      return `${str.slice(0, 4)}...${str.slice(-4)}`;
    }
    return str;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{EnergyType} Energy</h2>

        {EnergyType === "Solar" && (
          <MdSolarPower className="h-6 w-6 text-yellow-500" />
        )}
        {EnergyType === "Tidal" && <SiTidal className="h-6 w-6 text-black" />}
        {EnergyType === "Wind" && (
          <MdWindPower className="h-6 w-6 text-stone-500" />
        )}
        {EnergyType === "Biomass" && (
          <FcBiomass className="h-6 w-6 text-green-500" />
        )}
      </div>
      <p className="text-gray-600 mb-2">Amount: {Amount} kWh</p>
      <p className="text-gray-600 mb-2">Price: {Price} ETC per kWh</p>
      <p className="text-gray-600 mb-4">Seller: {truncateString(Producer)}</p>
      <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300">
        Purchase
      </button>
    </div>
  );
};

export default EnergyCard;
