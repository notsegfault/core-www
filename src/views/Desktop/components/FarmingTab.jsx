import React from 'react';
import styled from 'styled-components';
import { Button, Fieldset, Anchor } from 'react95';
import { DATA_UNAVAILABLE, pairInfoMap } from '../../../yam/lib/constants';
import { useWallet } from 'use-wallet';
import modemIMG from '../../../assets/img/modem.png';
import useYam from '../../../hooks/useYam';
import { useUserPoolPending, useUserStakedInPool, useUserTokenBalance, useVaultTokenRewardStats } from '../../../hooks';
import { claimCORE } from '../../../utils';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from '../windows/TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import './styles/staking-grid.css';
import { TransactionButton } from '../../../components/Button';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import { printable } from '../../../helpers';

const StakingBox = styled(Fieldset)`
  height: 180px;
  text-align: left;

  @media only screen and (max-width: 767px) {
    height: auto;
  }
`;


const FarmingPairs = () => {
  const wallet = useWallet();
  const pairNames = Object.keys(pairInfoMap);
  const middle = Math.ceil(pairNames.length / 2);

  const pairNamesRows = [
    [...pairNames.slice(0, middle)],
    [...pairNames.slice(middle, pairNames.length)],
  ];

  return (
    <div className="staking-grid">
      {wallet.account &&
        pairNamesRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="staking-grid-row">
            {row.map(pairName => {
              if (pairInfoMap[pairName].isToken) {
                return (
                  <FarmingToken
                    className="staking-grid-row-cell"
                    key={`farming-${pairName}`}
                    tokenName={pairName}
                  />
                );
              }

              return (
                <FarmingPair
                  className="staking-grid-row-cell"
                  key={`farming-${pairName}`}
                  routerUnavailable={pairInfoMap[pairName].routerUnavailable}
                  pairName={pairName}
                />
              );
            })}
          </div>
        ))}
    </div>
  );
};

