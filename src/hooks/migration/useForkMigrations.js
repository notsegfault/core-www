import React from 'react';
import BigNumber from 'bignumber.js';
import { useWallet } from 'use-wallet';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import useYam from '../useYam';
import { hooks } from '../../helpers';
import moment from 'moment';

const REFRESH_RATE = 60 * 1000;

const useForkMigrations = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [data, setData] = React.useState({
    LPDebtForUser: DATA_UNAVAILABLE,
    encoreCreditedEth: DATA_UNAVAILABLE,
    unicoreCreditedEth: DATA_UNAVAILABLE,
    tensCreditedEth: DATA_UNAVAILABLE,
    endDateInMilliseconds: DATA_UNAVAILABLE,
    claimed: DATA_UNAVAILABLE,
  });

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, refresh, REFRESH_RATE);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function refresh() {
    const response = await yam.contracts.COREFORKMIGRATOR.methods.getOwedLP(wallet.account).call({ from: wallet.account });
    const secondsLeft = parseInt(await yam.contracts.COREFORKMIGRATOR.methods.getSecondsLeftToClaimLP().call());
    const endDateInMilliseconds = moment().add(secondsLeft, 'seconds').valueOf();
    const claimClosed = secondsLeft <= 0 || isNaN(endDateInMilliseconds);
  
    const LPDebtForUser = new BigNumber(response.LPDebtForUser);
    const encoreCreditedEth = new BigNumber(response.encoreCreditedEth);
    const tensCreditedEth = new BigNumber(response.tensCreditedEth);
    const unicoreCreditedEth = new BigNumber(response.unicoreCreditedEth);

    const claimed = LPDebtForUser.lte(0);

    setData(data => ({
      ...data,
      endDateInMilliseconds,
      claimed,
      claimClosed,
      LPDebtForUser,
      encoreCreditedEth,
      tensCreditedEth,
      unicoreCreditedEth,
    }));
  }

  return {
    ...data,
    refresh
  };
};

export default useForkMigrations;
