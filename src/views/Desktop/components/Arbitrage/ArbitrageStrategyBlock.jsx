import React from 'react';
import { useWallet } from 'use-wallet';
import { useArbitrageProfit, useStrategyName, useTokenOfUNIPair, useYam } from '../../../../hooks';
import useTokenDecimals from '../../../../hooks/useTokenDecimals';
import { WindowsContext } from '../../../../contexts/Windows';
import { ErrorType } from '../../../../contexts/Windows/WindowsProvider';
import { DATA_UNAVAILABLE } from '../../../../yam/lib/constants';
import { extractTokenNameFromArbitrageStrategyName } from '../../../../utils/util';

const ArbitrageStrategyBlock = props => {
  const { strategyID, children } = props;

  const windowsContext = React.useContext(WindowsContext);
  const yam = useYam();
  const wallet = useWallet();
  const projectedProfits = useArbitrageProfit(strategyID);
  const { pairs, token0Out, feeOff, strategyName: name } = useStrategyName(strategyID);

  const [strategyTokenName, setStrategyTokenName] = React.useState(DATA_UNAVAILABLE);

  // FIXME: Display token decimals correctly.
  // const outTokenAddress = useTokenOfUNIPair(pairs?.[0], !token0Out?.[0]);
  // const tokenDecimals = useTokenDecimals(outTokenAddress);
  // const projectedProfitWithDecimals = projectedProfits / tokenDecimals;

  React.useEffect(() => {
    props.setProjectedProfits && props.setProjectedProfits(projectedProfits);
    props.setStrategyName && props.setStrategyName(name);
  }, [projectedProfits, name]);

  React.useEffect(() => {
    if (name) {
      setStrategyTokenName(extractTokenNameFromArbitrageStrategyName(name, token0Out));
    }
  }, name);

  const executeStrategy = async (strategyID) => {
    if (!yam) return;

    const transaction = await yam.contracts.ARBITRAGECONTROLLER.methods.executeStrategy(strategyID)

    try {
      const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

      const tx = await transaction.send( {
        from: wallet.account,
        gas: transactionGasEstimate,
      });

      console.log(`Strategy executed txid - ${tx}`)
    } catch (err) {
      console.debug(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error executing strategy",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
    }
  };

  return <>{children({
    name,
    projectedProfits,
    feeOff,
    strategyTokenName,
    executeStrategy
  })}</>
}

export default ArbitrageStrategyBlock;
