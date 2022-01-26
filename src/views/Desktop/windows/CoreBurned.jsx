import React, { useState } from 'react';
import { Panel, Bar, Button, Anchor } from 'react95';
import { CoreScrollableContent, CoreWindow } from '../../../components/Windows';
import { WindowsContext } from '../../../contexts/Windows';
import CoreWindowContent from '../../../components/Windows/CoreWindowContent';
import coreBurnIMG from '../../../assets/img/coreburn.png';
import hamsterBurnIMG from '../../../assets/img/hammieburn.png';
import styled from 'styled-components';
import { useBurnedCore, useCoreBalance, useCorePrice, useUserTokenBalance } from '../../../hooks';
import { printable } from '../../../helpers';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import { WindowType } from '../../../config/windowTypes.config';

const HamsterBurnContainer = styled.div`
  margin-right: 1em;
  flex-grow: 0;

  @media only screen and (max-width: 767px) {
    margin-right: 0em;
  }
`;

const HamsterBurnVideoContainer = styled.video`
  width: 100%;
  @media only screen and (max-width: 767px) {
    width: 65%;
  }
`;

const TextContainer = styled.div`
  flex-grow: 1;
  text-align: center;

  @media only screen and (max-width: 767px) {
    font-size: 0.7em;
  }
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  @media only screen and (max-width: 767px) {
    display: block;
    text-align: center;
  }
`;
const CoreBurned = props => {
  const stats = useBurnedCore();
  const corePrice = useCorePrice();
  const windowsContext = React.useContext(WindowsContext);

  const [coreValue, setCoreValue] = useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    if (corePrice.inUSD !== DATA_UNAVAILABLE && stats.burned !== DATA_UNAVAILABLE) {
      const burned = stats.burned.toString() / 1e18;
      setCoreValue(`$${(burned * corePrice.inUSD).toLocaleString('en')}`);
    }
  }, [corePrice, stats]);
  return (
    <CoreWindow
      {...props}
      windowTitle="coreburn.exe"
      top="10px"
      icon={coreBurnIMG}
      width="1240px"
      left="10px"
    >
      <CoreScrollableContent>
        {/*<div>
        Starting on 26 January 2022, 1/7th of the CORE is burning every day leading up to the CORE lending protocol launch, for a total of 8,300 CORE.
        </div>
        <iframe style={{marginTop: "1em"}} src={CoreBurnedDuneAnalytics} width="100%" height="100%"/>*/}
        <Content>
          <HamsterBurnContainer>
            <HamsterBurnVideoContainer autoPlay loop>
              <source src={`${process.env.PUBLIC_URL}/coreburn.mp4`} type="video/mp4" />
            </HamsterBurnVideoContainer>
          </HamsterBurnContainer>
          <TextContainer>
            <div style={{ alignSelf: 'center', marginTop: '1em', marginBottom: '3em' }}>
              <div style={{ fontSize: '3em' }}>coreburn.exe initiated</div>
              <div style={{ fontSize: '6em' }}>Day {stats.day}</div>
              <div style={{ fontSize: '3em', textShadow: '#8a8a8a 6px 6px 5px' }}>
                <span style={{ color: '#d60000' }}>
                  {printable.getPrintableTokenAmount(stats.burned, 18, 0)}
                </span>{' '}
                / 8300 <span style={{ fontSize: '0.5em' }}>CORE</span>
              </div>
              <div style={{ marginTop: '1em', fontSize: '3em' }}>
                Value Burned: <div style={{ textShadow: '#8a8a8a 6px 6px 5px' }}>{coreValue}</div>
              </div>
            </div>
            <Anchor
              href="#"
              style={{  fontSize: '1.5em' }}
              onClick={e => {
                windowsContext.openWindow(WindowType.CoreBurnedChart, e);
              }}
            >
              Open Burn History Chart...
            </Anchor>
          </TextContainer>
        </Content>
      </CoreScrollableContent>
    </CoreWindow>
  );
};
export default CoreBurned;
