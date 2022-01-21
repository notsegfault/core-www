import React from 'react';
import { withResizeDetector } from 'react-resize-detector';
import TopBar from '../../components/TopBar/TopBar';
import styled from 'styled-components';
import fannyZoneTheme from 'react95/dist/themes/maple';
import fannyAdBannerIMG from '../../assets/img/fanny/banner_medium.gif';
import '../../styles/effects.css';

import {
  Anchor,
} from 'react95';

import {
  useLiquidityStats, useYam,
} from '../../hooks';

import BigNumber from 'bignumber.js';
import arcadiaIMG from '../../assets/img/arcadiaLogo.png';
import msdosIMG from '../../assets/img/ms_dos-1.png';
import coverLogoIMG from '../../assets/img/cover-logo.png';
import fannyBackgroundIMG from '../../assets/img/fanny/background.png';
import { DESKTOP_ZINDEX, WindowsContext } from '../../contexts/Windows';
import { WindowLoadingComponent } from '../../components/Loading';
import { WindowType } from '../../config/windowTypes.config';
import FotWidget from './components/FotWidget';
import { SettingsContext } from '../../contexts/Settings';
import Hamster from '../../components/Memes/Hamster';
import { useWallet } from 'use-wallet';
import { WindowComponents } from '../../config/desktop.config';
import { APP_VERSION } from '../../yam/lib/constants';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const DesktopIcon = styled.div`
  width: 100px;
  text-align: center;
  cursor: pointer;
  padding: 5px;

  &:active {
    background-color: blue;
    color: white;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  display: block;
  background: rgba(0,0,0,0.3);
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: ${props => props.zIndex};
`;

const FundProtectedCover = styled.div`
  display: none;
  a {
    text-decoration: none;
    display: flex;
    border-radius: 1rem;
    margin: auto;
    background-color: rgba(0, 0, 0, 0.1);
    width: max-content !important;
    padding: 0.2em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    margin-top: 0.5em;

    img {
      margin-right: 0.5em;
      flex-shrink: 0;
      align-self: center;
    }

    span {
      color: black;
      align-self: center;
    }

    @media only screen and (max-width: 767px) {
      img {
        widthL 16px;
        height: 18px;
      }
    }
  }
`;

const OnlinePresenceLinks = styled.div`
  margin-top: 1em;
`;

