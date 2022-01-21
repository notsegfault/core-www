import React from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useWallet } from 'use-wallet';
import { API_URL } from '../../config/api.config';
import { hooks } from '../../helpers';
import useYam from '../useYam';

const REFRESH_RATE = 10 * 1000;
export const FannyOrdersStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Loaded: 'loaded',
  Refreshing: 'refreshing',
};

const initialState = {
  items: [],
  error: false,
  status: FannyOrdersStatus.Idle
};

const useFannyOrders = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [orders, setOrders] = React.useState(initialState);

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    setOrders(orders => ({
      ...orders,
      status: orders.status === FannyOrdersStatus.Loaded ? FannyOrdersStatus.Refreshing : FannyOrdersStatus.Loading
    }));

    const onchainClaims = await yam.contracts.fanny.methods.allClaimsForAnAddress(wallet.account).call();

    const url = new URL(`/claims/${wallet.account}`, API_URL);
    const response = await fetch(url);

    if (response.status !== 200) {
      setOrders(orders => ({
        ...orders,
        error: 'An error occured while fetching the orders.',
        items: [],
        status: FannyOrdersStatus.Loaded
      }));
      return;
    };

    const jsonResponse = await response.json();
    const offchainClaimedIds = jsonResponse.claims;
    const items = onchainClaims.map(item => ({
      ...item,
      ordered: offchainClaimedIds.indexOf(item.id.toString()) !== -1
    }));

    setOrders(orders => ({
      ...orders,
      error: false,
      items,
      status: FannyOrdersStatus.Loaded
    }))
  }

  return {
    ...orders,
    refresh
  };
};

export default singletonHook(initialState, useFannyOrders);
