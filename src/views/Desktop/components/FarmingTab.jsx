import React from 'react'
import styled from 'styled-components';
import {
  Button,
  Fieldset,
  Anchor
} from 'react95';
import useVaultRewardStats from "../../../hooks/useVaultRewardStats";
import { DATA_UNAVAILABLE, pairInfoMap } from "../../../yam/lib/constants";
import { useWallet } from 'use-wallet';
import modemIMG from '../../../assets/img/modem.png';
import useYam from '../../../hooks/useYam';
import { useUserPoolPending, useUserStakedInPool } from '../../../hooks';
import { claimCORE } from '../../../utils';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { getUniswapInfoWindowName } from '../windows/UniswapInfoWindow';
import { getTransactionWindowName } from '../windows/TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import './styles/staking-grid.css'
import { TransactionButton } from '../../../components/Button';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';

const StakingBox = styled(Fieldset)`
  height: 150px;
  text-align: left;

  @media only screen and (max-width: 767px) {
    height: auto;
  }
`;

const RouterButton = ({ routerUnavailable }) => {
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  
  return <>
    <Button
      disabled={!wallet.account || routerUnavailable} fullWidth primary
      onClick={(e) => windowsContext.openWindow(WindowType.Router, e)}>

      <img alt="modem" src={modemIMG} style={{ height: '20px', paddingRight: '0.5rem' }} />
        One Click Buy &amp; Stake
      </Button>
  </>;
};

const FarmingPairs = () => {
  const wallet = useWallet();
  const pairNames = Object.keys(pairInfoMap);
  const middle = Math.ceil(pairNames.length / 2);

  const pairNamesRows = [
    [...pairNames.slice(0, middle)],
    [...pairNames.slice(middle, pairNames.length)]
  ];

  return <div className="staking-grid">
    {wallet.account && pairNamesRows.map((row, rowIndex) =>
      <div key={`row-${rowIndex}`} className="staking-grid-row">
        {row.map(pairName => <FarmingPair
          className="staking-grid-row-cell"
          key={`farming-${pairName}`}
          routerUnavailable={pairInfoMap[pairName].routerUnavailable}
          pairName={pairName} />)}
      </div>
    )}
  </div>
};

const FarmingPair = ({
  className,
  pairName,
  routerUnavailable
}) => {
  const pairInfo = pairInfoMap[pairName];
  const wallet = useWallet();
  const yam = useYam();
  const windowsContext = React.useContext(WindowsContext);
  const vaultRewardStats = useVaultRewardStats(pairName);
  const CORELPstakedInPool = useUserStakedInPool(pairInfo.pid, wallet.account);
  const userPendingInPool = useUserPoolPending([pairInfo.pid], wallet.account);
  const uniswapInfoWindowName = getUniswapInfoWindowName(pairName);

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
      WindowType.Transaction, null, {
      type: 'withdraw',
      additional: {
        pid: pairInfo.pid
      }
    }, { windowName: getTransactionWindowName('withdraw') });

    CORELPstakedInPool.refresh();
    userPendingInPool.refresh();
  };

  return <div className={className}>
    <StakingBox label={`${pairInfo.name} UNIv2 LP`}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          Staked <ScrambleDisplay value={parseFloat(CORELPstakedInPool.value / 1e18 * pairInfo.supplyScale)} decimals={0} /> {pairInfo.unit}
        </div>
      </div>
      <div>
        APY <ScrambleDisplay value={parseFloat(vaultRewardStats.apy)} decimals={0} precision={0} />%*
        </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          Claimable <ScrambleDisplay value={parseFloat(userPendingInPool.value)} precision={8} decimals={0} />
        </div>
      </div>
      {wallet.account && <Anchor href="#" onClick={(e) => {
        windowsContext.openWindow(WindowType.UniswapInfo, e, { pairName }, { windowName: uniswapInfoWindowName })
      }}> More info... </Anchor>}

      <div style={{ marginTop: '1em' }}>
        <TransactionButton style={{ flex: '50%', marginRight: '0.5em' }}
          text="Unstake"
          textLoading="Unstaking..."
          disabled={parseFloat(CORELPstakedInPool.value * pairInfo.supplyScale / 1e18).toFixed(6) <= 0 ? 'disabled' : ''}
          onClick={_ => onUnstake()} />

        <TransactionButton style={{ flex: '50%' }}
          text="Claim"
          textLoading="Claiming..."
          disabled={userPendingInPool.value <= 0 ? 'disabled' : ''}
          onClick={_ => onClaimCORE()} />
      </div>
      {/*<div style={{ marginTop: '0.5em' }}>
        <RouterButton routerUnavailable={routerUnavailable} />
    </div>*/}
    </StakingBox>
  </div>
};

const FarmingTab = () => {
  const wallet = useWallet();
  const yam = useYam();
  const [daysSinceFees, setDaysSinceFees] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    if (yam)
      (async () => {
        const blockStartFees = await yam.contracts.COREVAULT.methods.epochCalculationStartBlock().call();
        const currentBlock = await yam.web3.eth.getBlockNumber();
        const blocksInPast = currentBlock - blockStartFees;
        setDaysSinceFees(blocksInPast / (86400 / 13));
      })();
  }, [yam]);

  return (
    <div style={{ textAlign: 'justify' }}>
      <FarmingPairs />
      <div style={{ marginTop: '1em' }}>
        **APY calculation is calculated as an average of fees over the last {daysSinceFees !== DATA_UNAVAILABLE ? daysSinceFees.toFixed(2) : DATA_UNAVAILABLE} days, current TVL and CORE
        price. All future pools will be carefully picked to maximise opportunities for the CORE community.
      </div>
    </div>
  );
};

export default FarmingTab;
