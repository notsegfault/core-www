import React from 'react'
import styled from 'styled-components';
import {
  Button,
  Fieldset
} from 'react95';
import { useWallet } from 'use-wallet';
import { BalancesDisplay } from '../../../components/Text';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import {
  useCoreBalance,
  useUserApprovalOfContract,
  useUserPoolPending,
  useUserStakedInPool,
  useUserVouchers,
  useVaultRewardStats
} from '../../../hooks';
import useYam from '../../../hooks/useYam';
import { addressMap, DATA_UNAVAILABLE, pairInfoMap } from '../../../yam/lib/constants';
import useCoreLPBalance from '../../../hooks/useCoreLPBalance';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from '../windows/TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import { TransactionButton } from '../../../components/Button';
import './styles/staking-grid.css'

const StakingBox = styled(Fieldset)`
  height: 150px;

  @media only screen and (max-width: 767px) {
    height: auto;
  }
`;

const CoreSummaryPanel = styled(Fieldset)`
  display: grid;
  grid-template-columns: 1fr 0.3fr;

  @media only screen and (max-width: 767px) {
    display: block !important;

    Button, TransactionButton {
      margin-top: 0.5em;
    }
  }
`;

const CoreSummaryPanelLeft = styled.div`
`;

const CoreSummaryPanelRight = styled.div`
  text-align: center;
  margin: auto;

  @media only screen and (max-width: 767px) {
      text-align: left;
      margin: none;
  }
`;

const PairSummary = ({
  className,
  pairName,
  setWalletWindowState
}) => {
  const pairInfo = pairInfoMap[pairName];
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const CORELPstakedInPool = useUserStakedInPool(pairInfo.pid, wallet.account);
  const CORELPInWallet = useCoreLPBalance(pairName);
  const vaultRewardStats = useVaultRewardStats(pairName);

  let claimableLP = 0;
  const totalLP = (parseFloat(claimableLP) + parseFloat(CORELPstakedInPool.value) + parseFloat(CORELPInWallet.value)) / 1e18;

  const hasLp = () => {
    return CORELPInWallet.value !== DATA_UNAVAILABLE && parseFloat(CORELPInWallet.value * pairInfo.supplyScale / 1e18).toFixed(6) > 0;
  };

  const onStake = async () => {
    await windowsContext.openModal(
      WindowType.Transaction, null, {
        type: 'stake',
        additional: {
          pid: pairInfo.pid
        }
      }, {
        windowName: getTransactionWindowName('stake')
      }
    );

    CORELPInWallet.refresh();;
    CORELPstakedInPool.refresh();
  };

  const renderStaking = () => {
    if (wallet.account) {
      if (hasLp()) {
        return <TransactionButton
                  style={{ marginTop: '0.5em', minWidth: '90px' }}
                  text="Stake"
                  textLoading="Staking..."
                  allowanceRequiredFor={{ contract: 'COREVAULT', token: pairName }}
                  onClick={() => onStake()} />
      } else {
        if (!pairInfo.routerUnavailable) {
          return <Button onClick={(e) => windowsContext.openWindow(WindowType.Router, e)} style={{ marginTop: '0.2em', width: '90px' }}>Get</Button>
        }
      }
    }

    return <></>
  };

  return <div className={className}>
    <StakingBox label={`${pairInfo.name} (${pairInfo.unit})`}>
      <div>
        Total <ScrambleDisplay value={parseFloat(totalLP * pairInfo.supplyScale)} decimals={0}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          Wallet <ScrambleDisplay value={parseFloat(CORELPInWallet.value * pairInfo.supplyScale / 1e18)} decimals={0}/>
        </div>
      </div>
      <div>
        Staked <ScrambleDisplay value={CORELPstakedInPool.value * pairInfo.supplyScale}/>
        <div style={{ visibility: CORELPstakedInPool.value !== DATA_UNAVAILABLE && CORELPstakedInPool.value > 0 ? 'visible' : 'hidden' }}>
          {vaultRewardStats.apy}% APY
          <span style={{ cursor: 'pointer' }} onClick={() => setWalletWindowState({ activeTab: 1 })}>*</span>
        </div>
      </div>
      {renderStaking()}
    </StakingBox>
  </div>
};

const SummaryTab = ({ setWalletWindowState }) => {
  const wallet = useWallet();
  const yam = useYam();
  const coreWalletBalance = useCoreBalance();
  const pairNames = Object.keys(pairInfoMap);
  const middle = Math.ceil(pairNames.length / 2);
  const windowsContext = React.useContext(WindowsContext);

  const pairNamesRows = [
    [...pairNames.slice(0, middle)],
    [...pairNames.slice(middle, pairNames.length)]
  ];

  const pairPids = pairNames.map(key => pairInfoMap[key].pid);
  const userPendingInPools = useUserPoolPending(pairPids, wallet.account);

  return <>
    <CoreSummaryPanel label="CORE">
      <CoreSummaryPanelLeft>
        <BalancesDisplay>
          Total <ScrambleDisplay decimals={0} value={parseFloat(coreWalletBalance / 1e18) + parseFloat(userPendingInPools.value)}/>
        </BalancesDisplay>
        <BalancesDisplay>
          Wallet <ScrambleDisplay value={coreWalletBalance}/>
        </BalancesDisplay>
        <BalancesDisplay>
          Total Claimable <ScrambleDisplay value={userPendingInPools.value} decimals={0} precision={8}/>
        </BalancesDisplay>
      </CoreSummaryPanelLeft>
      <CoreSummaryPanelRight>
        <a href={`https://app.uniswap.org/#/swap?outputCurrency=0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7`}
            target="_blank" rel="noopener noreferrer">
          <Button style={{ width: '90px' }}>Get {coreWalletBalance > 0 && 'More'}</Button>
        </a>
      </CoreSummaryPanelRight>
    </CoreSummaryPanel>
    <div className="staking-grid">
      {wallet.account && pairNamesRows.map((row, rowIndex) =>
        <div key={`row-${rowIndex}`} className="staking-grid-row">
        {row.map(pairName => 
            <PairSummary
              className="staking-grid-row-cell"
              key={`summary-${pairName}`}
              pairName={pairName}
              setWalletWindowState={setWalletWindowState} />
        )}
      </div>
      )}
    </div>
  </>
};

export default SummaryTab;
