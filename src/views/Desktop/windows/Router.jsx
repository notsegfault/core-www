import BigNumber from 'bignumber.js';
import WrapTab from '../components/WrapTab';
import WrapLpTab from '../components/WrapLpTab';
import React from 'react';
import {
  Tabs,
  Fieldset,
  TextField,
  Button,
  Checkbox
} from 'react95';
import Header from '../components/Header';
import modemIMG from '../../../assets/img/modem.png';
import warningIMG from '../../../assets/img/warning.png';
import ethIMG from '../../../assets/img/eth.png';
import { useWallet } from 'use-wallet';
import useYam from '../../../hooks/useYam';
import connectGIF from '../../../assets/img/connect.gif';
import rightArrowIMG from '../../../assets/img/arrow2.png';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from './TransactionWindow';
import Swap from './Swap';
import ArbitrageTab from '../components/Arbitrage/ArbitrageTab';
import useInterval from '@use-it/interval';
import { WindowType } from '../../../config/windowTypes.config';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import { CoreTab, CoreTabBody } from '../../../components/Tab';
import styled from 'styled-components';
import { TransactionButton } from '../../../components/Button';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const Router = props => {
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const [state, setState] = React.useState({
    activeTab: props.activeTab || 0,
  });

  const currentWindowInstance = windowsContext.getWindowByName(props.windowName);

  const handleChange = (e, value) => setState({ activeTab: value });
  
  const { activeTab } = state;

  return (
    <CoreWindow
      {...props}
      icon={modemIMG}
      windowTitle='Router.exe'
      minWidth='650px'
      maxWidth='650px'
      top='2%'
      left={`${window.innerWidth / 2 - 250}px`}
    >
      <CoreWindowContent>
        <Header>
          <h1> CORE Router <small>v1.6</small></h1>
        </Header>
        <Tabs value={activeTab} onChange={handleChange}>
          <CoreTab value={0}>
            Zapper
          </CoreTab>
          <CoreTab value={1}>
            Swap
          </CoreTab>
          <CoreTab value={2}>
            Wrap ERC95
          </CoreTab>
          <CoreTab value={3}>
            Wrap LP
          </CoreTab>
          <CoreTab value={4}>
            Arbitrage
          </CoreTab>
        </Tabs>
        <CoreTabBody>
          {activeTab === 0 && <Liquidity />}
          {activeTab === 1 && <Swap />}
          {activeTab === 2 && <WrapTab />}
          {activeTab === 3 && <WrapLpTab />}
          {activeTab === 4 && <ArbitrageTab parentWindow={currentWindowInstance} />}
        </CoreTabBody>
      </CoreWindowContent>
    </CoreWindow>
  );
};

const ONE_WITH_DECIMALS = new BigNumber(10).pow(18);

const RightArrow = () =>{
  return <img style={{
    position: 'relative',
    margin: 'auto',
    marginLeft: '0.5em',
    marginRight: '0.5em',
    width: '15px',
    height: '11px'
  }} src={rightArrowIMG} alt="->" />
}

const SwappingEstimationPanel = styled.div`
  margin-top: 2rem;
  margin-bottom: 1rem;
  display: flex;

  span {
    margin-top: auto;
    margin-bottom: auto;
  }

  span.modem-icon {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  @media only screen and (max-width: 767px) {
    span.modem-icon {
      display: none;
    }
  }
`;

const EthSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-left: 1em;
  
  img {
    width: 36px;
    height: 36px;
    opacity: 0.7;
    padding-right: 1em;
    margin-top: auto;
    margin-bottom: auto;
  }

  h1 {
    margin-top: auto;
    margin-bottom: auto;
  }

  @media only screen and (max-width: 767px) {
    img {
      width: 24px;
      height: 24px;
    }
  
    h1 {
      font-size: 1.1em !important;
      margin-top: auto;
      margin-bottom: auto;
    }
  }
