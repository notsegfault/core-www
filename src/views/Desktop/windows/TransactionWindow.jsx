import React from 'react';
import { CoreModalWindow, CoreWindowContent } from '../../../components/Windows';
import {
  Button,
  Anchor,
  Hourglass
} from 'react95';

import {
  useYam
} from '../../../hooks';

import BigNumber from 'bignumber.js';
import warningIMG from '../../../assets/img/warning.png';
import errorIMG from '../../../assets/img/error.png';
import infoIMG from '../../../assets/img/info.png';

import useWallet from 'use-wallet';
import WrapAndUnwrapInput from '../components/WrapAndUnwrapInput';
import { WithdrawOrStakeInputDialog } from '../../../components/Staking';
import LinkButton from '../components/LinkButton';
import { WindowsContext } from '../../../contexts/Windows';
import Hamster from '../../../components/Memes/Hamster';
import { FannyContext } from '../../../contexts/Fanny';

export const TRANSACTION_WINDOWNAME_PREFIX = 'transaction';
export const getTransactionWindowName = type => `${TRANSACTION_WINDOWNAME_PREFIX}-${type}`;

const FANNY_DEFAULT_LOCKTIME_INWEEKS = 0;

const TransactionWindow = ({
  txValue = 0,
  type,
  status = 'waiting for click',
  additional,
  onAfterTransaction,
  ...props
}) => {
  const windowsContext = React.useContext(WindowsContext);
  const yam = useYam();
  const wallet = useWallet();
  const [transactionValue, setTransactionValue] = React.useState(txValue);
  const [transactionStatus, setTransactionStatus] = React.useState(status);
  const [transactionHash, setTransactionHash] = React.useState('');
  const [transactionError, setTransactionError] = React.useState('');

  // Fanny Specific
  const [lockTimeWeeks, setLockTimeWeeks] = React.useState(FANNY_DEFAULT_LOCKTIME_INWEEKS);
  const fannyService = React.useContext(FannyContext);

  const getTitle = () => {
    switch (type) {
      case 'stake-core-fanny':
        return 'Staking CORE in the Fanny Vault';
      case 'withdraw-core-fanny':
        return 'Withdrawing CORE from the Fanny Vault';
      case 'stake':
        return 'Staking LP in the CORE Vault';
      case 'withdraw':
        return 'Withdrawing LP from the CORE Vault';
      case 'liquidity-zap':
        return 'Adding liquidity';
      case 'LGE2':
        return 'Adding liquidity LGE#2';
      case 'wrapInErc95':
        return `Wrapping ${additional.tokenFriendlyName}`;
      case 'unwrapErc95':
        return `Unwrapping ${additional.tokenFriendlyName}`;
      default:
        return '??? Error';
    }
  };

  const getCurrentTip = () => {
    switch (type) {
      case 'stake':
        return <StakeTip />;
      case 'stake-core-fanny':
        return <StakeCoreTip />;
      case 'withdraw':
        return <WithdrawTip />;
      case 'withdraw-core-fanny':
        return <WithdrawCoreTip />;
      case 'LGE2':
        return <LGE2Tip />;
      case 'wrapInErc95':
        return <Erc95WrappingTip />;
      case 'unwrapErc95':
        return <Erc95WrappingTip />;
      default: return <></>
    }
  };

  const doAction = () => {
    (async () => {
      console.log("Doing action")
      console.log("Transaciton value is ", transactionValue.toString());
      let tx;
      try {
        console.log(`Inside action pid is ${additional?.pid}`);

        switch (type) {
          case 'stake':
            let callDeposit = yam.contracts.COREVAULT.methods.deposit(
              additional?.pid ? additional.pid : 0,
              transactionValue.times(new BigNumber(10).pow(18)).toString()
            );
            tx = await callDeposit.send({
              from: wallet.account,
              gas: 300000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.1),
            });
            break;

          case 'stake-core-fanny':
            tx = await fannyService.stake(yam, wallet, transactionValue.times(new BigNumber(10).pow(18)), lockTimeWeeks);
            break;

          case 'withdraw':
            let callWithdraw = yam.contracts.COREVAULT.methods.withdraw(
              additional?.pid ? additional.pid : 0,
              transactionValue.times(new BigNumber(10).pow(18)).toString()
            );
            tx = await callWithdraw.send({
              from: wallet.account,
              gas: 300000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.1),
            });
            break;

          case 'withdraw-core-fanny':
            let callWithdrawCoreFanny = yam.contracts.FANNYVAULT.methods.withdraw(
              additional?.pid ? additional.pid : 0,
              transactionValue.times(new BigNumber(10).pow(18)).toString()
            );
            tx = await callWithdrawCoreFanny.send({
              from: wallet.account,
              gas: 300000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.1),
            });
            break;

          case 'liquidity-zap':
            const transaction = yam.contracts.COREROUTER.methods.addLiquidityETHOnly(
              wallet.account,
              additional.shouldStake
            );
            tx = await transaction.send({
              value: transactionValue,
              from: wallet.account,
              gas: additional.shouldStake ? 800000 : 400000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.1),
            });
            break;

          case 'LGE2':
            if (additional.tokenName == 'eth') {
              //eth deposit is different
              const deposit = yam.contracts.LGE2.methods.addLiquidityETH();
              tx = await deposit.send({
                value: transactionValue.times(new BigNumber(10).pow(18)).toString(),
                from: wallet.account,
                gas: 800000,
                gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.2),
              });
            } else {
              const deposit = yam.contracts.LGE2.methods.addLiquidityWithTokenWithAllowance(
                //addres
                yam.contracts[additional.tokenName]._address,
                transactionValue
                  .times(new BigNumber(10).pow(additional.tokenName == 'WBTC' ? 8 : 18))
                  .toString()
              );
              tx = await deposit.send({
                // value: transactionValue,
                from: wallet.account,
                gas: 800000,
                gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.2),
              });
            }
            break;

          case 'wrapInErc95':
            const wrap = yam.contracts[additional.erc95TokenContract].methods.wrap(wallet.account, transactionValue.times(new BigNumber(10).pow(additional.decimals)).toString());
            tx = await wrap.send({
              from: wallet.account,
              gas: 200000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.2),
            });
            break;


          case 'unwrapErc95':
            const unwrap = yam.contracts[additional.erc95TokenContract].methods.unwrap(transactionValue.times(new BigNumber(10).pow(additional.decimals)).toString());
            tx = await unwrap.send({
              from: wallet.account,
              gas: 200000,
              gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.2),
            });
            break;
        }

        if (onAfterTransaction) {
          onAfterTransaction();
        }
      } catch (e) {
        setTransactionError(e.message);
        setTransactionStatus('error');
      } finally {
        if (tx?.transactionHash) {
          setTransactionStatus('');
          setTransactionHash(tx.transactionHash);
        }
      }
    })();
  };

  React.useEffect(() => {
    if (transactionStatus === 'waiting') doAction();
  }, [transactionStatus]);

  const getCurrentCallToAction = () => {
    switch (type) {
      case 'stake':
      case 'stake-core-fanny':
        return <StakeButton />;
      case 'withdraw':
      case 'withdraw-core-fanny':
        return <WithdrawButton />;
      case 'LGE2':
        return <LGE2Button />;
      case 'wrapInErc95':
        return <WrapButton />;
      case 'unwrapErc95':
        return <WrapButton />;
    }
  };

  const confirmStakingBurnOperation = async () => {
    const displayableAmountToStake = transactionValue.toString();
    let confirm = await windowsContext.showConfirm('Burning Confirmation', <>Are you sure you want to BURN {displayableAmountToStake} CORE?</>);
    if (confirm) {
      confirm = await windowsContext.showConfirm('Burning Confirmation', <>Are you REALLY REALLY sure you want to BURN {displayableAmountToStake} CORE?</>);
      if (confirm) {
        return await windowsContext.showConfirm('Burning Confirmation', <>This operation is nonreversible. Are you sure you want to BURN {displayableAmountToStake} CORE?</>);
      }
    }
  }

  const StakeButton = () => {
    const getStakingButtonText = () => {
      switch(type) {
        case 'stake-core-fanny':
          if (lockTimeWeeks === 'burn') {
            return 'Burn';
          } else {
            return 'Stake';
          }
        default:
          return 'Stake';
      }
    };

    return <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
      <Button
        disabled={parseFloat(transactionValue) <= 0 ? 'disabled' : ''}
        onClick={async () => {
          if (type === 'stake-core-fanny' && lockTimeWeeks === 'burn') {
            const confirm = await confirmStakingBurnOperation();
            if (confirm) {
              setTransactionStatus('waiting');
            }
          } else {
            setTransactionStatus('waiting');
          }
        }}
        style={{ width: '300px', margin: 'auto' }}
        primary
      >
        {getStakingButtonText()}
      </Button>
    </div>
  };

  const StakeTip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="info" src={infoIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch' }}>
        Staking LP tokens, yields you CORE tokens from transaction fees!
      </div>
    </div>
  );

  const StakeCoreTip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="info" src={infoIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch', alignSelf: 'center' }}>
        Staking CORE tokens, yields you FANNY tokens!
      </div>
    </div>
  );

  const WithdrawTip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="warning" src={warningIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch', alignSelf: 'center' }}>
        Unstaking LP tokens will stop you from earning more fees.
      </div>
    </div>
  );

  const WithdrawCoreTip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="warning" src={warningIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch', alignSelf: 'center' }}>
        Unstaking CORE tokens will stop you from earning FANNY tokens.
      </div>
    </div>
  );

  const LGE2Tip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="info" src={infoIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch', alignSelf: 'center' }}>
        Liquidity inside CORE pairs is not withdrawable. Liquidity Providers on CORE pairs earn
        about 1% of all volume on them.
      </div>
    </div>
  );

  const Erc95WrappingTip = () => (
    <div style={{ display: 'flex', paddingTop: '1rem' }}>
      <img alt="info" src={infoIMG} style={{ paddingRight: '0.5rem' }} />
      <div style={{ maxWidth: '50ch', alignSelf: 'center' }}>
        You can wrap and unwrap between different CORE ERC95 wrapped tokens, at any point without any fees.
      </div>
    </div>
  );

  const WithdrawButton = () => (
    <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
      <Button
        onClick={() => {
          setTransactionStatus('waiting');
        }}
        style={{ width: '300px', margin: 'auto' }}
        primary
      >
        Withdraw
      </Button>
    </div>
  );

  const WrapButton = () => (
    <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
      <Button
        onClick={() => {
          setTransactionStatus('waiting');
        }}
        style={{ width: '300px', margin: 'auto' }}
        primary
      >
        {type === 'unwrapErc95' ? 'Unwrap' : "Wrap"}
      </Button>
    </div>
  );

  const LGE2Button = () => (
    <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
      <Button
        onClick={() => {
          setTransactionStatus('waiting');
        }}
        style={{ width: '300px', margin: 'auto' }}
        primary
      >
        Add Liquidity
      </Button>
    </div>
  );

  const TranscationError = () => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <img alt="error" src={errorIMG} width={64} style={{ padding: '1rem 0', margin: 'auto' }} />
        <h1>Transaction error...</h1>
        <br />
        {transactionError}
      </div>
      <LinkButton
        fullWidth
        style={{ marginRight: 8, marginTop: '1rem', marginBottom: '0.5rem' }}
        onClick={(e) => {
          if (type === 'liquidity-zap') {
            windowsContext.closeWindow(props.windowName, e);
          } else {
            setTransactionStatus('waiting for click');
          }
        }}
        size="lg"
      >
        {type === 'liquidity-zap' ? 'Close' : 'Try again'}
      </LinkButton>
    </>
  );

  const getSmartContractBeingInteracedWith = () => {
    switch (type) {
      case 'stake-core-fanny':
      case 'withdraw-core-fanny':
        return 'FANNYVault';
      case 'liquidity-zap':
        return 'CORERouter';
      case 'LGE2':
        return 'LGE Contract';
      case 'unwrapErc95':
        return `${additional.erc95TokenContractFriendlyName} Contract`;
      case 'wrapInErc95':
        return `${additional.erc95TokenContractFriendlyName} Contract`;
      default:
        return 'COREVault';
    }
  };

  const currentContractAddress = () => {
    switch (type) {
      case 'stake-core-fanny':
      case 'withdraw-core-fanny':
        return yam.contracts.FANNYVAULT._address;
      case 'LGE2':
        return yam.contracts.LGE2._address;
      case 'liquidity-zap':
        return yam.contracts.COREROUTER._address;
      case 'unwrapErc95':
      case 'wrapInErc95':
        return yam.contracts[additional.erc95TokenContract]._address;
      default:
        return yam.contracts.COREVAULT._address;
    }
  };
  const TransactionSuccess = () => (
    <div style={{ maxWidth: '50ch', padding: '1rem 2rem' }}>
      <h1>Success!</h1>
      <Hamster style={{ marginTop: '0.5rem' }} />
      Give the interface up to a minute to catch up <br />
      <div style={{ marginTop: '0.5rem' }}>
        Your {type === 'LGE2' ? 'liquidity addition' : ''} transaction is done!
        <br />
        See it on etherscan{' '}
        <Anchor href={`https://etherscan.io/tx/${transactionHash}`}>
          {transactionHash.substring(0, 5)}...
          {transactionHash.substring(transactionHash.length - 6, transactionHash.length - 1)}
        </Anchor>
      </div>
    </div>
  );

  const TransactionInProgress = ({ wallet }) => (
    <>
      <div style={{ maxWidth: '50ch', padding: '1rem 2rem' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
          Security checklist
          <img
            src={warningIMG}
            style={{ marginRight: '0.2rem', height: '1em', }}
            alt="warning icon"
          />
        </span>

        <div style={{ paddingTop: '0.35rem' }}>
          <span style={{ fontWeight: 'bold' }}>1)</span>Are you on https://cvault.finance ?<br />
        </div>

        <div style={{ paddingTop: '0.35rem' }}>
          <span style={{ fontWeight: 'bold' }}>2)</span> Does the website have a valid security
          certificate ? (padlock next to the address bar)
          <br />
        </div>
        {wallet.status === 'connected' && (
          <div style={{ paddingTop: '0.35rem' }}>
            <span style={{ fontWeight: 'bold' }}>3)</span> Are you transacting with is the real{' '}
            {getSmartContractBeingInteracedWith()}{' '}
            <Anchor href={`https://etherscan.io/address/${currentContractAddress()}`}>
              {currentContractAddress().substring(0, 5)}...
            </Anchor>
            ?<br />
          </div>
        )}

        <div style={{ paddingTop: '0.35rem' }}>
          <span style={{ fontWeight: 'bold' }}>4)</span> Does the function call you are doing start
          with {currentHexForFunction()} ? (under "data" tab in metamask)
        </div>
      </div>

      {wallet.status === 'connected' && (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              alignItems: 'center',
            }}
          >
            <h1>Waiting for blockchain confirmation...</h1>
            <Hourglass size={64} style={{ padding: '1rem 0', margin: 'auto' }} />
            <span>
              <span style={{ textTransform: 'capitalize' }}>
                {getTranscationUserFriendlyName()}
              </span>{' '}
              for{' '}
              {type === 'liquidity-zap' || type === 'LGE2'
                ? transactionValue.toString()
                : transactionValue.toString()}{' '}
              {getTypeCurrency()}
              <br />
            </span>
            by interacting with {getSmartContractBeingInteracedWith()} contract
            <Anchor
              href={`https://etherscan.io/address/${currentContractAddress()}`}
              target="_blank"
            >
              {currentContractAddress()}
            </Anchor>{' '}
            <br />
          </div>
        </>
      )}
    </>
  );

  const getTypeCurrency = () => {
    switch (type) {
      case 'stake-core-fanny':
      case 'withdraw-core-fanny':
        return 'CORE';
      case 'liquidity-zap':
        return 'ETH';
      case 'LGE2':
      case 'wrapInErc95':
      case 'unwrapErc95':
        return additional.tokenName;
      default:
        switch(additional?.pid) {
          case 1:
            return 'cBTC/CORE UNIv2 LP';
          case 2:
            return 'wCORE/coreDAI UNIv2 LP';
          default:
            return 'CORE/WETH UNIv2 LP';;
        }
    }
  };

  /**
   * The hex value are computed using web3.utils.soliditySha3.
   *
   * Example:
   * web3.utils.soliditySha3('deposit(uint256,uint256)')
   */
  const currentHexForFunction = () => {
    switch (type) {
      case 'stake-core-fanny':
        return '0xe2bbb158';
      case 'stake':
        return '0xe2bbb158';
      case 'withdraw':
        return '0x441a3e7';
      case 'withdraw-core-fanny':
        return '0x441a3e7'; // TODO: To be updated once the behaviour is settled.
      case 'liquidity-zap':
        return '0x0c57af6c';
      case 'wrapInErc95':
        return '0xbf376c7a'
      case 'LGE2':
        if (additional?.tokenName === 'eth') return '0xed995307';
        else return '0x14711c9d';
      default: return undefined;
    }
  };

  const getTranscationUserFriendlyName = () => {
    switch (type) {
      case 'stake':
      case 'stake-core-fanny':
        return 'Staking';
      case 'withdrawing':
      case 'withdrawing-core-fanny':
        return 'Withdrawing';
      case 'liquidity-zap':
        return 'Zaping Liquidity';
      case 'wrapInErc95':
        return 'Wrapping'
      case 'unwrapErc95':
        return 'UnWrapping'
      case 'LGE2':
        return 'Contributing Liquidity';
      default: return undefined;
    }
  };

  return (
    <CoreModalWindow
      {...props}
      windowTitle={getTitle()}
      minWidth='400px'
      top='20vh'
      left={`${window.innerWidth / 3}px`}
    >
      <CoreWindowContent>
        {transactionStatus === 'waiting for click' && !transactionHash && (
          <>
            {getCurrentTip()}
            <br />

            {additional?.tokenName ? (
              <WrapAndUnwrapInput
                {...additional}
                setTransactionStatus={setTransactionStatus}
                type={type}
                setTransactionValue={setTransactionValue}
              />
            ) : (
                <WithdrawOrStakeInputDialog
                  pid={additional?.pid}
                  tokenName={additional?.tokenName}
                  setTransactionStatus={setTransactionStatus}
                  type={type}
                  setTransactionValue={setTransactionValue}
                  lockTimeWeeks={lockTimeWeeks}
                  setLockTimeWeeks={setLockTimeWeeks}
                />
              )}
            <>{getCurrentCallToAction()}</>
          </>
        )}
        {transactionStatus === 'error' && !transactionHash && <TranscationError />}

        {transactionStatus === 'waiting' && !transactionHash && <TransactionInProgress wallet={wallet} />}
        {transactionHash && <TransactionSuccess />}
      </CoreWindowContent>
    </CoreModalWindow>
  );
};

export default TransactionWindow;
