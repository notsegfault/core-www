import React from 'react';
import { useWeb3 } from '.';
import { DATA_UNAVAILABLE, pairInfoMap, getPairFromWrappedPair } from '../yam/lib/constants';

const REFRESH_RATE = 60 * 1000;

/**
 * Retrieves the reserve amount of a given core pair.
 */
const useUniswapPairBalances = (pairName) => {
    const pairInfo = pairInfoMap[pairName] || getPairFromWrappedPair(pairName);
    const wrappedPairName = pairInfo.wrappedPairName;

    const web3 = useWeb3();
    const [balances, setBalances] = React.useState({
        balanceToken: DATA_UNAVAILABLE,
        balanceCore: DATA_UNAVAILABLE,
    });

    React.useEffect(() => {
        let interval;

        if (web3) {
            update();
            interval = setInterval(update, REFRESH_RATE);
        }

        return () => clearInterval(interval);
    }, [web3]);

    async function update() {
        const pair = web3.contracts[wrappedPairName];
        const balances = await pair.methods.getReserves().call();
        let balanceCore;
        let balanceToken;

        if (pairInfo.reserve1.friendlyName === 'CORE') {
            balanceCore = balances.reserve1 / (10**pairInfo.reserve1.decimals);
            balanceToken = balances.reserve0 / (10**pairInfo.reserve0.decimals);
        } else {
            balanceCore = balances.reserve0 / (10**pairInfo.reserve0.decimals);
            balanceToken = balances.reserve1 / (10**pairInfo.reserve1.decimals);
        }

        setBalances({
            balanceToken,
            balanceCore,
        });
    }

    return balances;
};

export default useUniswapPairBalances;
