import React from 'react';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const REFRESH_RATE = 30 * 1000;

const useUserContributed = (address, contractName = 'core') => {
  const yam = useYam();
  const [userAmountContributed, setUserAmountContributed] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam && address) {
      getTotal();
      interval = setInterval(getTotal, REFRESH_RATE);
    }

    async function getTotal() {
      const depositedUser = await yam.contracts[contractName].methods.ethContributed(address).call();
      setUserAmountContributed(depositedUser / 1e18);
    }

    return () => clearInterval(interval);
  }, [yam, address]);

  return userAmountContributed;
};

export default useUserContributed;
