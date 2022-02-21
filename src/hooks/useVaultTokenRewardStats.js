import React from 'react';
import { useCorePrice, useWeb3 } from '.';
import { singletonHook } from 'react-singleton-hook';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const approximatedBlockPerDay = 7000;
const approximatedBlockPerMonth = Math.ceil((approximatedBlockPerDay * 365) / 12);

let fotStats;
let fetching;

const calculateApy = (fotStats, totalTokenInVault, tokenPriceInUsd, corePriceInUsd) => {
  const valueOfPoolInToken = totalTokenInVault * tokenPriceInUsd;

  return {
    daily: (((fotStats.daily * 365) * corePriceInUsd) * 100) / valueOfPoolInToken,
    weekly: (((fotStats.weekly * (365 / 7)) * corePriceInUsd) * 100) / valueOfPoolInToken,
    monthly: (((fotStats.monthly * (365 / 30)) * corePriceInUsd) * 100) / valueOfPoolInToken,
  }
};

const useVaultTokenRewardStats = () => {
    const web3Client = useWeb3();
    const corePrice = useCorePrice();

    const [APY, setAPY] = React.useState(DATA_UNAVAILABLE);

    React.useEffect(() => {
      if (web3Client && corePrice.inUSD !== DATA_UNAVAILABLE) {
        update(web3Client.web3);
      }
    }, [web3Client, corePrice]);
  
    async function fetchLast30DaysCoreFoT() {
      const currentBlock = await web3Client.web3.eth.getBlockNumber();

      // Avoid spamming the Archive RPC when in dev mode.
      /*if(process.env.NODE_ENV === "development") {
        fotStats = {
          daily: 0.3,
          weekly: 4,
          monthly: 12
        }
        return;
      };*/

      if(!fotStats && !fetching) {
        fetching = true;
        console.log("fetching getPastLogs...")

        const vaultAddressHex = "0x000000000000000000000000c5cacb708425961594b63ec171f4df27a9c0d8c9";

        const logs = (await web3Client.web3.eth.getPastLogs({
            address: "0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7", // Core token
            topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"], // Transfer event
            fromBlock: currentBlock - approximatedBlockPerMonth,
            toBlock: currentBlock
        }))
        .sort((evOne, evTwo) => evOne.blockNumber - evTwo.blockNumber)
        .filter(log => !log.removed && log.topics[2] == vaultAddressHex)

        const min7DaysBlockNumber =  currentBlock - (approximatedBlockPerDay * 7);
        const min24HoursBlockNumber =  currentBlock - approximatedBlockPerDay;

        fotStats = logs.reduce((fotStats, log) => {
          const fot = web3Client.web3.eth.abi.decodeParameter("uint256", log.data) / 1e18;

          if(log.blockNumber >= min24HoursBlockNumber) {
            fotStats.daily += fot;
            fotStats.weekly += fot;
          } else if(log.blockNumber >= min7DaysBlockNumber) {
            fotStats.weekly += fot;
          }
          
          fotStats.monthly += fot;
          fotStats.prevBlock = log.blockNumber;
          return fotStats;
        }, {
          daily: 0,
          weekly: 0,
          monthly: 0,
        });

        console.log("fotStats", fotStats);
      }
    }

    async function update() {
      await fetchLast30DaysCoreFoT();
      const token = web3Client.contracts["coreDAO"];
      const totalTokenInVault = (await token.methods.balanceOf(web3Client.contracts.COREVAULT._address).call()) / 1e18

      const apy = calculateApy(fotStats, totalTokenInVault, 1, corePrice.inUSD);
      console.log("apy", apy, "%");
      setAPY(apy);
    }
  
    return APY;
  };
  
  export default singletonHook(DATA_UNAVAILABLE, useVaultTokenRewardStats);
  