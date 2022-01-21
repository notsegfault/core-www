import React from 'react';
import useYam from './useYam';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const REFRESH_RATE = 30 * 1000;

/**
 * Gets all the pending reward from 1 or many pool pids.
 */
const useUserPoolPending = (pids, address) => {
  if (!Array.isArray(pids)) {
    throw new Error('pids argument must be an array of pids');
  }

  const yam = useYam();
  const [userPendingInPool, setUserPendingInPool] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam && address) {
      refresh();
      interval = setInterval(refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, address]);

  async function refresh() {
    const pendingPerPool = await Promise.all(pids.map(pid => {
      return yam.contracts.COREVAULT.methods.pendingCore(pid, address).call();
    }));

    const pendingPool = pendingPerPool.reduce((total, pending) => total + pending / 1e18, 0);
    setUserPendingInPool(pendingPool);
  }

  return {
    value: userPendingInPool,
    refresh
  };
};

export default useUserPoolPending;
