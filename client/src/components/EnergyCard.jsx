import { useEffect, useState } from "react";
import { MdSolarPower, MdWindPower } from "react-icons/md";
import { SiTidal } from "react-icons/si";
import { FcBiomass } from "react-icons/fc";
import PurchaseModal from "./PurchaseModal";
import { useAppKitAccount } from "@reown/appkit/react";
import { Contract, JsonRpcProvider } from "ethers";
import ABI from "../util/EnergyTrading.json";
import { readOnlyProvider } from "../constant/readProvider";
import { toast } from "react-toastify";
import DisputeForm from "./DisputeForm";

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

  const getEscrowIdForTransaction = async (buyer, price) => {
    if (!contract) return null;

    try {
      const totalEscrows = await contract.escrowCounter();
      // console.log(totalEscrows)
      for (let i = 0; i < totalEscrows; i++) {
        const escrow = await contract.escrows(i);

        if (
          escrow.buyer.toLowerCase() === buyer.toLowerCase() &&
          escrow.amount.toString() === price.toString()
        ) {
          return i;
        }
      }
    } catch (error) {
      console.error("Error fetching escrow ID:", error);
    }

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
      const tx = await contract.confirmEnergyDelivery(escrowId);
      await tx.wait();
      console.log("Energy delivery confirmed for escrow ID:", escrowId);
      toast.success("Energy delivery confirmed ");
    } catch (error) {
      console.error("Error confirming energy delivery:", error);
    }
  };

  const releaseFunds = async (escrowId) => {
    try {
      const tx = await contract.releaseFunds(escrowId);
      await tx.wait();
      console.log("Funds released for escrow ID:", escrowId);
    } catch (error) {
      console.error("Error releasing funds:", error);
    }
  };

  const handleOpenDispute = async (escrowId, reason) => {
    try {
      const escrow = await contract.escrows(escrowId);
      const respondent = escrow.seller;

      const tx = await contract.initiateDispute(respondent, reason);
      await tx.wait();
      console.log("Dispute opened for escrow ID:", escrowId);
      toast.success("Dispute submitted successfully!");
    } catch (error) {
      console.error("Error opening dispute:", error);
      toast.error("Failed to submit dispute.");
    }
  };

  useEffect(() => {
    const fetchEscrowIdForUser = async () => {
      if (!contract || !address) return;

      const escrowId = await getEscrowIdForTransaction(address, Price);
      if (escrowId !== null) {
        setEscrowIds((prev) => [...prev, escrowId]);
      }
    };

    checkPurchaseHistory();
    fetchEscrowIdForUser();
  }, [contract, address, Price]);

  // console.log(hasPurchased)
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
                className="border border-red-500 text-red-500 p-2 rounded-md hover:bg-red-100 transition-colors duration-300"
              >
                Open Dispute
              </button>
              <buton
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors duration-300"
                onClick={() => releaseFunds(escrowIds[0])}
              >
                Release Funds
              </buton>
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
          <button
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
            onClick={() => confirmEnergySent(escrowIds[0])}
          >
            Energy sent successfully!
          </button>
        ) : (
          <p className="text-gray-200">Order listed.... Be on the lookout!!</p>
        )}
      </div>

      {isDisputeModalOpen && (
        <DisputeForm
          escrowId={escrowIds[0]}
          isOpen={isDisputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          onSubmit={(reason) => handleOpenDispute(escrowIds[0], reason)}
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
