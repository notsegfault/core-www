import React from 'react';
import { addressDecimalsMap, DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';


const safeParseJSON = json =>  {
  try{
   return JSON.parse(json)
  }
  catch {
    return undefined;
  }
}

const useTokenDecimals = (tokenAddress) => {
  const yam = useYam();

  const [tokenDecimals, setTokenDecimals] = React.useState('');
  const [isFallBack, setFallback] = React.useState(false)

  React.useEffect(() => {

    if (yam && tokenAddress) {
      gettokenDecimals();
    }

  }, [yam, tokenAddress]);


  async function gettokenDecimals() {
    if (addressDecimalsMap[tokenAddress]) {
      setTokenDecimals(addressDecimalsMap[tokenAddress])
    }

    const savedtokens = safeParseJSON(localStorage.getItem("savedTokens"))
    if(savedtokens?.[tokenAddress]?.decimals) {
      console.log("Readng from saved decimal storage")
      setTokenDecimals(savedtokens[tokenAddress].decimals);
    }


    if(tokenDecimals !== '') return;
    try {
      yam.contracts.genericERC20.address = tokenAddress;
      yam.contracts.genericERC20._address = tokenAddress;
      const decimals = await yam.contracts.genericERC20.methods.decimals().call();
      const savedtokens = safeParseJSON(localStorage.getItem("savedTokens"))
      const newSavedTokens = savedtokens ? {[tokenAddress] : {decimals}, ...savedtokens} : {[tokenAddress] : {decimals}};
      localStorage.setItem('savedTokens', JSON.stringify(newSavedTokens));
      setFallback(false)
      setTokenDecimals(decimals);
    }
    catch {
      console.debug("fallback")
      setFallback(true)
      setTokenDecimals(18); // we default to 18 if no decimals are reported by token
    }
  }

  const returnObject = {
    DATA_UNAVAILABLE : tokenDecimals === '',
    refresh : gettokenDecimals,
    value : tokenDecimals,
    isFallBack
  }
  return React.useMemo(() => returnObject, [tokenDecimals])

}

export default useTokenDecimals;
