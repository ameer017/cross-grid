import { useState } from "react";
import { motion } from "framer-motion";

const DisputeForm = ({ isOpen, onClose, onSubmit, escrowId }) => {
  const [reason, setReason] = useState("");
  // console.log(escrowId)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Open a Dispute
        </h2>
        <p className="text-gray-700 mb-3">
          Please describe the reason for opening this dispute.
        </p>
        <textarea
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
          rows="4"
          placeholder="Enter your dispute reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end mt-4 space-x-3">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            onClick={() => {
              if (reason.trim()) {
                // remove space from both beginning and the end.
                onSubmit(reason);
                onClose();
              }
            }}
          >
            Initiate Dispute
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DisputeForm;
