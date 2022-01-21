import React from 'react';
import BigNumber from 'bignumber.js';
import FannyContext from './FannyContext';
import { addressMap, DATA_UNAVAILABLE, tokenMap } from "../../yam/lib/constants";
import { printable, transactions } from '../../helpers';

const ONE_FANNY = new BigNumber(10).pow(tokenMap[addressMap.fanny].decimals).toString();

/**
 * The formula to calculate the slippage is fot / (1 - fot)
 */
const getSlippage = async (yam) => {
  const fot = await yam.contracts.TRANSFERCHECKER.methods.feePercentX100().call();
  let fotPercent = parseFloat(fot / 10) / 100;

  // Double the slippage as it's both ways.
  fotPercent *= 2;

  return fotPercent / (1 - fotPercent)
}

const claim = async (yam, wallet) => {
  const transaction = yam.contracts.fanny.methods.claimFanny();

  try {
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    const tx = await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });

    const claimId = parseInt(tx.events.Claimed.returnValues[0]);
    return claimId;
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const stake = async (yam, wallet, amount, lockTimeWeeks) => {
  console.log("Inside stake amount is", amount.toString());

  const transaction = lockTimeWeeks === 'burn' ?
    yam.contracts.FANNYVAULT.methods.burnFor25XCredit(amount.toString()) :
    yam.contracts.FANNYVAULT.methods.deposit(amount.toString(), lockTimeWeeks);

  console.log(transaction)
  try {
    await transaction.estimateGas({ from: wallet.account });

    return await transaction.send({
      from: wallet.account,
      gas: 450000
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const withdrawAll = async (yam, wallet) => {
  const transaction = yam.contracts.FANNYVAULT.methods.withdrawAllWithdrawableCORE();

  try {
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const claimFannyRewards = async (yam, wallet) => {
  const transaction = yam.contracts.FANNYVAULT.methods.claimFanny(wallet.account);

  try {
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
}

const buyFannyForCORE = async (yam, wallet) => {
  const slippage = await getSlippage(yam);
  const ratioWithSlippage = new BigNumber(1 + slippage);

  let coreNeededToBuyFanny = await yam.contracts.FannyRouter.methods.CORENeededToBuyFanny(ONE_FANNY).call();
  coreNeededToBuyFanny = new BigNumber(coreNeededToBuyFanny).multipliedBy(ratioWithSlippage).toFixed(0);

  const coreBalance = new BigNumber(await yam.contracts.core.methods.balanceOf(wallet.account).call());

  if (coreBalance.isLessThan(coreNeededToBuyFanny)) {
    throw new Error(`A minimum of ${printable.getPrintableTokenAmount(coreNeededToBuyFanny)} CORE is required.`)
  }

  try {
    console.log(`Buying mininum ${ONE_FANNY / 1e18} FANNY for ${coreNeededToBuyFanny / 1e18} CORE`);

    const transaction = yam.contracts.FannyRouter.methods.buyFannyForCORE(coreNeededToBuyFanny.toString(), ONE_FANNY);
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const buyFannyForETH = async (yam, wallet) => {
  let transactionGasEstimate;
  const transaction = yam.contracts.FannyRouter.methods.buyFannyForETH(ONE_FANNY);

  try {
    transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });
  } catch (e) {
    if (e.message.includes('INSUFFICIENT_INPUT_AMOUNT')) {
      throw new Error('Not enough ETH');
    }
  }

  try {
    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const getCOREAmountForOneFanny = async (yam) => {
  const slippage = await getSlippage(yam);

  try {
    const minCOREOut = await yam.contracts.FannyRouter.methods.CORENeededToBuyFanny(ONE_FANNY).call();

    return {
      COREAmountToBuyOneFanny: (minCOREOut * (1 + slippage)) / 1e18,
      COREAmountToSellOneFanny: (minCOREOut * (1 - slippage)) / 1e18
    }
  } catch {
    // ignore errors
  }

  return {
    COREAmountToBuyOneFanny: DATA_UNAVAILABLE,
    COREAmountToSellOneFanny: DATA_UNAVAILABLE
  };
};

const getETHAmountForOneFanny = async (yam) => {
  const slippage = await getSlippage(yam);

  try {
    const minETHOut = await yam.contracts.FannyRouter.methods.ETHneededToBuyFanny(ONE_FANNY).call();

    return {
      ETHAmountToBuyOneFanny: (minETHOut * (1 + slippage)) / 1e18,
      ETHAmountToSellOneFanny: (minETHOut * (1 - slippage)) / 1e18,
    };
  } catch {
    // ignore errors
  }

  return {
    ETHAmountToBuyOneFanny: DATA_UNAVAILABLE,
    ETHAmountToSellOneFanny: DATA_UNAVAILABLE
  };
};

const sellFannyForETH = async (yam, wallet) => {
  const slippage = await getSlippage(yam);
  const ratioWithoutSlippage = new BigNumber(1 - slippage);
  
  const fannyBalance = await yam.contracts.fanny.methods.balanceOf(wallet.account).call();
  const fannyBalanceCappedToOneMax = BigNumber.minimum(fannyBalance, ONE_FANNY);

  let minETHOut = await yam.contracts.FannyRouter.methods.ETHneededToBuyFanny(fannyBalanceCappedToOneMax).call();
  minETHOut = new BigNumber(minETHOut).multipliedBy(ratioWithoutSlippage).toFixed(0);

  try {
    console.log(`Selling ${fannyBalanceCappedToOneMax / 1e18} (${fannyBalanceCappedToOneMax}) FANNY for mininum ${minETHOut / 1e18} (${minETHOut}) ETH`);

    const transaction = yam.contracts.FannyRouter.methods.sellFannyForETH(fannyBalanceCappedToOneMax.toString(), minETHOut.toString());
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const sellFannyForCORE = async (yam, wallet) => {
  const slippage = await getSlippage(yam);
  const ratioWithoutSlippage = new BigNumber(1 - slippage);
  
  const fannyBalance = await yam.contracts.fanny.methods.balanceOf(wallet.account).call();
  const fannyBalanceCappedToOneMax = BigNumber.minimum(fannyBalance, ONE_FANNY);

  let minCOREOut = await yam.contracts.FannyRouter.methods.CORENeededToBuyFanny(fannyBalanceCappedToOneMax).call();
  minCOREOut = new BigNumber(minCOREOut).multipliedBy(ratioWithoutSlippage).toFixed(0);

  try {
    console.log(`Selling ${fannyBalanceCappedToOneMax / 1e18} FANNY for minimum ${minCOREOut / 1e18} CORE`);

    const transaction = yam.contracts.FannyRouter.methods.sellFannyForCORE(fannyBalanceCappedToOneMax.toString(), minCOREOut.toString());
    const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: transactionGasEstimate
    });
  } catch (error) {
    throw transactions.getTransactionError(error);
  }
};

const FannyProvider = ({ children }) => {
  const value = {
    claim,
    stake,
    withdrawAll,
    getCOREAmountForOneFanny,
    getETHAmountForOneFanny,
    claimFannyRewards,
    buyFannyForCORE,
    buyFannyForETH,
    sellFannyForETH,
    sellFannyForCORE
  };

  return <FannyContext.Provider value={value}>{children}</FannyContext.Provider>;
};

export default FannyProvider;
