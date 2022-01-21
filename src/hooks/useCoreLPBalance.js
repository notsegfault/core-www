import React from 'react'
import { useWallet } from 'use-wallet';
import useYam from './useYam';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import BigNumber from 'bignumber.js';
import { hooks } from '../helpers';

const REFRESH_RATE = 30 * 1000;

const useCoreLPBalance = pairName => {
  const yam = useYam();
  const wallet = useWallet();

  const [coreLPBalance, setCoreLPBalance] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    const contract = yam.contracts[pairName];
    const tokenBalance = await contract.methods.balanceOf(wallet.account).call();
    setCoreLPBalance(new BigNumber(tokenBalance));
  }

  return {
    value: coreLPBalance,
    refresh
  }
};

export default useCoreLPBalance;