`;

const Liquidity = () => {
  const [shouldStake, setShouldStake] = React.useState(true);
  const [gasEstimate, setGasEstimate] = React.useState(DATA_UNAVAILABLE);
  const [LPEstimate, setLPEstimate] = React.useState(DATA_UNAVAILABLE);
  const [transactionValue, setTranscationValue] = React.useState(DATA_UNAVAILABLE);
  const [textFieldValue, setTextFieldvalue] = React.useState('');

  const windowsContext = React.useContext(WindowsContext);

  const handleBlur = e => {
    const textValueDerived = new BigNumber(e.target.value).times(ONE_WITH_DECIMALS);
    const max = new BigNumber(wallet.balance).minus(gasEstimate);

    if (textValueDerived.gte(max)) {
      setTranscationValue(max);
      setTextFieldvalue(max.div(ONE_WITH_DECIMALS));
    } else {
      setTextFieldvalue(textValueDerived.div(ONE_WITH_DECIMALS));
    }
    setDelay(1);
  };

  const handleChange = e => {
    const text = e.target.value;
    setTextFieldvalue(text);
    setTranscationValue(new BigNumber(text).times(ONE_WITH_DECIMALS));
    setDelay(500);
  };

  const wallet = useWallet();
  const yam = useYam();
  const [delay, setDelay] = React.useState(null);

  useInterval(() => {
    if (textFieldValue !== DATA_UNAVAILABLE) LPEstimateQuery(transactionValue);
  }, delay);

  const doZap = async ({ type }) => {
    if (!wallet.account || !yam) return;

    const transaction = yam.contracts.COREROUTER.methods.addLiquidityETHOnly(
      wallet.account,
      shouldStake
    );

    switch (type) {
      case 'estimate':
        const gasEstimate = new BigNumber(await transaction.estimateGas({ value: 1 * 1e18 }));
        const gasPrice = new BigNumber(await yam.web3.eth.getGasPrice());

        setGasEstimate(
          new BigNumber(parseInt(gasEstimate.times(new BigNumber(2)).times(gasPrice).toFixed(0)))
        );
        return;
    }
  };

  const LPEstimateQuery = async value => {
    if (!wallet.account || !yam) return;
    await setLPEstimate(DATA_UNAVAILABLE);
    const estimate = await yam.contracts.COREROUTER.methods
      .getLPTokenPerEthUnit(new BigNumber(value).toString())
      .call();
    if (value == 0) {
      setLPEstimate(0);
    } else setLPEstimate(new BigNumber(estimate));
    setDelay(null);
  };

  React.useEffect(() => {
    doZap({ type: 'estimate' });
  }, [wallet, yam, shouldStake]);

  React.useEffect(() => {
    if (wallet.account && wallet.balance !== '-1' && gasEstimate !== DATA_UNAVAILABLE) {
      const balance = new BigNumber(wallet.balance);
      const balanceMinusGas = BigNumber.maximum(0, balance.minus(gasEstimate))

      setTextFieldvalue(balanceMinusGas.div(ONE_WITH_DECIMALS).toFixed(4));
      setTranscationValue(balanceMinusGas);
      LPEstimateQuery(balanceMinusGas);
    }
  }, [wallet, yam, wallet.balance, gasEstimate]);

  if (!wallet.account) {
    return <div style={{ margin: 'auto', padding: '1rem 1rem', fontSize: '1rem' }}>
      Wallet not connected
      <img style={{ height: '1em', padding: '0 0.2em' }} src={connectGIF} />
    </div>;
  }

  return (
    <div>
      <Fieldset label={<>ETH <RightArrow/> [...] <RightArrow/> CORE/WETH LP</>}>
        <div
          style={{
            paddingTop: '0.5rem'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 0fr 0fr'
            }}
          >
            <TextField
              value={textFieldValue > 0 ? textFieldValue : (0).toFixed(4)}
              onChange={handleChange}
              onBlur={handleBlur}/>
            <Button
              style={{ marginLeft: '-4rem', height: '36px' }}
              onClick={() => {
                new BigNumber(wallet.balance).minus(gasEstimate);
                setTextFieldvalue(
                  new BigNumber(wallet.balance).minus(gasEstimate).div(ONE_WITH_DECIMALS)
                );
              }}
            >
              MAX
            </Button>

            <EthSection>
              <img alt="eth" src={ethIMG} />
              <h1>ETH</h1>
            </EthSection>
          </div>
        </div>
        <SwappingEstimationPanel>
          <span>
            Swap <ScrambleDisplay value={transactionValue} /> ETH <RightArrow />
          </span>
          <span className="modem-icon">
            <img src={modemIMG} /> <RightArrow />
          </span>
          <span>
            ≈ <ScrambleDisplay value={LPEstimate} precision={4} /> CORE/WETH LP
          </span>
        </SwappingEstimationPanel>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Checkbox
            label="Stake automatically"
            name="shouldStake"
            checked={shouldStake}
            onClick={() => setShouldStake(!shouldStake)}
          />
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            Gas cost ≈ <ScrambleDisplay value={gasEstimate} precision={4} /> ETH
          </div>
        </div>

        <TransactionButton
          fullWidth
          text="SWAP ETH for LP"
          textLoading="Swapping..."
          disabled={!wallet.account || transactionValue < 2}
          onClick={async () => {
            return windowsContext.openModal(
              WindowType.Transaction, null, {
              txValue: transactionValue,
              type: 'liquidity-zap',
              status: 'waiting',
              additional: {
                shouldStake
              }
            }, {
              windowName: getTransactionWindowName('liquidity-zap')
            }
            );
          }}
        />
      </Fieldset>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1em' }}>
        <img src={warningIMG} style={{ width: '30px', margin: 'auto'  }} />
        <div style={{ textAlign: 'justify', marginTop: '0.5em' }}>
        All CORE liquidity provider tokens are locked. It is impossible to liquidate these LP tokens
        in to their underlying assets. However, LP tokens do allow you to participate in the LP
        farming pool in our COREVault smart contract, in exchange for your service provided to
        traders as a liquidity provider.
        </div>
      </div>
    </div>
  );
};

export default Router;
