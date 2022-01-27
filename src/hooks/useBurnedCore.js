import React from 'react'
import BigNumber from 'bignumber.js';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import { useWeb3 } from '.';

const REFRESH_RATE = 30 * 1000;

const useBurnedCore = tokenName => {
  const web3 = useWeb3();

  const [data, setData] = React.useState({
    burned: DATA_UNAVAILABLE,
    day: DATA_UNAVAILABLE,
    refresh
  });

  React.useEffect(() => {
    let interval;

    if (web3) {
      refresh();
      interval = setInterval(refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [web3]);

  async function refresh() {
    if (!web3) {
      return;
    }
  
    const balance = new BigNumber(await web3.contracts.core.methods.balanceOf('0x5A16552f59ea34E44ec81E58b3817833E9fD5436').call());
    let burned = (new BigNumber('8299802830264467405472')).minus(balance);

    const burnedPerDay = new BigNumber('1185000000000000000000');
    let day = (burned.shiftedBy(18).dividedBy(burnedPerDay)).toString() / 1e18;
    day = Math.ceil(parseFloat(day))

    if(burned.gte(new BigNumber('8200000000000000000000'))) {
      burned = 8300;
    } else {
      burned = Math.ceil(burned.toString() / 1e18);
    }

    setData(data => ({
      ...data,
      day,
      burned,
    }));
  }

  return data;
};

export default useBurnedCore;
