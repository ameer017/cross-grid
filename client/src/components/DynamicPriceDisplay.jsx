import React from "react";

const DynamicPriceDisplay = ({ price, onUpdate }) => (
  <div className="p-4 bg-gray-100 rounded-md shadow-md">
    <h3 className="text-lg font-semibold">Dynamic Price</h3>
    <p>{price} Tokens</p>
    <button
      onClick={onUpdate}
      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
    >
      Update Price
    </button>
  </div>
);

export default DynamicPriceDisplay;
