import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const initialState = DATA_UNAVAILABLE;

const useTotalContributed = () => {
  const yam = useYam();
  const [depositedTotal, setDepositedTotal] = React.useState(initialState);

  React.useEffect(() => {
    let interval;

    if (yam) {
      getTotal();
      interval = setInterval(getTotal, 30000);
    }
    async function getTotal() {
      const depositedTotalFromCall = await yam.contracts.core.methods.totalETHContributed().call();
      setDepositedTotal(
        depositedTotalFromCall !== '0' ? depositedTotalFromCall : 100000000000000 / 1e18
      );
    }

    return () => clearInterval(interval);
  }, [yam]);

  return depositedTotal;
};

export default singletonHook(initialState, useTotalContributed);
