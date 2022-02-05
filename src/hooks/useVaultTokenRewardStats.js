import React from 'react';
import { calculateApyStats } from '../utils/util';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from "./useYam";

const REFRESH_RATE = 60 * 1000;

// For LP apy compatiblity
const balanceCore = 1;
const balanceToken = 1;

const useVaultTokenRewardStats = (tokenName) => {
    const yam = useYam();
    const valuePerToken = 1;

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
    }, [yam, valuePerToken]);
  
    async function update() {
      const token = yam.contracts[tokenName];
      const coreGeneratedPerBlock = await yam.contracts.COREVAULT.methods.averageFeesPerBlockEpoch().call();
      const tokensInVault = await token.methods.balanceOf(yam.contracts.COREVAULT._address).call();

      const apyStats = calculateApyStats(tokenName,
                                          coreGeneratedPerBlock,
                                          tokensInVault,
                                          valuePerToken,
                                          balanceCore,
                                          balanceToken);
          
      const lpTokenPricePerDay = valuePerToken * apyStats.dpy;
      const corePerDayPerLP = lpTokenPricePerDay / (balanceToken / balanceCore);
                                      
      setAPY({
        apy: apyStats.roundDownApy,
        corePerDayPerLP
      });
    }
  
    return APY;
  };

  export default useVaultTokenRewardStats;
  