const Desktop = ({width, height}) => {
  const settings = React.useContext(SettingsContext);
  const liquidityStats = useLiquidityStats();
  const yam = useYam();
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const [backgroundStyle, setBackgroundStyle] = React.useState({});

  const [enteringFannyZone, setEnteringFannyZone] = React.useState(false);

  React.useEffect(() => {
    windowsContext.updateDesktopSize(width, height);
  }, [width, height]);

  const onEnterFannyZone = async e => {
    if (enteringFannyZone) {
      return;
    }

    setEnteringFannyZone(true);

    settings.set('theme', fannyZoneTheme);

    const wait = async (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    const playSound = async (soundName, waitBefore, waitAfter) => {
      if (!localStorage.fannyIntroPlayed) {
        await wait(waitBefore);
        new Audio(`${process.env.PUBLIC_URL}/sounds/${soundName}.ogg`).play();
        await wait(waitAfter);
      }
    };

    const playSequence = async () => {
      settings.set('fannyzone', true);
      await playSound('fanny_snd01', 1000, 8000);

      setBackgroundStyle({
        backgroundImage: `url(${fannyBackgroundIMG})`,
      });

      await playSound('fanny_snd02', 0, 8000);
      settings.set('theme', fannyZoneTheme);

      await playSound('fanny_snd03', 0, 200);
    };

    await playSequence();
    localStorage.fannyIntroPlayed = true;

    windowsContext.openWindow(WindowType.FannyMain);

    setEnteringFannyZone(false);
  };

  const renderBackdrop = () => {
    const frontWindow = windowsContext.getFrontWindow();
    if (frontWindow && frontWindow.modal) {
      const zIndex = frontWindow.zIndex - 1;
      return <Backdrop zIndex={zIndex} />;
    }

    return <></>;
  };

  const renderWindows = () => {
    return Object.keys(windowsContext.windows).map(windowName => {
      const window = windowsContext.windows[windowName];

      if (!(window.type in WindowComponents)) {
        throw new Error(`${window.type} must be registered in the WindowComponents list.`)
      }

      const component = WindowComponents[window.type].component;
      return <React.Suspense key={`${windowName}-suspense`} fallback={<WindowLoadingComponent />}>
        {React.createElement(component, { ...window.props, key: windowName })}
      </React.Suspense>
    })
  };

  return <>
    <div id="desktop-background" style={backgroundStyle}/>
    <div id="desktop">
      <div id="fanny-ad-banner" style={{ zIndex: DESKTOP_ZINDEX + 1, display: yam ? 'block' : 'none' }}>
        <img onClick={e =>onEnterFannyZone()} style={{height:'90px', borderRadius:'2px'}} src={fannyAdBannerIMG} alt="fanny-banner" />
      </div>
      <div style={{ zIndex: DESKTOP_ZINDEX + 1, position: 'absolute', left: '2%', top: '2%' }}>
        {wallet.status === 'connected' && <DesktopIcon onClick={e => onEnterFannyZone()}>
          <img alt="enter-fanny-zone" src={msdosIMG} />
          <div>Enter FannyZone</div>
        </DesktopIcon>}
      </div>
      <div style={{ position: 'absolute', right: '2%', top: '2%' }}>
        <FotWidget />
      </div>
      {renderWindows()}
      <div className="center" style={{ zIndex: DESKTOP_ZINDEX }}>
        <Hamster />
      </div>
      <a
        id="arcadiagroup-audit-banner"
        href="https://arcadiamgroup.com/audits/CoreFinal.pdf"
        target="_blank"
        rel="noopener noreferrer"
        style={{ zIndex: DESKTOP_ZINDEX - 2 }}
      >
        CORE smart contracts have been audited by the Arcadia Group.
        <img
          src={arcadiaIMG}
          alt="arcadia logo"
          style={{
            width: '97px',
            height: '36px',
            paddingBottom: '0.8rem',
            margin: 'auto',
          }}
        />
      </a>

      <h1 id="core-message" style={{ zIndex: DESKTOP_ZINDEX }}>
        <div>CoreVault is the first high yield farmable deflationary DeFi token</div>
        CORE is backed by <span style={{ fontWeight: 'bold' }}>${liquidityStats.tll.toLocaleString('en')}</span> in locked liquidity -<br />
        <span style={{ fontWeight: 'bold' }}>${liquidityStats.tvpl.toLocaleString('en')}</span> of which is <span style={{ fontWeight: 'bold' }}>permanently locked</span>.
        <FundProtectedCover>
          <Anchor href="https://app.coverprotocol.com/app/marketplace/protocols/CORE" target="_blank">
            <img src={coverLogoIMG} /><span>Funds protected by COVER</span>
          </Anchor>
        </FundProtectedCover>
        <OnlinePresenceLinks>
          We are on{' '}
          <Anchor href="https://t.me/COREVault" target="_blank">
            Telegram
          </Anchor>
          ,{' '}
          <Anchor href="https://discord.gg/hPUm9Jh" target="_blank">
            Discord
          </Anchor>{' '}
          ,{' '}
          <Anchor href="https://twitter.com/CORE_Vault" target="_blank">
            Twitter
          </Anchor>{' '}
          ,{' '}
          <Anchor href="https://github.com/cVault-finance" target="_blank">
            Github
          </Anchor>{' '}
          ,{' '}
          <Anchor href="https://uniswap.info/pair/0x32ce7e48debdccbfe0cd037cc89526e4382cb81b" target="_blank">
            Uniswap
          </Anchor>
          {' '}and{' '}
          <Anchor href="https://defipulse.com/cvault.finance" target="_blank">
            Defi Pulse
          </Anchor>
        </OnlinePresenceLinks>
      </h1>
    </div>
    <TopBar />
    {renderBackdrop()}
  </>
};

export default withResizeDetector(Desktop);
