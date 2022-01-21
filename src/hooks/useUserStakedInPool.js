import React from 'react'
import BigNumber from 'bignumber.js';
import useYam from "./useYam";
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const REFRESH_RATE = 30 * 1000;

const useUserStakedInPool = (pid, address) => {
  const yam = useYam();
  const [userStaked, setUserStaked] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam && address) {
      refresh();
      interval = setInterval(refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, address]);

  async function refresh() {
    const staked = await yam.contracts.COREVAULT.methods.userInfo(pid, address).call();
    setUserStaked(new BigNumber(staked.amount));
  }

  return {
    value: userStaked,
    refresh
  }
};

export default useUserStakedInPool;
