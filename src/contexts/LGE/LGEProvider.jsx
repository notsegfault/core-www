import LGEContext from './LGEContext';
import React from 'react';
import { transactions } from '../../helpers';

const claim = async (yam, wallet, lgeName, autoStake) => {
  const transaction = autoStake ?
    yam.contracts[lgeName].methods.claimAndStakeLP() :
    yam.contracts[lgeName].methods.claimLP()

  try {
    await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: 400000
    });
  } catch (error) {
    error = transactions.getTransactionError(error);
    throw error;
  }
};

const claimFromMigrations = async (yam, wallet) => {
  const transaction = yam.contracts.COREFORKMIGRATOR.methods.claimLP();

  try {
    await transaction.estimateGas({ from: wallet.account });

    await transaction.send({
      from: wallet.account,
      gas: 400000
    });
  } catch (error) {
    error = transactions.getTransactionError(error);
    throw error;
  }
};

const LGEProvider = ({ children }) => {
  const value = {
    claim,
    claimFromMigrations
  };

  return <LGEContext.Provider value={value}>{children}</LGEContext.Provider>;
};

export default LGEProvider;
