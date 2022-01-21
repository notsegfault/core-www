import React from 'react'
import useYam from "./useYam";
import { useWallet } from 'use-wallet';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import { transactions } from '../helpers';

const REFRESH_RATE = 30 * 1000;

const useGovernance = (address) => {
  const yam = useYam();
  const wallet = useWallet();
  const [delegatee, setDelegatee] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam && address) {
      refresh();
      interval = setInterval(refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, address]);

  async function refresh() {
    const delegatee = await yam.contracts.COREVAULT.methods.delegates(address).call();
    setDelegatee(delegatee);
  }

  const delegate = async(delegatee) => {
    try {
      const transaction = yam.contracts.COREVAULT.methods.delegate(delegatee);
      const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });
  
      await transaction.send({
        from: wallet.account,
        gas: transactionGasEstimate
      });

      await refresh();
    } catch (error) {
      throw transactions.getTransactionError(error);
    }
  };

  return {
    delegatee,
    delegate,
    refresh
  }
};

export default useGovernance;
