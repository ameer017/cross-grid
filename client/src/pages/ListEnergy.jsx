import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Contract } from "ethers";
import ABI from "../util/EnergyTrading.json";
import useContract from "../hook/useContract";
import { readOnlyProvider } from "../constant/readProvider";

const ListEnergy = () => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [energyType, setEnergyType] = useState("");

  const instance = useContract(true);
  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);

  // console.log(instance)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    if (!energyType) {
      toast.error("Please select an energy type.");
      return;
    }

    if (!price || isNaN(price) || price <= 0) {
      toast.error("Please include a valid price per kWh.");
      return;
    }

    if (!instance) {
      toast.error("Contract not initialized");
      return;
    }

    setIsSubmitting(true);

    try {
      const energyTypeMapping = {
        solar: 0,
        wind: 1,
        biomass: 2,
        tidal: 3,
      };

      const energyTypeValue = energyTypeMapping[energyType];
      if (energyTypeValue === undefined) {
        toast.error("Invalid energy type selected.");
        return;
      }

      // const formattedAmount = ethers.parseUnits(amount.toString(), "ether");
      const formattedPrice = ethers.parseUnits(price.toString(), "ether");
      // console.log("Formatted Amount:", formattedAmount.toString());
      console.log("Formatted Price:", formattedPrice.toString());
      console.log("Energy Type Value:", energyTypeValue);

      let estimatedGas;
      try {
        estimatedGas = await instance.listEnergy.estimateGas(
          amount,
          formattedPrice,
          energyTypeValue
        );
        console.log("Estimated Gas:", estimatedGas.toString());
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        toast.error("Gas estimation failed. Please check inputs.");
        return;
      }

      const tx = await instance.listEnergy(
        amount,
        formattedPrice,
        energyTypeValue,
        {
          gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
        }
      );
      console.log("Transaction sent:", tx);

      const receipt = await tx.wait();
      console.log("final tx:", receipt);
      toast.success("Energy successfully listed!");
      setAmount("");
      setPrice("");
      setEnergyType("");
      navigate("/energy-marketplace");
    } catch (error) {
      console.error("Error listing energy:", error);
      toast.error("Failed to list energy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!contract) return;
      try {
        const price = await contract.dynamicPrice();
        setDynamicPrice(ethers.formatEther(price));
      } catch (error) {
        console.error("Error fetching dynamic price:", error);
      }
    };

    fetchDynamicPrice();
  }, [contract]);

  return (
    <main className="bg-gray-100 min-h-screen">
      <section className="bg-gradient-to-r from-green-600 to-blue-500 text-white py-16 text-center mt-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">List Your Energy</h1>
          <p className="mt-4 text-lg">
            Join the energy revolution by listing your renewable energy.
          </p>
          <p className="mt-4 text-lg font-semibold">
            Current Price:{" "}
            {dynamicPrice ? `${dynamicPrice} ETC per kWh` : "Loading..."}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            List Your Energy
          </h2>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Amount (kWh)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border rounded px-4 py-2 text-gray-800"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Price per kWh (ETC)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price per kWh"
              className="w-full border rounded px-4 py-2 text-gray-800"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Energy Type
            </label>

            <select
              value={energyType}
              onChange={(e) => setEnergyType(e.target.value)}
              className="border p-2 w-full"
              required
            >
              <option value="">Select Energy Type</option>
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="biomass">Bio Mass</option>
              <option value="tidal">Tidal</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-2 px-4 rounded text-white ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : "List Energy"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ListEnergy;
