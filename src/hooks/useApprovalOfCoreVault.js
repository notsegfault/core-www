import React from 'react'
import { useWallet } from 'use-wallet';
import { hooks } from '../helpers';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const REFRESH_RATE = 30 * 1000;

const useApprovalOfCoreVault = pairName => {
  const yam = useYam();
  const wallet = useWallet();

  const [approval, setApproval] = React.useState('');
  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTotal, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTotal() {
    const approved = await yam.contracts[pairName].methods
      .allowance(wallet.account, yam.contracts.COREVAULT._address)
      .call();
    setApproval(approved);
  }

  return approval === '' ? DATA_UNAVAILABLE : approval;
};

export default useApprovalOfCoreVault;
