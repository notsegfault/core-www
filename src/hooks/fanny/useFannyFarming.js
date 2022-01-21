import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useWallet } from 'use-wallet';
import { hooks } from '../../helpers';
import { BigNumber } from '../../yam';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import useYam from '../useYam';

const REFRESH_RATE = 10 * 1000;
const initialState = {
  vaultAllowance: DATA_UNAVAILABLE,
  claimableFanny: DATA_UNAVAILABLE,
  fanniesLeftToFarm: DATA_UNAVAILABLE,
  totalWithdrawableCORE: DATA_UNAVAILABLE,
  totalDepositedCOREAndNotWithdrawed: DATA_UNAVAILABLE,
  amountCredit: DATA_UNAVAILABLE
};

const useFannyFarming = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [info, setinfo] = React.useState(initialState);

  React.useEffect(() => {
    let interval;
    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }
    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    if (!yam) return;

    const claimableFanny = await yam.contracts.FANNYVAULT.methods.fannyReadyToClaim(wallet.account).call() / 1e18;
    const totalWithdrawableCORE = await yam.contracts.FANNYVAULT.methods.totalWithdrawableCORE(wallet.account).call() / 1e18;
    const totalDepositedCOREAndNotWithdrawed = await yam.contracts.FANNYVAULT.methods.totalDepositedCOREAndNotWithdrawed(wallet.account).call() / 1e18;
    const fanniesLeftToFarm = await yam.contracts.FANNYVAULT.methods.fanniesLeft().call() / 1e18;
    const vaultAllowance = await yam.contracts.core.methods.allowance(wallet.account, yam.contracts.FANNYVAULT._address).call();
    const amountCredit = (await yam.contracts.FANNYVAULT.methods.userInfo(wallet.account).call()).amountCredit / 1e18;

    setinfo(info => ({
      ...info,
      claimableFanny,
      fanniesLeftToFarm,
      totalWithdrawableCORE,
      totalDepositedCOREAndNotWithdrawed,
      amountCredit,
      vaultAllowance: new BigNumber(vaultAllowance),
    }));
  }

  return {
    ...info,
    refresh
  };
};

export default singletonHook(initialState, useFannyFarming);
