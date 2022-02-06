import React, { useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Web3 from "web3";
import { Button, Fieldset, Anchor, TextField } from 'react95';
import useVaultRewardStats from '../../../hooks/useVaultRewardStats';
import { DATA_UNAVAILABLE, pairInfoMap } from '../../../yam/lib/constants';
import { useWallet } from 'use-wallet';
import modemIMG from '../../../assets/img/modem.png';
import useYam from '../../../hooks/useYam';
import { useUserPoolPending, useUserStakedInPool, useUserTokenBalance, useWeb3 } from '../../../hooks';
import { claimCORE } from '../../../utils';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { getUniswapInfoWindowName } from '../windows/UniswapInfoWindow';
import { getTransactionWindowName } from '../windows/TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import './styles/staking-grid.css';
import { TransactionButton } from '../../../components/Button';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import useGovernance from '../../../hooks/useGovernance';
import BigNumber from 'bignumber.js';
import { printable, transactions } from '../../../helpers';
import {
  useCoreBalance,
  useUserApprovalOfContract,
  useUserVouchers,
} from '../../../hooks';

const MigrationFieldSet = styled(Fieldset)`
  height: auto;
  text-align: left;

  @media only screen and (max-width: 767px) {
    height: auto;
  }
`;
const CoreDAOMigration = () => {
  const wallet = useWallet();
  const yam = useYam();
  const governance = useGovernance();
  const coreDAOBalance = useUserTokenBalance("coreDAO");
  const [delegateeTxt, setDelegateeTxt] = useState('');
  const windowsContext = React.useContext(WindowsContext);
  const useLp1Allowance = useUserApprovalOfContract("CoreDAOTreasury", "coreDaoLp1");
  const useLp2Allowance = useUserApprovalOfContract("CoreDAOTreasury", "coreDaoLp2");
  const useLp3Allowance = useUserApprovalOfContract("CoreDAOTreasury", "coreDaoLp3");
  const userVouchers = useUserVouchers(wallet.account);

  const migrateLpToCoreDAO = async() => {
    try {
      if(!wallet.account) return;

      const confirm = await windowsContext.showConfirm('Migration', <>
        Are you sure you want to migrate? <ul style={{textAlign: "left", marginLeft: "1em"}}>
        {userVouchers.value.lp1.gt(new BigNumber(0)) && <li>• {printable.getPrintableTokenAmount(userVouchers.value.lp1, 18, 5)} LP1</li>}
        {userVouchers.value.lp2.gt(new BigNumber(0)) && <li>• {printable.getPrintableTokenAmount(userVouchers.value.lp2, 18 - 5, 5)} cmLP2</li>}
        {userVouchers.value.lp3.gt(new BigNumber(0)) && <li>• {printable.getPrintableTokenAmount(userVouchers.value.lp3, 18, 5)} LP3</li>}
        </ul>
      </>);

      if (!confirm) return;

      const transaction = yam.contracts.CoreDAOTreasury.methods.wrapVouchers(wallet.account, userVouchers.value.lp1.toString(), userVouchers.value.lp2.toString(), userVouchers.value.lp3.toString());
      const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });
  
      const balanceBefore = new BigNumber(await yam.contracts["coreDAO"].methods.balanceOf(wallet.account).call());

      await transaction.send({
        from: wallet.account,
        gas: transactionGasEstimate
      });

      const balanceAfter = new BigNumber(await yam.contracts["coreDAO"].methods.balanceOf(wallet.account).call());

      userVouchers.refresh();
  
      windowsContext.showDialog(
        'Success',
        <div>
          You have migrated your Core Voucher LPs for {printable.getPrintableTokenAmount(balanceAfter.minus(balanceBefore))} CoreDAO tokens!<br/><br/>
          You can add them to your wallet with the following ERC20 Address:<br/><br/>

          0xf66Cd2f8755a21d3c8683a10269F795c0532Dd58
          <br/>
            </div>,
        'Ok');

    } catch (error) {
      const transactionError = transactions.getTransactionError(error);
      windowsContext.showError(
        "Error while migrating",
        '',
        ErrorType.Fatal,
        transactionError.message
      );

      throw error;
    }
  }

  const needApproval = () => {
    return (useLp1Allowance.amount === DATA_UNAVAILABLE || userVouchers.value.lp1 === DATA_UNAVAILABLE || useLp1Allowance.amount.lt(userVouchers.value.lp1)) ||
          (useLp2Allowance.amount === DATA_UNAVAILABLE || userVouchers.value.lp2 === DATA_UNAVAILABLE || useLp2Allowance.amount.lt(userVouchers.value.lp2)) ||
          (useLp3Allowance.amount === DATA_UNAVAILABLE || userVouchers.value.lp3 === DATA_UNAVAILABLE || useLp3Allowance.amount.lt(userVouchers.value.lp3))
  };

  const renderApprovals = () => {
    const approve = async(token) => {
        try {
          const contract = yam.contracts["CoreDAOTreasury"]._address;
          const transaction = yam.contracts[token].methods.approve(contract, ethers.constants.MaxUint256);
          const gasEstimation = await transaction.estimateGas({ from: wallet.account });
    
          await transaction.send({
            from: wallet.account,
            gasEstimation
          });
    
        } catch (error) {
          const transactionError = transactions.getTransactionError(error);
          windowsContext.showError(
            "Error while approving",
            '',
            ErrorType.Fatal,
            transactionError.message
          );
        }
    }

    if(useLp1Allowance.amount !== DATA_UNAVAILABLE && userVouchers.value.lp1 !== DATA_UNAVAILABLE && useLp1Allowance.amount.lt(userVouchers.value.lp1)) {
      return <TransactionButton
        onClick={() => approve("coreDaoLp1")}
        text="(Step 1/3) Approve Lp1 Migration"
        textLoading="Approving..."
      />
    };

    if(useLp2Allowance.amount !== DATA_UNAVAILABLE && userVouchers.value.lp2 !== DATA_UNAVAILABLE && useLp2Allowance.amount.lt(userVouchers.value.lp2)) {
      return <TransactionButton
        onClick={() => approve("coreDaoLp2")}
        text="(Step 2/3) Approve Lp2 Migration"
        textApproving="Approving..."
      />
    };

    if(useLp3Allowance.amount !== DATA_UNAVAILABLE && userVouchers.value.lp3 !== DATA_UNAVAILABLE && useLp3Allowance.amount.lt(userVouchers.value.lp3)) {
      return <TransactionButton
      onClick={() => approve("coreDaoLp3")}
        text="(Step 3/3) Approve Lp3 Migration"
        textApproving="Approving..."
      />
    };
  }

  const changeDelegatee = async () => {
    try {
      let address;
      
      try {
        address = Web3.utils.toChecksumAddress(delegateeTxt);
      } catch(e) {
        await windowsContext.showError("Error", "Invalid Ehereum Address");
        return;
      }

      const transaction = yam.contracts.COREVAULT.methods.delegate(address);
      const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });
  
      await transaction.send({
        from: wallet.account,
        gas: transactionGasEstimate
      });

      governance.refresh();

      setDelegateeTxt("");
    } catch (error) {
      throw transactions.getTransactionError(error);
    }
  };

  const onChangeDelagatee = async () => {
    try {
      await changeDelegatee();
    } catch(e) {
      await windowsContext.showError("Error", e.message);
    }
  };

  return (
    <div>
      {/*<div>Current Delegatee:<br/> {governance.delegatee}</div>

      <br />
      <TextField value={delegateeTxt} placeholder="0x0000000000000000000000000000000000000000"  onChange={(e) => setDelegateeTxt(e.target.value)} />
      <TransactionButton
        style={{ marginTop: '1rem' }}
        onClick={() => onChangeDelagatee()}
        text="Set Delegatee"
        textLoading="Loading..."
  />*/}

    <MigrationFieldSet label="CoreDAO LP Voucher Migration">
      <div style={{marginBottom: "1em"}}>
        Migrate your CoreDAO LPs using the button below. The LP tokens need to be in your wallet beforehand.
        <br/>
        If you have staked LPs, you'll need to unstake them first before migrating.
        </div>

    <div style={{marginTop: "1em", marginBottom: "1em"}}>
      <ul>
      <li>CoreDAO Balance: {printable.getPrintableTokenAmount(coreDAOBalance.balance)}</li>
      <li>Voucher LP1 Balance: {printable.getPrintableTokenAmount(userVouchers.value.lp1, 18, 5)} LP</li>
      <li>Voucher LP2 Balance: {printable.getPrintableTokenAmount(userVouchers.value.lp2, 18 - 5, 5)} cmLP</li>
      <li>Voucher LP3 Balance: {printable.getPrintableTokenAmount(userVouchers.value.lp3, 18, 5)} LP</li>
      </ul>
    </div>
    {(needApproval() && renderApprovals()) || <TransactionButton
        onClick={() => migrateLpToCoreDAO()}
        text={userVouchers.value.total.eq(new BigNumber(0)) ? "No LP to migrate" : "Migrate LP -> CoreDAO"}
        textLoading="Migrating..."
        disabled={userVouchers.value.total.eq(new BigNumber(0)) || needApproval()}
      />}
      </MigrationFieldSet>
  </div>
  );
};

export default CoreDAOMigration;
