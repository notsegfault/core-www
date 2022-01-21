import React from 'react';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import useYam from '../useYam';

const REFRESH_RATE = 60 * 1000;

const useMostProfitableStrategy = () => {
  const yam = useYam();

  const [profit, setProfit] = React.useState({
    inEth: DATA_UNAVAILABLE,
    strategyID: DATA_UNAVAILABLE
  });

  React.useEffect(() => {
    let interval;

    if (yam) {
      update();
      interval = setInterval(update, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam]);

  async function update() {
    const { profit, strategyID } = await yam.contracts.ARBITRAGECONTROLLER.methods.mostProfitableStrategyInETH().call();
    setProfit({
      inEth: parseFloat(profit)/1e18,
      strategyID
    });
  }

  return profit;
};

export default useMostProfitableStrategy;
