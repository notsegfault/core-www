import React from 'react'
import BigNumber from 'bignumber.js';
import useYam from "./useYam";
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const REFRESH_RATE = 30 * 1000;

const useUserVouchers = (address) => {
  const yam = useYam();
  //const [userStaked, setUserStaked] = React.useState(DATA_UNAVAILABLE);
  const [balances, setBalances] = React.useState({
    lp1: DATA_UNAVAILABLE,
    lp2: DATA_UNAVAILABLE,
    lp3: DATA_UNAVAILABLE,
    total: new BigNumber(0)
  });

  React.useEffect(() => {
    let interval;

    if (yam && address) {
      refresh();
      interval = setInterval(refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, address]);

  async function refresh() {
    /*const staked1 = await yam.contracts.COREVAULT.methods.userInfo(0, address).call();
    const staked2 = await yam.contracts.COREVAULT.methods.userInfo(1, address).call();
    const staked3 = await yam.contracts.COREVAULT.methods.userInfo(2, address).call();
    setUserStaked(staked1.amount.add(staked2.amount).add(staked3.amount));*/

    const lp1 = new BigNumber(await yam.contracts.coreDaoLp1.methods.balanceOf(address).call());
    const lp2 = new BigNumber(await yam.contracts.coreDaoLp2.methods.balanceOf(address).call());
    const lp3 = new BigNumber(await yam.contracts.coreDaoLp3.methods.balanceOf(address).call());
    
    setBalances({
      lp1,
      lp2, 
      lp3, 
      total: lp1.plus(lp2).plus(lp3)
    })
  }

  return {
    value: balances,
    refresh
  }
};

export default useUserVouchers;
