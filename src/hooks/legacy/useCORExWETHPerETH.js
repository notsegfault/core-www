import React from 'react'
import { singletonHook } from 'react-singleton-hook';
import useYam from './useYam';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useLGEEndTime from './useLGEEndTime';

const REFRESH_RATE = 30 * 1000;
const initialState = '';

const useCORExWETHPerETH = () => {
  const yam = useYam();
  const endingTime = useLGEEndTime();

  const [CORELPPerWeth, setCORELPPerWETH] = React.useState(initialState);
  React.useEffect(() => {
    let interval;

    if (yam) {
      getTotal();

      // Just call it once unless we don't have a number yet
      if (CORELPPerWeth === '' && Date.now() >= endingTime * 1000) {
        interval = setInterval(getTotal, REFRESH_RATE);
      }
    }

    return () => clearInterval(interval);
  }, [yam]);

  async function getTotal() {
    const lpPerETH = await yam.contracts.core.methods.LPperETHUnit().call();
    setCORELPPerWETH(lpPerETH);
  }

  return CORELPPerWeth === '' ? DATA_UNAVAILABLE : CORELPPerWeth;
};

export default singletonHook(initialState, useCORExWETHPerETH);
