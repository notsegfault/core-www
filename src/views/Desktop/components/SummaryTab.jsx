import React from 'react';
import styled from 'styled-components';
import { Button, Fieldset } from 'react95';
import { useWallet } from 'use-wallet';
import { BalancesDisplay } from '../../../components/Text';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import {
  useCoreBalance,
  useUserPoolPending,
} from '../../../hooks';
import { pairInfoMap } from '../../../yam/lib/constants';
import './styles/staking-grid.css';
import CoreDAOMigration from './CoreDAOMigration';


const CoreSummaryPanel = styled(Fieldset)`
  display: grid;
  grid-template-columns: 1fr 0.3fr;

  @media only screen and (max-width: 767px) {
    display: block !important;

    Button,
    TransactionButton {
      margin-top: 0.5em;
    }
  }
`;

const CoreSummaryPanelLeft = styled.div``;

const CoreSummaryPanelRight = styled.div`
  text-align: center;
  margin: auto;

  @media only screen and (max-width: 767px) {
    text-align: left;
    margin: none;
  }
`;

const SummaryTab = ({ setWalletWindowState }) => {
  const wallet = useWallet();
  const coreWalletBalance = useCoreBalance();
  const pairNames = Object.keys(pairInfoMap);
  const pairPids = pairNames.map(key => pairInfoMap[key].pid);
  const userPendingInPools = useUserPoolPending(pairPids, wallet.account);

  return (
    <>
      <CoreSummaryPanel label="CORE">
        <CoreSummaryPanelLeft>
          <BalancesDisplay>
            Total{' '}
            <ScrambleDisplay
              decimals={0}
              value={parseFloat(coreWalletBalance / 1e18) + parseFloat(userPendingInPools.value)}
            />
          </BalancesDisplay>
          <BalancesDisplay>
            Wallet <ScrambleDisplay value={coreWalletBalance} />
          </BalancesDisplay>
          <BalancesDisplay>
            Total Claimable{' '}
            <ScrambleDisplay value={userPendingInPools.value} decimals={0} precision={8} />
          </BalancesDisplay>
        </CoreSummaryPanelLeft>
        <CoreSummaryPanelRight>
          <a
            href={`https://app.uniswap.org/#/swap?outputCurrency=0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button style={{ width: '90px' }}>Get {coreWalletBalance > 0 && 'More'}</Button>
          </a>
        </CoreSummaryPanelRight>
      </CoreSummaryPanel>
      <CoreDAOMigration />
    </>
  );
};

export default SummaryTab;
