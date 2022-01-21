import React from 'react';
import { calculateApyStats } from '../utils/util';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useUniswapPairBalances from './useUniswapPairBalances';
import useValuePerLPToken from './useValuePerLPToken';
import useYam from "./useYam";

const REFRESH_RATE = 60 * 1000;

const useVaultRewardStats = (pairName) => {
    const yam = useYam();
    const valuePerLPToken = useValuePerLPToken(pairName);
    const { balanceCore, balanceToken } = useUniswapPairBalances(pairName);
  
    const [APY, setAPY] = React.useState({
      apy: DATA_UNAVAILABLE,
      corePerDayPerLp: DATA_UNAVAILABLE
    });

    React.useEffect(() => {
      let interval;

      if (yam) {
        update();
        interval = setInterval(update, REFRESH_RATE);
      }

      return () => clearInterval(interval);
    }, [yam, balanceCore, valuePerLPToken]);
  
    const isInformationReady = () => {
      return valuePerLPToken !== DATA_UNAVAILABLE &&
             balanceCore !== DATA_UNAVAILABLE &&
             balanceToken !== DATA_UNAVAILABLE;
    }

    async function update() {
      if (!isInformationReady()) return;

      const pair = yam.contracts[pairName];
      const coreGeneratedPerBlock = await yam.contracts.COREVAULT.methods.averageFeesPerBlockEpoch().call();
      const lpTokensInVault = await pair.methods.balanceOf(yam.contracts.COREVAULT._address).call();

      const apyStats = calculateApyStats(pairName,
                                          coreGeneratedPerBlock,
                                          lpTokensInVault,
                                          valuePerLPToken,
                                          balanceCore,
                                          balanceToken);
          
      const lpTokenPricePerDay = valuePerLPToken * apyStats.dpy;
      const corePerDayPerLP = lpTokenPricePerDay / (balanceToken / balanceCore);
                                      
      setAPY({
        apy: apyStats.roundDownApy,
        corePerDayPerLP
      });
    }
  
    return APY;
  };

  export default useVaultRewardStats;
  