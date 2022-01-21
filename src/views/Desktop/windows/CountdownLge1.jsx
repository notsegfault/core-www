import React from 'react';
import { CoreWindow } from '../../../components/Windows';
import {
  Progress,
} from 'react95';

import {
  useETHPrice,
  useLGEEndTime,
  useTotalContributed,
  useUserContributed,
} from '../../../hooks';

import liquidityIMG from '../../../assets/img/liquidity.png';
import checkmarkIMG from '../../../assets/img/checkmark.png';
import useWallet from 'use-wallet';
import { formatNaN, formatNaNWithCommas } from '../../../utils/util';
import LinkButton from '../components/LinkButton';
import { WindowsContext } from '../../../contexts/Windows';
import { WindowType } from '../../../config/windowTypes.config';

const CountdownLge1 = props => {
  const windowsContext = React.useContext(WindowsContext);
  const wallet = useWallet();
  const totalContributed = useTotalContributed();
  const userContributed = useUserContributed(wallet.account);
  const endTime = useLGEEndTime();
  const ethPrice = useETHPrice();
  let percentLeft = Math.min(
    100,
    100 - ((1601142008 - Date.now() / 1000) / (60 * 60 * 24 * 7)) * 100
  );
  if (isNaN(percentLeft)) percentLeft = 0;
    
  return (
      <CoreWindow
        {...props}
        windowTitle='Liquidity Event'
        width='500px'
      >
        <div style={{ padding: '1rem', background: '#c0c0c0 !important' }}>
          <h1>Liquidity Event is {percentLeft === 100 ? 'over' : 'ongoing...'}</h1>
          <Progress value={percentLeft > 0 ? percentLeft : 0} variant="tile" />

          <br />

          <h1 style={{ paddingTop: '1.5rem' }}>
            Fairly launching
            <img alt="checkmark" src={checkmarkIMG} width={24} /> <br />
          </h1>
          <h2>
            CORE {percentLeft < 100 ? 'will start' : 'started'} with at least $
            {formatNaNWithCommas((parseFloat(totalContributed / 1e18) * ethPrice * 2).toFixed(2))}{' '}
            in <span style={{ fontWeight: 'bold' }}>locked forever</span> liquidity!
          </h2>

          <h2
            style={{
              paddingTop: '1.5rem',
              fontSize: '1.2rem',
              lineHeight: '2rem',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>
              {formatNaN(parseFloat(totalContributed / 1e18).toFixed(0))}
            </span>{' '}
            ETH Total Contributed <br />
            {endTime * 1000 > Date.now() && (
              <>
                <span style={{ fontWeight: 'bold' }}>
                  {formatNaN(parseFloat(userContributed).toFixed(2))}
                </span>{' '}
                ETH Your Contribution <br />{' '}
              </>
            )}
            <span style={{ fontWeight: 'bold' }}>
              $
              {formatNaNWithCommas(
              (parseFloat(totalContributed / 10000 / 1e18) * ethPrice).toFixed(2)
            )}
            </span>{' '}
            CORE Price Estimate after LGE <br />
            <span style={{ fontWeight: 'bold' }}>
              ${formatNaNWithCommas((parseFloat(totalContributed / 1e18) * ethPrice).toFixed(2))}
            </span>{' '}
            Market Cap <br />
            {percentLeft === 100 && 'Thank You to everyone who participated!'}
          </h2>

          <div style={{ display: 'flex', paddingTop: '1.5rem' }}>
            <LinkButton
              fullWidth
              primary
              style={{
                marginRight: 8,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
              onClick={() => windowsContext.openWindow(WindowType.Deposit)}
              size="lg"
              disabled={1601142008000 < Date.now()}
            >
              <img alt="liquidity" src={liquidityIMG} width={24} style={{ paddingRight: '0.5rem' }} />
              Add Liquidity and Get LP Tokens
            </LinkButton>
          </div>
        </div>
      </CoreWindow>
  );
};

export default CountdownLge1;