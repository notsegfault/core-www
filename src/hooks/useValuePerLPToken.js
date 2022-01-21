import React from 'react';
import useYam from "./useYam";
import useUniswapPairBalances from "./useUniswapPairBalances";
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const REFRESH_RATE = 15 * 1000;

const useValuePerLPToken = (pairName) => {
  const yam = useYam();
  const [valuePerLP, setValuePerLP] = React.useState(DATA_UNAVAILABLE);
  const { balanceCore, balanceToken } = useUniswapPairBalances(pairName);
  
  React.useEffect(() => {
    let interval;

    if (yam) {
      update();
      interval = setInterval(update, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, balanceCore]);

  async function update() {
    const pair = yam.contracts[pairName];
    if (balanceCore === DATA_UNAVAILABLE || balanceToken === DATA_UNAVAILABLE) return;

    const valueOfPairPool = balanceToken * 2;
    const totalTokens = await pair.methods.totalSupply().call() / 1e18;
    const valuePerLPToken = valueOfPairPool / totalTokens;
  
    setValuePerLP(valuePerLPToken);
  }

  return valuePerLP;
};

export default useValuePerLPToken;