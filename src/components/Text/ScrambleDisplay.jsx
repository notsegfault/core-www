
import React from 'react'
import { RandomTextScrambleAnimation } from ".";
import connectGIF from '../../assets/img/connect.gif';
import searchIMG from '../../assets/img/search.png';
import BigNumber from 'bignumber.js';
import { WindowsContext } from "../../contexts/Windows";
import { WindowType } from '../../config/windowTypes.config';
import { printable } from '../../helpers';
import { useWallet } from 'use-wallet';

const ScrambleDisplay = ({ value, decimals = 18, precision = 6, children }) => {
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);

  const onConnectWallet = e => {
    windowsContext.openWindow(WindowType.MyWallet, e, { connectingState: 'wantsToConnect' }, { reload: true });
  };

  const amount = new BigNumber(value);

  if (amount.isNaN()) {
    if (wallet.account) {
      return <div style={{ display: 'inline-flex' }}>
        <img alt="search" style={{ height: '1em', padding: '0 0.2em' }} src={searchIMG} />
        <RandomTextScrambleAnimation />
      </div>
    } else {
      return <div style={{ display: 'inline-flex', cursor: 'pointer'}} onClick={e => onConnectWallet(e)}>
        <img alt="connect" style={{ height: '1em', padding: '0 0.2em' }} src={connectGIF} />
        <RandomTextScrambleAnimation />
      </div>
    }
  }

  const formattedAmount = printable.getPrintableTokenAmount(amount, decimals, precision);

  if (children) {
    return <>{children({
      value: formattedAmount
    })}</>;
  }

  return <>{formattedAmount}</>;
};

export default ScrambleDisplay;
