import { DATA_UNAVAILABLE } from "../yam/lib/constants";

import React from 'react'
import { singletonHook } from 'react-singleton-hook';
import { useWallet } from 'use-wallet';
import useYam from './useYam';
import { hooks } from "../helpers";

const REFRESH_RATE = 30 * 1000;
const initialState = '';

const useWethBalance = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [wethBalance, setWethBalance] = React.useState(initialState);

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTokenBalance, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTokenBalance() {
    const tokenBalance = await yam.web3.eth.getBalance(wallet.account);
    setWethBalance(tokenBalance);
  }

  return wethBalance === '' ? DATA_UNAVAILABLE : wethBalance;
};

export default singletonHook(initialState, useWethBalance);