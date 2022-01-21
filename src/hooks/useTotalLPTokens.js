import React from 'react';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const REFRESH_RATE = 30 * 1000;

const useTotalLPTokens = (pairName) => {
  const yam = useYam();
  const [totalLP, setTotalLP] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    let interval;

    if (yam) {
      update();
      interval = setInterval(update, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam]);

  async function update() {
    const pair = yam.contracts[pairName];
    const total = await pair.methods.totalSupply().call() / 1e18;

    setTotalLP(total);
  }

  return totalLP;
};

export default useTotalLPTokens;
