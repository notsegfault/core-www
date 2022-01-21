import React from 'react';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import useETHPrice from '../useETHPrice';
import useYam from '../useYam';

const REFRESH_RATE = 10 * 1000;

const useArbitrageProfit = (strategyID) => {
  const yam = useYam();
  const ethPrice = useETHPrice();

  const [profit, setProfit] = React.useState({
    inToken: DATA_UNAVAILABLE,
    inEth: DATA_UNAVAILABLE,
    inUsd: DATA_UNAVAILABLE
  });

  React.useEffect(() => {
    let interval;

    if (yam && strategyID) {
      update();
      interval = setInterval(update, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, strategyID]);

  React.useEffect(() => {
    const updateUsdAsync = async () => {
      await update();
      if (ethPrice !== DATA_UNAVAILABLE) {
        setProfit(profit => ({
          ...profit,
          inUsd: profit.inEth * ethPrice
        }));
      }
    }

    if (yam) {
      updateUsdAsync();
    }
  }, [yam, ethPrice]);

  async function update() {
    if (!strategyID || strategyID === DATA_UNAVAILABLE) return;
    
    const strategyProfitInReturnToken = await yam.contracts.ARBITRAGECONTROLLER.methods.strategyProfitInReturnToken(strategyID).call();
    const strategyProfitInETH = await yam.contracts.ARBITRAGECONTROLLER.methods.strategyProfitInETH(strategyID).call();

    const inToken = parseFloat(strategyProfitInReturnToken);
    const inEth = parseFloat(strategyProfitInETH) / 1e18;
    let inUsd = (ethPrice !== DATA_UNAVAILABLE) ? inEth * ethPrice : DATA_UNAVAILABLE;

    setProfit({
      inToken,
      inEth,
      inUsd
    });

    console.log("Refresh Strategy Profit")
  }

  return profit;
};

export default useArbitrageProfit;
