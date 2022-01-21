import React from 'react';
import BigNumber from 'bignumber.js';
import { useWallet } from 'use-wallet';
import { singletonHook } from 'react-singleton-hook';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';
import { hooks } from '../helpers';

const initialState = DATA_UNAVAILABLE;
const useCoreBalance = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [coreBalance, setCoreBalance] = React.useState(initialState);

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTokenBalance, 30000);
    }
    
    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTokenBalance() {
    const tokenBalance = await yam.contracts.core.methods.balanceOf(wallet.account).call();
    setCoreBalance(tokenBalance);
  }

  return coreBalance;
};

export default singletonHook(initialState, useCoreBalance);

