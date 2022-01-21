import React from 'react';
import { DATA_UNAVAILABLE } from '../../../../yam/lib/constants';

const SHARE_FEE_OFF = 0.1;
const SHARE_FEE_ON = 0.65;

const StrategyInfo = ({
  name,
  projectedProfits,
  feeOff,
  strategyTokenName
}) => {

  const renderProfit = (profit, precision = 0, ratio = 1) => {
    if (profit === DATA_UNAVAILABLE || isNaN(profit))
      return <>{DATA_UNAVAILABLE}</>;

    return <>{parseFloat(profit * ratio).toFixed(precision)}</>
  };

  const renderCallerShare = () => {
    const ratio = feeOff ? SHARE_FEE_OFF : SHARE_FEE_ON;
    const ratioInPercent = ratio * 100;

    return <span>
       {renderProfit(projectedProfits.inEth, 4, ratio)} ETH ({ratioInPercent}%) in {strategyTokenName}
    </span>
  };

  return <>
    <strong>Projected Execution Profit</strong>: {renderProfit(projectedProfits.inEth, 4)} ETH in {strategyTokenName}<br />
    <strong>Caller Share:</strong> {renderCallerShare()}
  </>
};

export default StrategyInfo;
