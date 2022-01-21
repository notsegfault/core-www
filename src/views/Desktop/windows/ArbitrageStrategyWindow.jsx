import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import React from 'react';
import {
  Button,
  Panel,
} from 'react95';
import calcIMG from '../../../assets/img/calc.png';
import ArbitrageStrategyBlock from '../components/Arbitrage/ArbitrageStrategyBlock';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import StrategyInfo from '../components/Arbitrage/StrategyInfo';
import { TransactionButton } from '../../../components/Button';

export const ARBITRAGE_WINDOWNAME_PREFIX = 'uniswap-info-pair';
export const getArbitrageWindowName = strategyID => `${ARBITRAGE_WINDOWNAME_PREFIX}-${strategyID}`;

const ArbitrageStrategyWindow = props => {
  const [projectedProfits, setProjectedProfits] = React.useState(0);
  const [strategyName, setStrategyName] = React.useState(DATA_UNAVAILABLE);
  const { strategyID, title } = props;

  React.useEffect(() => {
    setProjectedProfits(projectedProfits);
  }, [projectedProfits]);

  return (
    <CoreWindow
      {...props}
      icon={calcIMG}
      windowTitle={strategyName}
      width='450px'
      top='24%'
      left='30%'
    >
      <CoreWindowContent>
        <ArbitrageStrategyBlock setProjectedProfits={setProjectedProfits} setStrategyName={setStrategyName} strategyID={`${strategyID}`}>
          {props =>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ textAlign: 'left', margin: '0.5rem' }}>
                <StrategyInfo {...props} />
              </div>
              <div style={{ display: 'flex', alignItems: 'start', alignSelf: 'flex-end' }}>
                <TransactionButton style={{ margin: '1rem', width: '100%' }}
                  onClick={() => props.executeStrategy(strategyID)} text="Execute" textLoading="Executing...">
                </TransactionButton>
              </div>
            </div>
          }
        </ArbitrageStrategyBlock>
      </CoreWindowContent>
    </CoreWindow>
  );
};

export default ArbitrageStrategyWindow;
