import React, { useState } from 'react';

const DisputeForm = ({ onSubmit }) => {
  const [respondent, setRespondent] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ respondent, reason });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={respondent}
        onChange={(e) => setRespondent(e.target.value)}
        placeholder="Respondent Address"
        className="border p-2 w-full"
        required
      />
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for dispute"
        className="border p-2 w-full"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Dispute
      </button>
    </form>
  );
};

export default DisputeForm;
