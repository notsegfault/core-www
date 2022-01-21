import React from 'react';
import { useWallet } from 'use-wallet';
import { hooks } from '../helpers';
import { BigNumber } from '../yam';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const REFRESH_RATE = 10 * 1000;

const useUserApprovalOfContract = (contract, token) => {
  const yam = useYam();
  const wallet = useWallet();
  const [amount, setAmount] = React.useState(DATA_UNAVAILABLE);
  
  React.useEffect(() => {
    let interval;
    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }
    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    if (!contract || !token) return;

    const amount = new BigNumber(await yam.contracts[token].methods.allowance(wallet.account, yam.contracts[contract]._address).call());
    setAmount(amount);
  }

  return React.useMemo(() => ({
    amount,
    refresh
  }), [amount]);
}

export default useUserApprovalOfContract;
