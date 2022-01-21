import BigNumber from 'bignumber.js';
import { transactions } from '../helpers';

export const claimCORE = async (yam, wallet, pid) => {
  try {
    let callDeposit = yam.contracts.COREVAULT.methods.deposit(
      pid,
      new BigNumber(0).times(new BigNumber(10).pow(18)).toString()
    );
    await callDeposit.send({
      from: wallet.account,
      gas: 300000,
    });
  } catch (e) {
    throw transactions.getTransactionError(e);
  }
};
