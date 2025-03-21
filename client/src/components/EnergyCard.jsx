import { useEffect, useState } from "react";
import { MdSolarPower, MdWindPower } from "react-icons/md";
import { SiTidal } from "react-icons/si";
import { FcBiomass } from "react-icons/fc";
import PurchaseModal from "./PurchaseModal";
import { useAppKitAccount } from "@reown/appkit/react";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { readOnlyProvider } from "../constant/readProvider";
import { toast } from "react-toastify";
import DisputeForm from "./DisputeForm";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate } from "react-router-dom";
import useContractInstance from "../hook/useContract";

const EnergyCard = ({
  EnergyType,
  Amount,
  Price,
  Producer,
  Available,
  listIndex,
  userType,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { address } = useAppKitAccount();
  const [hasPurchased, setHasPurchased] = useState(false);
  const contract = new Contract(ABI.address, ABI.abi, readOnlyProvider);
  const [escrowIds, setEscrowIds] = useState([]);
  const [isDisputeModalOpen, setDisputeModalOpen] = useState(false);
  const navigate = useNavigate();
  const instance = useContractInstance(true);
  const [escrowId, setEscrowId] = useState(null);

  // console.log(instance)

  const checkPurchaseHistory = async () => {
    if (!contract || !address) return;

    try {
      const provider = new JsonRpcProvider(
        "https://alfajores-forno.celo-testnet.org/"
      );

      if (!provider) {
        console.error("No provider found for the contract.");
        return;
      }

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 9999, 0);

      const filter = contract.filters.EnergyBought(null, address, null, null);
      const events = await contract.queryFilter(filter, fromBlock, "latest");

      setHasPurchased(events.length > 0);
    } catch (error) {
      console.error("Error checking purchase history:", error);
    }
  };

  const getEscrowIdForTransaction = async (userAddress, userType) => {
    if (!contract) return null;

    try {
      const totalEscrows = Number(await contract.escrowCounter());
      let latestEscrowId = null;

      const normalizedUserAddress = userAddress.toLowerCase();

      for (let i = totalEscrows - 1; i >= 0; i--) {
        const escrow = await contract.escrows(i);
        // console.log(escrow)
        const escrowBuyer = escrow.buyer.toLowerCase();
        const escrowSeller = escrow.seller.toLowerCase();

        const isActive = !escrow.released;

        if (
          userType === "Consumer" &&
          escrowBuyer === normalizedUserAddress &&
          isActive
        ) {
          latestEscrowId = i;
          break;
        } else if (
          userType === "Producer" &&
          escrowSeller === normalizedUserAddress &&
          isActive
        ) {
          latestEscrowId = i;
          break;
        }
      }

      if (latestEscrowId !== null) {
        // console.log(`✅ Latest active escrow ID for ${userType}:`, latestEscrowId);
        setEscrowId(latestEscrowId);
      } else {
        console.log(`⚠️ No active escrow found for ${userType}.`);
      }

      return latestEscrowId;
    } catch (error) {
      console.error("❌ Error fetching escrow ID:", error);
    }

    console.log(`⚠️ No active escrow found for ${userType}.`);
    return null;
  };

  // console.log(Available)
  const truncateString = (str) => {
    if (str.length > 10) {
      return `${str.slice(0, 4)}...${str.slice(-4)}`;
    }
    return str;
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const confirmEnergySent = async (escrowId) => {
    try {
      console.log("Received escrowId:", escrowId, typeof escrowId);

      if (escrowId === null || escrowId === undefined) {
        console.error("Invalid escrowId:", escrowId);
        return;
      }

      if (!instance) {
        console.error("Contract instance is undefined");
        return;
      }

      if (!instance.confirmEnergyDelivery) {
        console.error("confirmEnergyDelivery method is undefined");
        return;
      }

      // console.log("Ethers object:", ethers.toBigInt);

      // const escrowIdNumber = Number(escrowId);
      const bigEscrowId = ethers.toBigInt(escrowId);
      console.log(bigEscrowId);

      const fallbackGas = ethers.parseUnits("5000000", "wei");
      const gasEstimate = await instance.confirmEnergyDelivery
        .estimateGas(bigEscrowId)
        .catch(() => fallbackGas);

      const tx = await instance.confirmEnergyDelivery(bigEscrowId, {
        gasLimit: gasEstimate,
      });

      await tx.wait();

      console.log("Transaction:", tx);
      console.log("✅ Energy delivery confirmed for escrow ID:", escrowId);
      toast.success("Energy delivery confirmed ");
    } catch (error) {
      console.error("❌ Error confirming energy delivery:", error);
    }
  };

  const releaseFunds = async (escrowId) => {
    try {
      const escrow = await contract.escrows(escrowId);

      if (escrow.delivered) {
        const tx = await contract.releaseFunds(escrowId);
        await tx.wait();
        toast.success("✅ Funds released for escrow ID:", escrowId);
        navigate("/dashboard");
      } else {
        toast.info("⏳ Escrow not delivered yet. Funds cannot be released.");
      }
    } catch (error) {
      toast.error("❌ Error releasing funds:", error);
    }
  };

  const handleOpenDispute = async (escrowId, reason) => {
    try {
      const escrow = await contract.escrows(escrowId);

      const respondent = userType === "Producer" ? escrow.buyer : escrow.seller;

      const tx = await contract.initiateDispute(respondent, reason);
      await tx.wait();

      console.log("⚖️ Dispute opened for escrow ID:", escrowId);
      toast.success("Dispute submitted successfully!");
    } catch (error) {
      console.error("❌ Error opening dispute:", error);
      toast.error("Failed to submit dispute.");
    }
  };

  useEffect(() => {
    const fetchEscrowIdForUser = async () => {
      if (!contract || !address) return;

      const escrowId = await getEscrowIdForTransaction(address, userType);

      if (escrowId !== null) {
        const escrow = await contract.escrows(escrowId);

        setEscrowIds((prev) =>
          prev.some((e) => e.id === escrowId)
            ? prev
            : [...prev, { id: escrowId, delivered: escrow.delivered }]
        );
      }
    };

    checkPurchaseHistory();
    fetchEscrowIdForUser();
  }, [contract, address]);

  // console.log(hasPurchased)
  // console.log(escrowId)
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer">
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
        {userType === "Consumer" ? (
          hasPurchased ? (
            <div className="flex justify-between">
              <button
                onClick={() => setDisputeModalOpen(true)}
                disabled={!escrowIds[0]?.delivered}
                className={` p-2 rounded-md hover:bg-red-100 transition-colors duration-300 ${
                  escrowIds[0]?.delivered
                    ? "border border-red-500 text-red-500"
                    : "border border-red-300 text-red-300 cursor-not-allowed"
                }`}
              >
                Open Dispute
              </button>
              <button
                className={`p-2 rounded-md transition-colors duration-300 ${
                  escrowIds[0]?.delivered
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-green-200 text-gray-200 cursor-not-allowed"
                }`}
                onClick={() => releaseFunds(escrowIds[0])}
                disabled={!escrowIds[0]?.delivered}
              >
                Release Funds
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={toggleModal}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
              >
                Purchase
              </button>
            </>
          )
        ) : Available ? (
          <>
            {escrowIds.length > 0 && !escrowIds[0][4] && (
              <div className="flex justify-between">
                <button
                  onClick={() => setDisputeModalOpen(true)}
                  className="border border-red-500 text-red-500 p-2 rounded-md hover:bg-red-100 transition-colors duration-300"
                >
                  Open Dispute
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() =>
                    escrowIds.length > 0 && confirmEnergySent(escrowId)
                  }
                  // disabled={escrowIds.length === 0 || !escrowIds[0]?.delivered}
                >
                  Energy sent!
                </button>
              </div>
            )}
          </>
        ) : (
          ""
        )}
      </div>

      {isDisputeModalOpen && (
        <DisputeForm
          escrowId={escrowId}
          isOpen={isDisputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          onSubmit={(reason) => handleOpenDispute(escrowId, reason)}
        />
      )}

      {isModalOpen && (
        <PurchaseModal
          EnergyType={EnergyType}
          Amount={Amount}
          Price={Price}
          Producer={Producer}
          onClose={toggleModal}
          energyIndex={listIndex}
          userType={userType}
        />
      )}
    </div>
  );
};

export default EnergyCard;
