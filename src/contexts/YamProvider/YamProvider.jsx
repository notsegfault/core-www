import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import { Yam } from '../../yam';
import { CHAIN_ID } from '../../yam/lib/constants';

export const Context = createContext({
  yam: undefined,
});

const YamProvider = ({ children }) => {
  const { ethereum } = useWallet();
  const [yam, setYam] = useState();

  useEffect(() => {
    if (ethereum) {
      const yam = new Yam(ethereum, CHAIN_ID, false, {
        defaultAccount: '',
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      });
      setYam(yam);

      // Useful to do tests using chrome devtools.
      window.yam = yam;
    }
  }, [ethereum]);

  return <Context.Provider value={{ yam }}>{children}</Context.Provider>;
};

export default YamProvider;
