import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useWeb3 from './useWeb3';

const REFRESH_RATE = 30 * 1000;

const initialState = {
  fot: DATA_UNAVAILABLE,
};

const useTransferChecker = () => {
  const web3 = useWeb3();
  const [data, setData] = React.useState(initialState);

  React.useEffect(() => {
    let interval;

    if (web3) {
      update();
      interval = setInterval(update, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [web3]);

  async function update() {
    const feePercentX100 = await web3.contracts.TRANSFERCHECKER.methods.feePercentX100().call();

    setData(data => ({
      ...data,
      fot: feePercentX100 / 10,
    }));
  }

  return data;
};

export default singletonHook(initialState, useTransferChecker);
