import React from 'react';
import {
  Panel,
  Bar,
  Button
} from 'react95';
import { CoreWindow } from '../../../components/Windows';
import { WindowsContext } from '../../../contexts/Windows';
import { WindowType } from '../../../config/windowTypes.config';
import { WebampPlayTrackButton } from '../../../components/Webamp';
import CoreWindowContent from '../../../components/Windows/CoreWindowContent';
import mediumSVG from '../../../assets/img/medium.svg';
import bookIMG from '../../../assets/img/book2.png';
import CoreToolbar from '../../../components/Toolbar/CoreToolbar';

const ReadMore = props => {
  const windowsContext = React.useContext(WindowsContext);

  const text = String.raw
`=====================
Introducing CORE
=====================

CORE is a non-inflationary cryptocurrency that is designed to execute profit-generating strategies autonomously with a completely decentralized approach. In existing autonomous strategy-executing platforms a team or single developer is solely responsible for determining how locked funds are used to generate ROI. This is hazardous to the health of the fund as it grows, as it creates flawed incentives, and invites mistakes to be made. CORE does away with this dynamic and instead opts for one with decentralized governance.

CORE tokens holders will be able to provide strategy contracts and vote on what goes live and when, in order to decentralize autonomous strategy execution. 5% of all profits generated from these strategies are used to auto market-buy the CORE token.

=====================
Initial Distribution
=====================

The CORE team is kickstarting the initial distribution with a liquidity event. Contribute ETH to the CORE Fair Launch smart contract to receive tokens, and the contributed ETH will be matched and added to the Uniswap liquidity pool. Note that once added, liquidity tokens can not be removed from the CORE Uniswap LP pools. This is by design. Read on to learn about why..

=====================
Powered by Real Yield
=====================

To encourage real value and TVL to flow into CORE, CORE smart contracts employ interchangeable strategies that farm the coins inside the pools. This gives a great incentive to anyone who wants to farm CORE with coins other than CORE/ETH LP. All the yield from staked funds will go to market-buy CORE. This creates a positive relationship for both parties. CORE holders will always benefit from yield bearing activities done on the CORE smart contracts. Even when farmers sell, a transfer fee on sales of CORE tokens are returned to the farming pools. This means buying pressure will generally be more intense than selling pressure.

Many believe that the act of adding additional pools is disincentivized by the fact that it can dilute the rewards for the pools people are currently farming. In our model, this is lessened by the nature of CORE fees being paid out by additional farming pools. Although farmers are diluted in their rewards, the CORE they have appreciate in value due to the positive market pressure.


=====================
Deflationary Farming
=====================

Farming tokens have a problem for their owners. To keep users farming, they have to mint ever more coins. This completely destroys the value of the underlying token, due to excessive inflation. It's easy to find examples of this across the DeFi ecosystem.

Our solution is called deflationary farming, and it is quite simple in only two steps:

1. Charge a fee on token transfers
2. Users can earn the fee by farming

This simple process means that those holding tokens are able to farm without infinite inflation.

=====================
Keeping Liquidity Liquid
=====================

All transfers have to be approved by the CORE Transfers smart contract, which will block all
liquidity withdrawals from Uniswap. This will guarantee a stable market, giving holders and farmers skin in the game.

=====================
Real Governance
=====================

CORE is designed for great community governance. The community decides everything, from developer fees, to deciding on the fee approver contract, adding new pools, rebalancing, and even disabling pools in the CORE Transfer contract.

If the holders decide COREVault should have a YFI pool, we can set
the ratio of fees it will be able to distribute, as well as when people should be
able to withdraw YFI tokens from it.

=====================
10000 CORE Forever
=====================

Theres absolutely no way to create new CORE tokens. This means the
circulating supply can only ever go down, period.
`;

  return (
    <CoreWindow
      {...props}
      windowTitle='Read More - Notepad'
      top='20vh'
      width='800px'
      height='600px'
      left={`${window.innerWidth / 4}px`}
    >
      <CoreWindowContent>
        <CoreToolbar>
          <Bar size={35} />
          <Button variant='menu' onClick={() => window.open('https://medium.com/@CORE_Vault/introducing-core-fef3e1b77d12', '_blank')}>
            <img alt="medium" src={mediumSVG} width="24" height="24" style={{ paddingRight: '0.5rem' }} /> Read on Medium
          </Button>
          <Button variant='menu' onClick={(e) => windowsContext.openWindow(WindowType.Articles, e)}>
            <img alt="articles" src={bookIMG} width="24" height="24" style={{ paddingRight: '0.5rem' }} /> More Articles...
          </Button>
          <WebampPlayTrackButton trackId={2} text="Listen" />
        </CoreToolbar>
        <Panel variant="well" style={{ backgroundColor: 'white', overflowY: 'auto', height: '100%', padding: '0.5em' }}>
          <pre>{text}</pre>
        </Panel>
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default ReadMore;
