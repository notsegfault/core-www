import React from 'react'
import BigNumber from 'bignumber.js';
import useYam from "./useYam";
import { useWallet } from 'use-wallet';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import { hooks } from '../helpers';

const REFRESH_RATE = 30 * 1000;

const useUserTokenBalance = tokenName => {
  const yam = useYam();
  const wallet = useWallet();

  const [data, setData] = React.useState({
    balance: DATA_UNAVAILABLE,
    refresh
  });

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    if (!yam || tokenName === 'eth') {
      return;
    }

    if (!(tokenName in yam.contracts)) {
      return;
    }

    const balance = new BigNumber(await yam.contracts[tokenName].methods.balanceOf(wallet.account).call());
    setData(data => ({
      ...data,
      balance,
    }));
  }

  return React.useMemo(() => data, [data.balance])
};

export default useUserTokenBalance;
