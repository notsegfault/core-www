import React from 'react';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from "./useYam";

const useTokenOfUNIPair = (pairAddress, token0) => {
  const yam = useYam();
  console.debug(pairAddress)
  const [tokenAddress, setTokenAddress] = React.useState('');

  React.useEffect(() => {

    if (yam && pairAddress && token0) {
      getTokenAddress();
    }

  }, [yam, pairAddress, token0]);

  async function getTokenAddress() {
    yam.contracts.genericUNIPair.address = pairAddress;
    yam.contracts.genericUNIPair._address = pairAddress;

    const address = token0 ?
      await yam.contracts.genericUNIPair.methods.token0().call()
      :
      await yam.contracts.genericUNIPair.methods.token1().call()
    console.debug('address', address)
    setTokenAddress(address);
  }
  return tokenAddress === '' ? DATA_UNAVAILABLE : tokenAddress;
}

export default useTokenOfUNIPair;

