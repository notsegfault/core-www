import BigNumber from 'bignumber.js';
import React from 'react';
import {
  Button,
  Hourglass,
  WindowContent,
  Anchor
} from 'react95';
import {
  useETHPrice,
  useForkMigrations,
  useUserApprovalOfContract,
  useUserContributed,
  useUserTokenBalance
} from '../../../hooks';
import { ethers } from 'ethers';

import warningIMG from '../../../assets/img/warning.png';
import defragIMG from '../../../assets/img/defrag.png';
import defragGIF from '../../../assets/img/defrag.gif';

import { formatNaNWithCommas } from '../../../utils/util';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import { useWallet } from 'use-wallet';
import useYam from '../../../hooks/useYam';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import { TransactionButton } from '../../../components/Button';
import { LGEContext } from '../../../contexts/LGE';
import { hooks, printable } from '../../../helpers';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const useMigrationContractBalanceOfLP = (type) => {
  const yam = useYam();
  const wallet = useWallet();

  const [tokenBalance, setTokenBalance] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, update, 15000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function update() {
    let tokenBalance
    if(type == 'encore') tokenBalance = await yam.contracts.COREFORKMIGRATOR.methods.viewCreditedENCORETokens(wallet.account).call();
    if(type == 'unicore') tokenBalance = await yam.contracts.COREFORKMIGRATOR.methods.viewCreditedUNICOREReactors(wallet.account).call();
    if(type == 'tens') tokenBalance = await yam.contracts.COREFORKMIGRATOR.methods.viewCreditedTENSTokens(wallet.account).call();
    setTokenBalance(tokenBalance);

    // uint256 balanceUNICORE = viewCreditedUNICOREReactors(user);
    // uint256 balanceENCORE = viewCreditedENCORETokens(user);
    // uint256 balanceTENS = viewCreditedTENSTokens(user);
  }

  return React.useMemo(() => (tokenBalance === '' ? DATA_UNAVAILABLE : new BigNumber(tokenBalance)), [
    tokenBalance,
  ]);
}

