import React from 'react';
import { useCorePrice, useWeb3 } from '.';
import { singletonHook } from 'react-singleton-hook';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const approximatedBlockPerDay = 6450;
const approximatedBlockPerMonth = Math.ceil((6450 * 365) / 12);

let totalFoTLast30Days;
let fetching;

const calculateApy = (totalFoTLast30Days, totalTokenInVault, tokenPriceInUsd, corePriceInUsd) => {
  const coreGeneratedPerYear = totalFoTLast30Days * (365 / 30);
  const valueGeneratedPerYear = coreGeneratedPerYear * corePriceInUsd;
  const valueOfPoolInToken = totalTokenInVault * tokenPriceInUsd;

  return (valueGeneratedPerYear * 100) / valueOfPoolInToken;
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
      if(process.env.NODE_ENV === "development") {
        totalFoTLast30Days = 10; // 10 CORES
        return;
      };

      if(!totalFoTLast30Days && !fetching) {
        fetching = true;
        console.log("fetching getPastLogs...")

        const vaultAddressHex = "0x000000000000000000000000c5cacb708425961594b63ec171f4df27a9c0d8c9";

        totalFoTLast30Days = (await web3Client.web3.eth.getPastLogs({
            address: "0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7", // Core token
            topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"], // Transfer event
            fromBlock: currentBlock - approximatedBlockPerMonth,
            toBlock: currentBlock
        }))
        .filter(log => !log.removed && log.topics[2] == vaultAddressHex)
        .reduce((totalFoT, log) => {
          return totalFoT + web3Client.web3.eth.abi.decodeParameter("uint256", log.data) / 1e18;
        }, 0);

        console.log("totalFoTLast30Days", totalFoTLast30Days, "core");
      }
    }

    async function update() {
      await fetchLast30DaysCoreFoT();
      const token = web3Client.contracts["coreDAO"];
      const totalTokenInVault = (await token.methods.balanceOf(web3Client.contracts.COREVAULT._address).call()) / 1e18

      const apy = calculateApy(totalFoTLast30Days, totalTokenInVault, 1, corePrice.inUSD);
      console.log("apy", apy, "%");
      setAPY(apy);
    }
  
    return APY;
  };
  
  export default singletonHook(DATA_UNAVAILABLE, useVaultTokenRewardStats);
  