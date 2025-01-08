import { useEffect } from "react";
import { ethers } from "ethers";

const useEventListener = (contract, eventName, callback) => {
  useEffect(() => {
    if (!contract || !eventName || !callback) return;

    const listener = (...args) => {
      const event = args[args.length - 1];
      callback({
        eventName,
        args,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });
    };

    contract.on(eventName, listener);

    return () => {
      contract.off(eventName, listener);
    };
  }, [contract, eventName, callback]);
};


export default useEventListener;