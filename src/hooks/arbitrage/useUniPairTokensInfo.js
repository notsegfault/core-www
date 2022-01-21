import React from 'react';
import useYam from '../useYam';

export const State = {
  Idle: 0,
  Loading: 1,
  Ready: 2,
  Error: 3
};

const useUniPairTokensInfo = (pairAddress) => {
  const yam = useYam();
  const [info, setInfo] = React.useState({
    state: State.Idle
  });

  React.useEffect(() => {
    if (yam && yam.web3.utils.isAddress(pairAddress)) {
      setInfo({
        state: State.Loading
      })
      fetchTokensInfo();
    }
  }, [yam, pairAddress]);

  async function fetchTokensInfo() {
    try {
      const fetchedInfo = {};
      yam.contracts.genericUNIPair.address = pairAddress;
      yam.contracts.genericUNIPair._address = pairAddress;

      fetchedInfo['token0'] = {
        name: '',
        address: await yam.contracts.genericUNIPair.methods.token0().call()
      }
      fetchedInfo['token1'] = {
        name: '',
        address: await yam.contracts.genericUNIPair.methods.token1().call()
      }

      fetchedInfo.token0.name = await yam.contracts.ARBITRAGECONTROLLER.methods
                                          .getTokenSafeName(fetchedInfo.token0.address)
                                          .call();
      fetchedInfo.token1.name = await yam.contracts.ARBITRAGECONTROLLER.methods
                                          .getTokenSafeName(fetchedInfo.token1.address)
                                          .call();

      setInfo({
        state: State.Ready,
        address: pairAddress,
        ...fetchedInfo
      });
    }
    catch {
      setInfo({
        state: State.Error,
        error: 'Cannot retrieve the token information from the given uniswap pair address.'
      })
    }
  }

  return [info, () => {
    setInfo({
      state: State.Idle
    })
  }];
};

export default useUniPairTokensInfo;