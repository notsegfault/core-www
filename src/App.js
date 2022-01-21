import React from 'react';
import { SingletonHooksContainer } from 'react-singleton-hook';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { UseWalletProvider } from 'use-wallet';

// pick a theme of your choice
import original from 'react95/dist/themes/original';

// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';
import vt323_regular from './assets/fonts/VT323-Regular.woff2';
import { styleReset } from 'react95';
import YamProvider from './contexts/YamProvider';

import Desktop from './views/Desktop';
import { Web3Provider } from './contexts/Web3';
import { WebampProvider } from './contexts/Webamp';
import { SettingsContext, SettingsProvider } from './contexts/Settings';
import { WindowsProvider } from './contexts/Windows';
import { FannyProvider } from './contexts/Fanny';
import { LGEProvider } from './contexts/LGE';
import { WalletProvider } from './contexts/Wallet';
import { CHAIN_ID } from './yam/lib/constants';
// RENDER
const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  @font-face {
    font-family: 'vt323_regular';
    src: url('${vt323_regular}') format('woff');
    font-style: normal
  }
  body {
    font-family: 'ms_sans_serif' !important;
  }
  ${styleReset}
`;

const BlueScreen = styled.div`
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.min.css');

  width: 100%;
  height: 100%;
  margin: -5rem -5rem;
  padding: 0;
  overflow: hidden;
  color: #fff;
  background: #008cff;
  margin: 0;

  .inner {
    margin: 4% 35%;
  }
  .emotion {
    font-family: 'Segoe UI';

    font-size: 8em;
    margin: 0;
  }

  .description {
    font-size: 1.4em;
    margin-bottom: 3em;
  }

  footer small {
    font-size: 0.8em;
  }

  @media only screen and (max-width: 767px) {
    .inner {
      margin: 1em;
    }
  }
`;
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <BlueScreen>
          <div class="inner">
            <header>
              <h1 class="emotion">:(</h1>
            </header>
            <p class="description">
              COREVault just ran into a problem and needs to restart. It's propably the developers
              fault, and the reason price is up or down right now.
              <span>&nbsp;(0% complete)</span>
            </p>
            <footer>
              <p>
                <small>
                  If you'd like to know more, you can search online later for this error:
                  <span>&nbsp;DEVS_TOO_COOL</span>
                </small>
              </p>
            </footer>
          </div>
        </BlueScreen>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <>
      <GlobalStyles />

      <SettingsProvider>
      <Providers>
        <SingletonHooksContainer/>
        <Router>
          <Switch>
            <ErrorBoundary>
              <Route path="/" default>
                <Desktop />
              </Route>
            </ErrorBoundary>
          </Switch>
        </Router>
      </Providers>
      </SettingsProvider>
    </>
  );
};

const Providers = props => {
  const settings = React.useContext(SettingsContext);
  const [theme, setTheme] = React.useState(original);

  React.useEffect(() => {
    if (settings.store.theme) {
      setTheme(settings.store.theme);
    }
  }, [settings.store.theme]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <UseWalletProvider
          chainId={CHAIN_ID}
          connectors={{
            walletconnect: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
          }}
        >
          <WalletProvider>
          <FannyProvider>
          <LGEProvider>
          <WindowsProvider>
          <YamProvider>
          <Web3Provider>
          <WebampProvider>
            {props.children}
          </WebampProvider>
          </Web3Provider>
          </YamProvider>
          </WindowsProvider>
          </LGEProvider>
          </FannyProvider>
          </WalletProvider>
        </UseWalletProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
