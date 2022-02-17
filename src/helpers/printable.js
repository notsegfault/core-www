import BigNumber from 'bignumber.js';
import { DATA_UNAVAILABLE } from "../yam/lib/constants";

const getPrintableTokenAmount = (amount, decimals = 18, precision = 4) => {
  if (amount === DATA_UNAVAILABLE) {
    return amount;
  }

  if (BigNumber.isBigNumber(amount)) {
    amount = (decimals ? amount.div(new BigNumber(10).pow(decimals)) : amount);
  }

  if (typeof amount === 'string') {
    amount = amount / 10**decimals;
  }

  if (precision) {
    amount = parseFloat(amount).toFixed(precision);
  } else {
    amount = parseInt(amount);
  }

  return amount;
};

const formatPercent = (percentString, over100PercentFixed) => {
  over100PercentFixed = over100PercentFixed || 0;
  const percent = parseFloat(percentString);

  if (!percent || percent === Infinity || percent === 0) {
    return "0%";
  }
  if (percent < 0.0001 && percent > 0) {
    return "< 0.0001%";
  }
  if (percent < 0 && percent > -0.0001) {
    return "< 0.0001%";
  }
  const fixedPercent = percent.toFixed(2);
  if (fixedPercent === "0.00") {
    return "0%";
  }
  if (Number(fixedPercent) > 0) {
    if (Number(fixedPercent) > 100) {
      return `${percent?.toFixed(over100PercentFixed).toLocaleString()}%`;
    }
    return `${fixedPercent}%`;
  }
  return `${fixedPercent}%`;
};

export default {
  getPrintableTokenAmount,
  formatPercent
};

