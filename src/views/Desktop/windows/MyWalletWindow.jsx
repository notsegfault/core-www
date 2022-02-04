
import React, { useState } from 'react'
import {
  Button,
  Hourglass,
  Tabs,
  Avatar,
  Anchor
} from 'react95';
import styled from 'styled-components'
import classnames from 'classnames';
import { useWallet } from 'use-wallet';
import { addressSummary } from '../../../utils/util';
import bookIMG from '../../../assets/img/book.png';
import connectGIF from '../../../assets/img/connect.gif';
import connectIMG from '../../../assets/img/plug.png';
import metamaskSVG from '../../../assets/img/metamask-fox.svg';
import walletconnectSVG from '../../../assets/img/wallet-connect.svg';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import SummaryTab from '../components/SummaryTab';
import FarmingTab from '../components/FarmingTab';
import JazzIcon from '../../../components/JazzIcon';
import Header from '../components/Header';
import { WindowsContext } from '../../../contexts/Windows';
import { WindowType } from '../../../config/windowTypes.config';
import { CoreTab, CoreTabBody } from '../../../components/Tab';
import { isMobile } from 'react-device-detect';
import { UnorderedList } from '../../../components/List';
import { APP_VERSION } from '../../../yam/lib/constants';
import CoreDAOMigration from '../components/CoreDAOMigration';
import newIMG from '../../../assets/img/new-gif-icon-28.jpg';

const ConnectionWindowContent = styled.div`
  margin-top: 0.3em;
  display: block;
  h1 {
    margin-bottom: 0.5em;
    text-align: center;
  }
`;

const ButtonWrapper = styled.div`
  display: grid;
  width: 85%;
  margin: auto;
  margin-top: 0.5em;
  margin-bottom: 1em;
  grid-template-columns: 1fr 0.1fr 1fr;
  text-align: center;
  
  @media only screen and (max-width: 320px) {
    width: 100% !important;
  }
`;

