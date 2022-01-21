import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { ROBOCORE_API_URL } from '../config/api.config';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';

const REFRESH_RATE = 60 * 1000;
const initialState = {
  tll: DATA_UNAVAILABLE,
  tvpl: DATA_UNAVAILABLE
};

const useLiquidityStats = () => {
  const url = new URL('/api/tvpl', ROBOCORE_API_URL);

  const [stats, setStats] = React.useState(initialState);

  React.useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_RATE);
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    const response = await fetch(url);
    const json = await response.json();
    
    const tll = parseInt(json.TLLinUSD) || DATA_UNAVAILABLE;
    const tvpl = parseInt(json.TVPLinUSD) || DATA_UNAVAILABLE;

    setStats({
      tll,
      tvpl
    })
  };

  return stats;
};

export default singletonHook(initialState, useLiquidityStats);