const Migrations = props => {
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const ETHPrice = useETHPrice()
  const yam = useYam()

  const encoreUserContributed = useUserContributed(wallet.account, 'encore');
  const encoreLPInWallet = useUserTokenBalance('encoreLP');
  const unicoreLPInWallet = useUserTokenBalance('unicoreLP');
  const tensLPInWallet = useUserTokenBalance('tensLP');

  console.log(`enocore LP ${encoreLPInWallet.balance} unicore LP ${unicoreLPInWallet.balance} tens LP ${tensLPInWallet.balance}`)

  const encoreLPInContracts = useMigrationContractBalanceOfLP('encore');
  const unicoreLPInContracts = useMigrationContractBalanceOfLP('unicore');
  const tensLPInContracts = useMigrationContractBalanceOfLP('tens');

  const encoreLPApproval = useUserApprovalOfContract('COREFORKMIGRATOR','encoreLP')
  const unicoreLPApproval = useUserApprovalOfContract('COREFORKMIGRATOR','unicoreLP')
  const tensLPApproval = useUserApprovalOfContract('COREFORKMIGRATOR','tensLP')

  const needToDeposit = encoreLPInWallet.balance > 0 && encoreLPInWallet.balance !== DATA_UNAVAILABLE ||
  unicoreLPInWallet.balance > 0 && unicoreLPInWallet.balance !== DATA_UNAVAILABLE || tensLPInWallet.balance > 0 && tensLPInWallet.balance !== DATA_UNAVAILABLE;

  const hasLPInVaults = encoreLPInContracts > 0 ||  unicoreLPInContracts > 0 || tensLPInContracts > 0;

  const [txState, setTxState] = React.useState('waiting')
  const [txClaimState, setTxClaimState] = React.useState('waiting')
  const forkMigrations = useForkMigrations();
  const lgeContext = React.useContext(LGEContext);

  const refreshAllBalances = () => {

  }

  const DepositButtonText = () => {
    if(txState != "loading") {
      return "Deposit All"
    }
    return <Hourglass size={20} />

  }

  const ClaimButtonText = () => {
    if(txClaimState != "loading") {
      return "Claim Pending Encore LP Tokens"
    }
    return <span>Claiming... <Hourglass size={20} /></span>
  }

  const ApproveButtonText = () => {
    if(txState != "loading") {
      return "Approve"
    }
    return <Hourglass size={20} />
  }

  const approveMaxForContract = async (token, contract) => {
    setTxState('loading')

    let tx = yam.contracts[token].methods.approve(contract, ethers.constants.MaxUint256)
    let gas;


    try {
      gas = await tx.estimateGas({from: wallet.account});
      await tx.send({from:wallet.account,  gas })
    } catch (err) {
      console.debug(err)
      console.log(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error depositing LP",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
    } finally {
      refreshAllBalances();
      setTxState('waiting')
    }
  }

  const ApproveOrDepositButton = type => {
    let approval;
    let amount;
    let contractName;
    switch (type) {
      case 'encore':
        approval = encoreLPApproval.amount;
        amount = encoreLPInWallet.balance;
        contractName = 'encoreLP'
        break;
      case 'unicore':
        approval = unicoreLPApproval.amount;
        amount = unicoreLPInWallet.balance;
        contractName = 'unicoreLP'

        break;
      case 'tens':
        approval = tensLPApproval.amount
        amount = tensLPInWallet.balance;
        contractName = 'tensLP'

        break;
    }
    if(approval !== DATA_UNAVAILABLE && approval.gte(amount))
      return <Button primary style={{width:'100px'}} onClick={()=>depositAllLP(type)}>{DepositButtonText()}</Button>

    return <Button primary style={{width:'100px'}} disabled={txState === 'loading' ? 'disabled': ''} onClick={()=>approveMaxForContract(contractName, yam.contracts.COREFORKMIGRATOR._address)}>{ApproveButtonText()}</Button>
  }

  const claimEncoreLpTokens = async () => {
    setTxClaimState('loading')

    try {
      const tx = yam.contracts.encore.methods.claimLPTokens();
      await tx.send({
        from: wallet.account,
        gas: 200000,
      });
    } catch (e) {
      const messageWithoutFluff = e.message.split(":")[1] + e.message.split(":")[2];
      windowsContext.showError(
        "Error Claiming Encore LP",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        <span>An error occured while claiming your encore LP. Visit <Anchor target="_blank" href="https://t.me/coretechsupport">t.me/coretechsupport</Anchor>{' '}for technical support</span>
      );
    } finally {
      refreshAllBalances();
      setTxClaimState('waiting')
    }
  };

  const depositAllLP = async (type) => {
    setTxState('loading')

    let tx;
    let gas;
    switch(type) {
      case 'encore':
        tx = yam.contracts.COREFORKMIGRATOR.methods.addENCORELPTokens()
        break;
      case 'unicore':
        tx = yam.contracts.COREFORKMIGRATOR.methods.addUNICOREReactors()
        break;
      case 'tens':
        tx = yam.contracts.COREFORKMIGRATOR.methods.addTENSLPTokens()
        break;

    }

    try {
      gas = await tx.estimateGas({from: wallet.account});
      await tx.send({from:wallet.account,  gas })
    } catch (err) {
      console.debug(err)
      console.log(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error depositing LP",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
      setTxState('waiting')

    } finally {
      refreshAllBalances();
      setTxState('waiting')

    }
  }

  const DepositElement = () => {
    let toReturn;
    if(!wallet.account) return "Connect your wallet to see"
    if(encoreLPInWallet.balance > 0) {
      toReturn = <div>{(encoreLPInWallet.balance/1e18).toFixed(4)} ENCORE LP {ApproveOrDepositButton('encore')}

      </div>
    }

    if(unicoreLPInWallet.balance > 0) {
      toReturn = <div>{(unicoreLPInWallet.balance/1e18).toFixed(4)} REACTOR LP
      {ApproveOrDepositButton('unicore')}
      </div>
    }

    if(tensLPInWallet.balance > 0) {
      toReturn = <div>{(tensLPInWallet.balance/1e18).toFixed(4)} TENS LP
         {ApproveOrDepositButton('tens')}
      </div>
    }

    return toReturn;
  }
  // const encoreLPInContracts = 0;
  // const unicoreLPInContracts = 1;
  // const tensLPInContracts = 0;
  const LPDisplayElement = () => {

    const renderEncoreLP = () => {
      if(encoreLPInContracts !== DATA_UNAVAILABLE && !encoreLPInContracts.isZero()) {
        return <div>ENCORE LP {(encoreLPInContracts/1e18).toFixed(4)} </div>;
      }
      return <></>;
    }

    const renderUnicoreLP = () => {
      if(unicoreLPInContracts !== DATA_UNAVAILABLE && !unicoreLPInContracts.isZero()) {
        return <div>REACTOR {(unicoreLPInContracts/1e18).toFixed(4)} </div>;
      }
      return <></>;
    }

    const renderTensLP = () => {
      if(tensLPInContracts !== DATA_UNAVAILABLE && !tensLPInContracts.isZero()) {
        return <div>ENCORE LP {(tensLPInContracts/1e18).toFixed(4)} </div>;
      }
      return <></>;
    }

    return <>
      {renderEncoreLP()}
      {renderUnicoreLP()}
      {renderTensLP()}
    </>;
  }

  const renderClaimEncore = () => {
    if (encoreUserContributed !== DATA_UNAVAILABLE && encoreUserContributed > 0) {
      return <Button primary disabled={txClaimState === 'loading' ? 'disabled': ''} onClick={()=> claimEncoreLpTokens()}>{ClaimButtonText()}</Button>
    }
    return <></>
  };

  const DisplayPrompts = () => {

    let toReturn;
    if(needToDeposit) {
      toReturn = <div>
        <div style={{fontWeight:'bold'}}><img src={warningIMG} style={{width:'25px'}} />Warning!</div>
        <div style={{maxWidth:'50ch'}}>
          You have LP tokens that are about to become worthless, or it will take a long time until you can zap them again.
        </div>
      <span style={{fontWeight:'bold'}}>Deposit them now.</span>
       <div style={{paddingTop:'1rem'}}>{DepositElement()} </div></div>
    }

    if(hasLPInVaults) {
      toReturn =
      <>{toReturn}
      <div style={{paddingBottom:'0.5rem'}}>
        <div style={{fontWeight:'bold', marginTop:'1rem', paddingBottom:'0.5rem'}}>LP that you will get credited for.</div>
       {LPDisplayElement()}
       </div>
       </>
    }


    if(!needToDeposit && !hasLPInVaults) {
      toReturn = <div>You have no LP to deposit or LP in vaults.</div>
    }
    if(!wallet.account) {
      toReturn = <div>You have to connect your wallet to check your balances.</div>
    }


    return toReturn;
  }

  return (
    <CoreWindow
      {...props}
      icon={defragIMG}
      windowTitle='defragment_copy.exe'
      minWidth='550px'
      maxWidth='550px'
      top='40%'
      left='10%'
    >
      <CoreWindowContent>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
      <div style={{display:'flex', alignItems:'center', flexDirection:'column ', minWidth:'100%' }}>
        <div style={{display:'flex', justifyContent:'center', paddingTop:'0rem'}}>
          <img src={defragGIF} style={{width:'120px' }} />
        </div>
        <h2 style={{textAlign:'center', paddingTop:'1rem'}}>
          Total ETH defragmented from CORE copies so far...
          <br />10,053 ETH
          <span style={{fontWeight:'bold'}}>{" "}
            <ScrambleDisplay value={ETHPrice * 10053} decimals={0} precision={2}>
              {({ value }) => <>${parseFloat(value).toLocaleString('en')}</>}
            </ScrambleDisplay></span>
        </h2>

      <div style={{ textAlign:'center', marginTop:'1rem'}}>
        <div style={{maxWidth:'50ch'}}>
          You can now deposit your ENCORE LP, REACTOR (UNICORE) as well as TENS LP. into the migrator contract.
        </div>
        {renderClaimEncore()}
        <br />
        {DisplayPrompts()}
      </div>
      
      </div>

      </div>


      </CoreWindowContent>
    </CoreWindow>
  );
};

const ONE_WITH_DECIMALS = new BigNumber(10).pow(18);



export default Migrations;
