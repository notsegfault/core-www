import React from 'react';
import { DATA_UNAVAILABLE } from '../yam/lib/constants';
import useYam from './useYam';

const useLGEEndTime = () => {
  const yam = useYam();
  const [endTime, setEndTime] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    if (yam) if (yam) getEndTime();

    async function getEndTime() {
      const endTimeCall = await yam.contracts.core.methods.contractStartTimestamp().call();
      setEndTime(parseInt(endTimeCall) + 7 * 24 * 60 * 60);
    }
  }, [yam]);

  return endTime;
};

export default useLGEEndTime;