const MyWalletWindow = props => {
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const [connectedAttempt, setConnectedAttempt] = React.useState('');

  const [connectingState, setConnectingState] = React.useState(
    wallet.account ? 'connected' : 'waiting'
  );

  const [state, setState] = React.useState({
    activeTab: props.activeTab || 0,
  });

  const handleChange = (e, value) => setState({ activeTab: value });
  const { activeTab } = state;

  React.useEffect(() => {
    if (wallet.account) {
      setConnectingState('connected');
    }

    else if (connectingState === 'connected') {
      setConnectingState('waiting');
    }
  }, [wallet]);

  React.useEffect(() => {
    if (props.connectingState) {
      setConnectingState(props.connectingState);
    }
  }, [props.connectingState]);

  const WaitingForConnection = () => (
    <>
      <ConnectionWindowContent>
        <h1 style={{ textAlign: 'center' }}>Ready to farm without inflation?</h1>
        <ButtonWrapper>
          <div>
            <Button
              size="lg"
              primary
              fullWidth
              onClick={() => setConnectingState('wantsToConnect')}
            >
              <img alt="connect" src={connectIMG} style={{ height: '1.5rem', paddingRight: '0.5rem' }} />
              Connect Wallet
          </Button>
          </div>
          <div></div>
          <div>
            <Button
              size="lg"
              fullWidth
              onClick={(e) => windowsContext.openWindow(WindowType.ReadMore, e)}
            >
              <img alt="book" src={bookIMG} style={{ height: '1.5rem', paddingRight: '0.5rem' }} />
              Read More
            </Button>
          </div>
        </ButtonWrapper>
      </ConnectionWindowContent>
    </>
  );

  const onConnectionTroubleshoot = async (e) => {
    const steps = isMobile ? <>
      <li>Reload the page</li>
      <li>Be sure to approve the connection</li>
      <li>Connect your wallet using Walletconnect</li>
      <li>Close all apps that might use Walletconnect</li>
      <li>Update Metamask to the latest version</li>
    </> : <>
      <li>Reload the page</li>
      <li>Be sure to approve the connection</li>
      <li>Make sure another wallet is not conflicting with the connection approval</li>
      <li>Connect your wallet using Walletconnect</li>
    </>;

    const additionnalSteps = isMobile ? <p style={{ marginTop: '0.5em' }}>
      If your case is not solved with the solution above, please try and use a computer.
    </p> : <></>;

    const content = <>
      <strong>If you're experiencing issues when connecting your wallet, try the following troubleshooting tips.</strong>
      <UnorderedList style={{ marginTop: '0.5em' }}>
        {steps}
      </UnorderedList>
      {additionnalSteps}
    </>;

    return windowsContext.showDialog('Connection Troubleshoot', content, <>Ok</>, e, { width: '500px' })
  };

  const renderConnectionStatus = () => {
    switch(wallet.status) {
      case 'connecting':
        return <>Waiting for your approval</>;
      case 'error':
        return <>
          <div>Error connecting</div>
          <div style={{ fontSize: '0.8em' }}><Anchor onClick={e => onConnectionTroubleshoot(e)} href="#">Having trouble connecting?</Anchor></div>
        </>;
      default:
        return <>Connect with ...</>;
    }
  };

  const ConnectorButtons = () => (
    <>
      <ConnectionWindowContent>
        <h1>{renderConnectionStatus()}</h1>
        {wallet.status === 'connecting' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1em' }}>
            <Hourglass />
          </div>
        )}
        <ButtonWrapper>
          <div>
            <Button
              size="lg"
              style={{
                height: '100px',
                flexDirection: 'column',
                fontSize: '1.5rem'
              }}
              fullWidth
              active={connectedAttempt === 'injected' && wallet.status === 'connecting'}
              onClick={() => {
                setConnectedAttempt('injected');
                wallet.connect('injected');
              }}
            >
              <img alt="metamask" src={metamaskSVG} width="80" height="60" style={{ paddingBottom: '0.5rem' }} />
              Metamask
            </Button>
          </div>
          <div></div>
          <div>
            <Button
              size="lg"
              style={{
                height: '100px',
                flexDirection: 'column',
                fontSize: '1.5rem'
              }}
              active={connectedAttempt === 'walletconnect' && wallet.status === 'connecting'}
              fullWidth
              onClick={() => {
                setConnectedAttempt('walletconnect');
                wallet.connect('walletconnect');
              }}
            >
              <img
                src={walletconnectSVG}
                width="80"
                height="60"
                alt="connect"
                style={{ paddingBottom: '0.5rem' }}
              />
              Walletconnect
            </Button>
          </div>
          <div style={{ flex: '2%' }}></div>
        </ButtonWrapper>
      </ConnectionWindowContent>
    </>
  );

  const getAvatarStyles = diameter => ({
    height: diameter,
    width: diameter,
    borderRadius: diameter / 2,
  });

  const windowSize = {
    width: 550,
    height: 434
  };

  const [position, setPosition] = React.useState({
    top: 0,
    left: 0
  });

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!windowsContext.desktopSize || isMobile) return;

    const top = (document.getElementById('core-message').offsetTop - windowSize.height) / 2;
    const left = (windowsContext.desktopSize.width - windowSize.width) / 2;
  
    switch(connectingState) {
      case 'waiting':
      case 'wantsToConnect':
        setPosition({
          top: ((top / windowsContext.desktopSize.height) * 100) + '%',
          left: ((left / windowsContext.desktopSize.width) * 100) + '%',
        });
        break;

      default:
        setPosition({
          top: '8%',
          left: ((left / windowsContext.desktopSize.width) * 100) + '%',
        });
        break;
    }

    setVisible(true);
  }, [windowsContext.desktopSize, connectingState]);

  return (
    <CoreWindow
      {...props}
      windowTitle={connectingState === 'waiting' ? 'CORE.exe' : 'Wallet.eth'}
      minWidth={`${windowSize.width}px`}
      maxWidth={`${windowSize.width}px`}
      minHeight={`${windowSize.height}px`}
      top={`${position.top}`}
      left={`${position.left}`}
      visible={isMobile || visible}
    >
      <CoreWindowContent>
        {connectingState === 'waiting' && <WaitingForConnection />}
        {connectingState === 'wantsToConnect' && <ConnectorButtons />}

        <Header>
          {wallet.account && (
            <h1>
              <Avatar size={30}>
                <JazzIcon
                  address={wallet.account}
                  diameter={30}
                  className={classnames('identicon')}
                  style={getAvatarStyles(40)}
                />
              </Avatar>
              <small style={{ fontSize: '0.95rem' }}>
                <a href={`https://etherscan.io/address/${wallet.account}`} target="_blank" rel="noopener noreferrer">
                  {addressSummary(wallet.account, 6)}
                </a>
              </small>
            </h1>
          )}
          <h1>
            {wallet.account && 'Personal'} CORE
            <span>Vault</span>
            <small>v{APP_VERSION}</small>
          </h1>
        </Header>

        <Tabs value={activeTab} onChange={handleChange}>
          <CoreTab value={0}> Summary </CoreTab>
          {wallet.account && <CoreTab value={1}> Farm </CoreTab>}
          {wallet.account && <CoreTab value={3}> Migration <img style={{marginLeft: "5px"}} src={newIMG} /></CoreTab>}
        </Tabs>
        <CoreTabBody>
          {activeTab === 0 && <SummaryTab setWalletWindowState={setState} />}
          {activeTab === 1 && <FarmingTab />}
          {activeTab === 3 && <CoreDAOMigration />}
        </CoreTabBody>
      </CoreWindowContent>
    </CoreWindow>
  );
};

export default MyWalletWindow;
