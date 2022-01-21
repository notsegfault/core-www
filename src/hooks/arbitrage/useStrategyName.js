import React from 'react';
import useYam from "../useYam";
import { DATA_UNAVAILABLE } from "../../yam/lib/constants";

const useStrategyName = strategyID => {
  const yam = useYam();
  const [info, setInfo] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    if (yam && strategyID) {
      fetchInfo();
    }
  }, [yam, strategyID]);

  const fetchInfo = async () => {
    try {
      const info = await yam.contracts.ARBITRAGECONTROLLER.methods.strategyInfo(strategyID).call();
      setInfo(info);
    } catch(e) {
      setInfo(e);
    }
  };

  return info;
};

export default useStrategyName;
