import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../util/EnergyTrading.json";
import useToken from "../hook/useTokenContract";
import useContractInstance from "../hook/useContract";

const PurchaseModal = ({
  EnergyType,
  Amount,
  Price,
  Producer,
  onClose,
  energyIndex,
  userType,
}) => {
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const { address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [eventMessage, setEventMessage] = useState("");
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [escrowIds, setEscrowIds] = useState([]);

  const estimatedKWh =
    purchaseAmount && !isNaN(purchaseAmount)
      ? (parseFloat(purchaseAmount) / Price).toFixed(2)
      : "0";

  const navigate = useNavigate();
  const instance = useContractInstance(true);
  const tokenInstance = useToken(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setEventMessage("");

    try {
      if (!instance) {
        throw new Error("Contract not initialized");
      }

      const amountInTokens = ethers.parseUnits(purchaseAmount);
      const realindex = energyIndex.toString();

      const approveTx = await tokenInstance.approve(
        CONTRACT_ABI.address,
        amountInTokens
      );
      await approveTx.wait();

      const allowance = await tokenInstance.allowance(
        address,
        CONTRACT_ABI.address
      );
      if (allowance < amountInTokens) {
        throw new Error("Allowance insufficient. Please approve more tokens.");
      }

      let gasEstimate;
      try {
        gasEstimate = await instance.buyEnergy.estimateGas(
          Producer,
          energyIndex,
          amountInTokens
        );
      } catch (error) {
        console.error("Gas estimation failed:", error);
        return toast.error(`Gas estimation failed: ${error.message}`);
      }

      const tx = await instance.buyEnergy(
        Producer,
        energyIndex,
        amountInTokens,
        {
          gasLimit: (gasEstimate * BigInt(120)) / BigInt(100),
        }
      );

      console.log({ Producer, energyIndex, amountInTokens });

      const receipt = await tx.wait();
      console.log(receipt);
      const escrowId = (await instance.escrowCounter()) - 1;

      console.log("Escrow ID for this transaction:", escrowId);

      // Store the escrow ID with this energy purchase
      setEscrowIds((prev) => [...prev, escrowId]);
      setMessage("Energy Purchased successfully!.. Funds in Escrow.");
      setShowActionButtons(true);
      toast.success("Energy Purchased successfully!");

      instance.once("EnergyBought", (producer, consumer, amount, price) => {
        setEventMessage(
          `Event: Energy Bought - ${consumer} bought ${amount} kWh of energy from ${producer} at ${price}`
        );
        toast.info(
          `Event emitted: ${amount} kWh of energy purchased by ${consumer}`
        );
      });
    } catch (error) {
      console.error("Error Purchasing energy:", error);
      setMessage(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg flex flex-col gap-2 shadow-md min-w-[100px]"
      >
        <h2 className="text-xl font-semibold">Confirm Purchase</h2>
        <p className="text-gray-600">Energy Type: {EnergyType}</p>
        <p className="text-gray-600">Amount: {Amount} kWh</p>
        <p className="text-gray-600">Price: {Price} ETC per kWh</p>
        <p className="text-gray-600 break-words w-full">Seller: {Producer}</p>

        <div className="inputField flex items-center justify-between p-3 rounded-2xl bg-gray-100 text-gray-600">
          <input
            className="bg-gray-100 w-[90%] outline-none"
            type="text"
            name="purchaseAmount"
            placeholder="Please enter the amount"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
          />
          <p>ETC</p>
        </div>

        <div className="estimateField flex items-center justify-between p-1 text-gray-400 text-sm">
          <p>You will be receiving</p>
          <p>{estimatedKWh} kWh</p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseModal;
