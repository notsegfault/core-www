import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useWallet } from 'use-wallet';
import { FannyContext } from '../../contexts/Fanny';
import { hooks } from '../../helpers';
import { addressMap, DATA_UNAVAILABLE, tokenMap } from '../../yam/lib/constants';
import useCorePrice from '../useCorePrice';
import useYam from '../useYam';

const REFRESH_RATE = 10 * 1000;
const MAX_SUPPLY = 300;
const initialState = {
  priceInCore: DATA_UNAVAILABLE,
  priceInUSD: DATA_UNAVAILABLE,
  priceInETH: DATA_UNAVAILABLE,
  fannyReserve: DATA_UNAVAILABLE,
  coreReserve: DATA_UNAVAILABLE,
  totalSupply: DATA_UNAVAILABLE,
  fannyBalance: DATA_UNAVAILABLE,
  totalRedeemed: DATA_UNAVAILABLE,
  maxSupply: MAX_SUPPLY,
  COREAmountToBuyOneFanny: DATA_UNAVAILABLE,
  ETHAmountToBuyOneFanny: DATA_UNAVAILABLE,
  COREAmountToSellOneFanny: DATA_UNAVAILABLE,
  ETHAmountToSellOneFanny: DATA_UNAVAILABLE
};

const useFannyInfo = () => {
  const yam = useYam();
  const wallet = useWallet();
  const fannyDecimals = tokenMap[addressMap.fanny].decimals;
  const corePrices = useCorePrice();
  const fannyContext = React.useContext(FannyContext);

  const [info, setInfo] = React.useState(initialState);

  React.useEffect(() => {
    let interval;
    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }
    return () => clearInterval(interval);
  }, [yam, corePrices]);

  React.useEffect(() => {
    if (corePrices.inUSD !== DATA_UNAVAILABLE && corePrices.inETH !== DATA_UNAVAILABLE && info.priceInCore !== DATA_UNAVAILABLE) {
      setInfo(info => ({
        ...info,
        priceInUSD: info.priceInCore * corePrices.inUSD,
        priceInETH: info.priceInCore * corePrices.inETH
      }));
    }
  }, [corePrices, info.priceInCore]);

  async function refresh() {
    if (!yam) return;

    const totalSupply = await yam.contracts.fanny.methods.totalSupply().call() / 10 ** fannyDecimals;
    const fannyBalance = await yam.contracts.fanny.methods.balanceOf(wallet.account).call() / 10 ** fannyDecimals;

    let reserves = DATA_UNAVAILABLE;
    let coreReserve = DATA_UNAVAILABLE;
    let fannyReserve = DATA_UNAVAILABLE;
    let priceInCore = DATA_UNAVAILABLE;
    let priceInUSD = DATA_UNAVAILABLE;
    let priceInETH = DATA_UNAVAILABLE;

    try {
      reserves = await yam.contracts.FANNYxCORE.methods.getReserves().call();
      coreReserve = reserves.reserve0 / 1e18;
      fannyReserve = reserves.reserve1 / 10 ** fannyDecimals;
      priceInCore = coreReserve / fannyReserve;

      if (corePrices.inUSD !== DATA_UNAVAILABLE) {
        priceInUSD = priceInCore * corePrices.inUSD;
        priceInETH = priceInCore * corePrices.inETH
      }
    } catch {
      // Ignore errors if pair doesn't exist yet.
    }

    const { COREAmountToBuyOneFanny, COREAmountToSellOneFanny }  = await fannyContext.getCOREAmountForOneFanny(yam);
    const { ETHAmountToBuyOneFanny, ETHAmountToSellOneFanny } = await fannyContext.getETHAmountForOneFanny(yam);

    setInfo(info => ({
      ...info,
      priceInCore,
      priceInUSD,
      totalSupply,
      fannyReserve,
      coreReserve,
      fannyBalance,
      totalRedeemed: MAX_SUPPLY - totalSupply,
      COREAmountToBuyOneFanny,
      ETHAmountToBuyOneFanny,
      COREAmountToSellOneFanny,
      ETHAmountToSellOneFanny
    }));
  }

  return {
    ...info,
    refresh
  };
};

export default singletonHook(initialState, useFannyInfo);
