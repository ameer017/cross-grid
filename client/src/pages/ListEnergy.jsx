import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListEnergy = ({ contract }) => {
  const [amount, setAmount] = useState("");
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const fetchDynamicPrice = async () => {
    try {
      const price = await contract.dynamicPrice();
      setDynamicPrice(ethers.utils.formatEther(price));
    } catch (error) {
      console.error("Error fetching dynamic price:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await contract.listEnergy(
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      toast.success("Energy successfully listed!");
      setAmount("");
      navigate("/energy-marketplace");
    } catch (error) {
      console.error("Error listing energy:", error);
      toast.error("Failed to list energy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (contract) fetchDynamicPrice();
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
            {dynamicPrice ? `${dynamicPrice} ETH per kWh` : "Loading..."}
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
