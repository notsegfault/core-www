import React from 'react';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import useYam from '../useYam';

const useArbitrageStrategyCount = () => {
  const yam = useYam();

  const [numberStrategies, setNumberStrategies] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      getNumber();
      interval = setInterval(getNumber, 60000);
    }

    return () => clearInterval(interval);
  }, [yam]);

  async function getNumber() {
    const strategies = await yam.contracts.ARBITRAGECONTROLLER.methods.numberOfStrategies().call();
    setNumberStrategies(strategies);

  }
  return numberStrategies === '' ? DATA_UNAVAILABLE : numberStrategies;
};

export default useArbitrageStrategyCount;
