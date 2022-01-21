import React from 'react';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import { pairInfoMap } from '../../../yam/lib/constants';
import UniswapInfo from '../components/UniswapInfo';

export const UNISWAP_INFO_WINDOWNAME_PREFIX = 'uniswap-info-pair';
export const getUniswapInfoWindowName = pairName => `${UNISWAP_INFO_WINDOWNAME_PREFIX}-${pairName}`;

const UniswapInfoWindow = ({ pairName, ...props }) => {
  const pairInfo = pairInfoMap[pairName];

  return (
    <CoreWindow
      {...props}
      windowTitle={`${pairInfo.name} Uniswap Pair Information`}
      width='600px'
      minWidth='600px'
      maxWidth='600px'
      top='20vh'
      left={`${window.innerWidth / 3}px`}
    >
      <CoreWindowContent extraPadding>
        <UniswapInfo pairName={pairName} />
      </CoreWindowContent>
    </CoreWindow>
  );
};

export default UniswapInfoWindow;