const FarmingToken = ({ className, tokenName }) => {
  const tokenInfo = pairInfoMap[tokenName];
  const wallet = useWallet();
  const yam = useYam();
  const windowsContext = React.useContext(WindowsContext);
  const vaultRewardStats = useVaultTokenRewardStats();
  const TokenstakedInPool = useUserStakedInPool(tokenInfo.pid, wallet.account);
  const userPendingInPool = useUserPoolPending([tokenInfo.pid], wallet.account);
  const TokenInWallet = useUserTokenBalance(tokenName);

  const onClaimCORE = async () => {
    try {
      await claimCORE(yam, wallet, tokenInfo.pid);
    } catch (error) {
      windowsContext.showError('Error while claiming', '', ErrorType.Fatal, error.message);
    }

    userPendingInPool.refresh();
  };

  const hasToken = () => {
    return (
      wallet &&
      TokenInWallet.balance !== DATA_UNAVAILABLE &&
      parseFloat((TokenInWallet.balance * tokenInfo.supplyScale) / 1e18).toFixed(6) > 0
    );
  };

  const onStake = async () => {
    await windowsContext.openModal(
      WindowType.Transaction,
      null,
      {
        type: 'stake',
        additional: {
          pid: tokenInfo.pid,
        },
      },
      {
        windowName: getTransactionWindowName('stake'),
      }
    );

    TokenInWallet.refresh();
    TokenstakedInPool.refresh();
  };

  const onUnstake = async () => {
    await windowsContext.openModal(
      WindowType.Transaction,
      null,
      {
        type: 'withdraw',
        additional: {
          pid: tokenInfo.pid,
        },
      },
      { windowName: getTransactionWindowName('withdraw') }
    );

    TokenstakedInPool.refresh();
    userPendingInPool.refresh();
  };

  return (
    <div className={className}>
      <StakingBox label={`${tokenInfo.name}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Wallet{' '}
            <ScrambleDisplay
              value={parseFloat((TokenInWallet.balance * tokenInfo.supplyScale) / 1e18)}
              decimals={0}
            />{' '}
            {tokenInfo.unit}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Staked{' '}
            <ScrambleDisplay
              value={parseFloat((TokenstakedInPool.value / 1e18) * tokenInfo.supplyScale)}
              decimals={0}
            />{' '}
            {tokenInfo.unit}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Claimable{' '}
            <ScrambleDisplay
              value={parseFloat(userPendingInPool.value)}
              precision={8}
              decimals={0}
            />
          </div>
        </div>
        <hr/>
        <div>
          {vaultRewardStats !== DATA_UNAVAILABLE ?
            <>
                <div style={{fontWeight: "bold"}}>Average APY</div>
                <div style={{ display: "flex"}}>
                  <span style={{borderRight: "1px solid gray", paddingRight: "5px", marginRight: "5px"}}>
                    <span>{printable.formatPercent(vaultRewardStats.daily, 2)}</span>
                    <span style={{color: "#444444", fontSize: "0.8em", marginLeft: "5px"}}>24h</span>
                  </span>
                  <span style={{borderRight: "1px solid gray", paddingRight: "5px", marginRight: "5px"}}>
                    <span>{printable.formatPercent(vaultRewardStats.weekly, 2)}</span>
                    <span style={{color: "#444444", fontSize: "0.8em", marginLeft: "5px"}}>7d</span>
                  </span>
                  <span>
                    <span>{printable.formatPercent(vaultRewardStats.monthly, 2)}</span>
                    <span style={{color: "#444444", fontSize: "0.8em", marginLeft: "5px"}}>30d</span>
                  </span>
                </div>
            </> :
            <>Calculating APY...</>
          }
        </div>



        <div style={{ marginTop: '0.5em' }}>
          <TransactionButton
            style={{ flex: '50%', marginRight: '0.5em' }}
            text="Stake"
            disabled={!hasToken()}
            textLoading="Staking..."
            allowanceRequiredFor={{ contract: 'COREVAULT', token: tokenName }}
            onClick={() => onStake()}
          />

          <TransactionButton
            style={{ flex: '50%', marginRight: '0.5em' }}
            text="Unstake"
            textLoading="Unstaking..."
            disabled={
              parseFloat((TokenstakedInPool.value * tokenInfo.supplyScale) / 1e18).toFixed(6) <= 0
                ? 'disabled'
                : ''
            }
            onClick={_ => onUnstake()}
          />

          <TransactionButton
            style={{ flex: '50%' }}
            text="Claim"
            textLoading="Claiming..."
            disabled={userPendingInPool.value <= 0 ? 'disabled' : ''}
            onClick={_ => onClaimCORE()}
          />
          
        </div>
      </StakingBox>
    </div>
  );
};

const FarmingPair = ({ className, pairName }) => {
  const pairInfo = pairInfoMap[pairName];
  const wallet = useWallet();
  const yam = useYam();
  const windowsContext = React.useContext(WindowsContext);
  const CORELPstakedInPool = useUserStakedInPool(pairInfo.pid, wallet.account);
  const userPendingInPool = useUserPoolPending([pairInfo.pid], wallet.account);

  const onClaimCORE = async () => {
    try {
      await claimCORE(yam, wallet, pairInfo.pid);
    } catch (error) {
      windowsContext.showError('Error while claiming', '', ErrorType.Fatal, error.message);
    }

    userPendingInPool.refresh();
  };

  
  const onUnstake = async () => {
    await windowsContext.openModal(
      WindowType.Transaction,
      null,
      {
        type: 'withdraw',
        additional: {
          pid: pairInfo.pid,
        },
      },
      { windowName: getTransactionWindowName('withdraw') }
    );

    CORELPstakedInPool.refresh();
    userPendingInPool.refresh();
  };

  return (
    <div className={className}>
      <StakingBox label={`${pairInfo.name}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Staked{' '}
            <ScrambleDisplay
              value={parseFloat((CORELPstakedInPool.value / 1e18) * pairInfo.supplyScale)}
              decimals={0}
            />{' '}
            {pairInfo.unit}
          </div>
        </div>
        <div>
          APY 0%*
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            Claimable{' '}
            <ScrambleDisplay
              value={parseFloat(userPendingInPool.value)}
              precision={8}
              decimals={0}
            />
          </div>
        </div>
        <div style={{ marginTop: '1em' }}>
          <TransactionButton
            style={{ flex: '50%', marginRight: '0.5em' }}
            text="Unstake"
            textLoading="Unstaking..."
            disabled={
              parseFloat((CORELPstakedInPool.value * pairInfo.supplyScale) / 1e18).toFixed(6) <= 0
                ? 'disabled'
                : ''
            }
            onClick={_ => onUnstake()}
          />

          <TransactionButton
            style={{ flex: '50%' }}
            text="Claim"
            textLoading="Claiming..."
            disabled={userPendingInPool.value <= 0 ? 'disabled' : ''}
            onClick={_ => onClaimCORE()}
          />
        </div>
      </StakingBox>
    </div>
  );
};

const FarmingTab = () => {
  const wallet = useWallet();
  const yam = useYam();
  const [daysSinceFees, setDaysSinceFees] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    if (yam)
      (async () => {
        const blockStartFees = await yam.contracts.COREVAULT.methods
          .epochCalculationStartBlock()
          .call();
        const currentBlock = await yam.web3.eth.getBlockNumber();
        const blocksInPast = currentBlock - blockStartFees;
        setDaysSinceFees(blocksInPast / (86400 / 13));
      })();
  }, [yam]);

  return (
    <div style={{ textAlign: 'justify' }}>
      <FarmingPairs />
    </div>
  );
};

export default FarmingTab;
