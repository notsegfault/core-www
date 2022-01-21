import React from 'react';
import {
  Anchor,
  Tabs,
  Panel
} from 'react95';
import styled from 'styled-components';

import { ethers } from 'ethers';
import { useWallet } from 'use-wallet';
import { CoreWindow, CoreWindowContent } from '../../../../components/Windows';
import { WindowType } from '../../../../config/windowTypes.config';
import { WindowsContext } from '../../../../contexts/Windows';
import { useCoreBalance, useFannyFarming, useFannyInfo, useYam, useFannyPoolInfo } from '../../../../hooks';
import fannyPackIMG2 from '../../../../assets/img/fannyPack2.png';

import { ErrorType } from '../../../../contexts/Windows/WindowsProvider';
import { DATA_UNAVAILABLE } from '../../../../yam/lib/constants';
import { getTransactionWindowName } from '../TransactionWindow';
import BigNumber from 'bignumber.js';
import { TransactionButton } from '../../../../components/Button';
import '../../../../styles/effects.css';
import { FannyContext } from '../../../../contexts/Fanny';
import { CoreTab, CoreTabBody } from '../../../../components/Tab';

const PRICE_FANNY_PER_FANNYPACK = 1;

const FannyPackHeader = styled.div`
  display: block;
  text-align: center;

  div:first-child {
    text-align: left;
    div {
      font-style: italic;
    }
  }

  img {
    width: 400px;
    margin: 0.5em;
    padding-top: 1.5rem;
  }
  
  @media only screen and (max-width: 767px) {
    img {
      width: 250px;
    }
  }
`;

const FannyMainWindow = props => {
  const windowsContext = React.useContext(WindowsContext);
  const fannyInfo = useFannyInfo();
  const fannyFarming = useFannyFarming();
  const wallet = useWallet();
  const yam = useYam();
  const coreAmountInWallet = useCoreBalance();
  const fannyService = React.useContext(FannyContext);

  const onReadme = e => {
    windowsContext.openWindow(WindowType.FannyReadme, e);
  };

  const onRedeem = async e => {
    try {
      const claimId = await fannyService.claim(yam, wallet);
      windowsContext.openWindow(WindowType.FannyShippingForm, e, { id: claimId }, { reload: true });
    } catch (error) {
      windowsContext.showError('Error while claiming', '', ErrorType.Fatal, error.message);
    }

    fannyInfo.refresh();
  };

  const onWithdrawCORE = async e => {
    try {
      await fannyService.withdrawAll(yam, wallet);
    } catch (error) {
      windowsContext.showError('Error while withdrawing', '', ErrorType.Fatal, error.message);
    }

    fannyInfo.refresh();
  };

  const onClaimFannyRewards = async e => {
    try {
      await fannyService.claimFannyRewards(yam, wallet);
    } catch (error) {
      windowsContext.showError('Error while claiming rewards', '', ErrorType.Fatal, error.message);
    }

    fannyFarming.refresh();
  };

  const onOrders = e => {
    windowsContext.openWindow(WindowType.FannyOrders, e);
  }

  const onBuy = async (e, type) => {
    try {
      switch (type) {
        case 'core':
          await fannyService.buyFannyForCORE(yam, wallet);
          break;
        case 'eth':
          await fannyService.buyFannyForETH(yam, wallet);
          break;
      }
    } catch (error) {
      windowsContext.showError('Error Buying', '', ErrorType.Fatal, error.message);
    }

    fannyInfo.refresh();
  };

  const onSell = async (e, type) => {
    try {
      switch (type) {
        case 'eth':
          await fannyService.sellFannyForETH(yam, wallet);
          break;
        case 'core':
          await fannyService.sellFannyForCORE(yam, wallet);
          break;
      }
    } catch (error) {
      windowsContext.showError('Error Selling', '', ErrorType.Fatal, error.message);
    }

    fannyInfo.refresh();
  };

  const onStakeCORE = async e => {
    return windowsContext.openModal(
      WindowType.Transaction, null, {
      type: 'stake-core-fanny',
      onAfterTransaction: () => fannyFarming.refresh()
    }, {
      windowName: getTransactionWindowName('stake-core-fanny')
    });
  };

  const approveMaxForContract = async (token, contract) => {
    try {
      const tx = yam.contracts[token].methods.approve(contract, ethers.constants.MaxUint256)
      const gas = await tx.estimateGas({ from: wallet.account });
      await tx.send({ from: wallet.account, gas })
    } catch (err) {
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error Approving",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Failed transaction"
      );
    } finally {
      fannyInfo.refresh();
    }
  }

  const ApproveOrStakeButton = () => {
    let approval = fannyFarming.vaultAllowance;
    let coreInWallet = coreAmountInWallet;
    let tokenName = 'core';

    if (fannyFarming.fanniesLeftToFarm !== DATA_UNAVAILABLE && !fannyFarming.fanniesLeftToFarm) {
      return <></>;
    }

    if (approval == DATA_UNAVAILABLE || coreInWallet == DATA_UNAVAILABLE) {
      return <TransactionButton
        style={{ width: '150px' }}
        text="Loading..." disabled />
    }

    if (approval !== DATA_UNAVAILABLE && approval.gte(coreInWallet)) {
      return <TransactionButton
        onClick={() => onStakeCORE()}
        style={{ width: '150px' }}
        text="Stake CORE" textLoading="Staking..." />
    }

    return <TransactionButton
      onClick={() => approveMaxForContract(tokenName, yam.contracts.FANNYVAULT._address)}
      style={{ width: '150px' }}
      text="Approve" textLoading="Loading..." />
  }

  const renderBalance = (amount, decimals = 18, precision = 4) => {
    if (amount === DATA_UNAVAILABLE) {
      return <>{DATA_UNAVAILABLE}</>;
    }

    if (BigNumber.isBigNumber(amount)) {
      amount = (decimals ? amount.div(new BigNumber(10).pow(decimals)) : amount);
    }

    if (precision) {
      amount = parseFloat(amount).toFixed(precision);
    } else {
      amount = parseInt(amount);
    }

    return <>{amount}</>
  };

  const renderConnectToWallet = () => {
    return <div>Your wallet must be connected.</div>
  };

  const isRedeemButtonEnabled = () => {
    return fannyInfo.fannyBalance !== DATA_UNAVAILABLE && fannyInfo.fannyBalance >= PRICE_FANNY_PER_FANNYPACK;
  };

  const uniswapUrl = "https://app.uniswap.org/#/swap?inputCurrency=0x62359ed7505efc61ff1d56fef82158ccaffa23d7&outputCurrency=0x8ad66f7e0e3e3dc331d3dbf2c662d7ae293c1fe0";

  const renderBuy = () => {
    return <>
      <div style={{ display: 'flex', marginBottom: '2em' }}>
        <div style={{ flex: '50%' }}>
          <div style={{ marginTop: '0.5em' }}>

            <div style={{ display: 'flex' }}>
              <div style={{ flex: '50%', marginRight: '0.5em', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <TransactionButton
                  allowanceRequiredFor={{ contract: 'FannyRouter', token: 'core' }}
                  onClick={e => onBuy(e, 'core')} text="Buy 1 FANNY for CORE" textLoading="Loading..." />
                <div style={{ paddingTop: '.5rem' }}>
                  1 FANNY = {renderBalance(fannyInfo.COREAmountToBuyOneFanny)} CORE
                </div>
                <div style={{ paddingTop: '.5rem' }}>
                  <Anchor href={uniswapUrl} target="_blank">
                    Buy on Uniswap
                  </Anchor>
                </div>
              </div>
              <div style={{ flex: '50%', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TransactionButton
                  onClick={e => onBuy(e, 'eth')} text="Buy 1 FANNY for ETH" textLoading="Loading..." />
                <div style={{ paddingTop: '.5rem' }}>
                  1 FANNY = {renderBalance(fannyInfo.ETHAmountToBuyOneFanny)} ETH
                </div>
                <div style={{ paddingTop: '.5rem' }}>
                  <Anchor href={uniswapUrl} target="_blank">
                    Buy on Uniswap
                  </Anchor>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Panel variant="well" style={{ width: '100%', textIndent: '0.25em', padding: '0.5rem 0.5rem .5rem 0.25rem' }}>
        FANNY is a ultra-limited edition merchandise token experiment, which can be sold and bought on Uniswaps bonding curve.
         And redeemed for a real life fanny pack. <Anchor style={{ cursor: 'pointer' }} onClick={e => onReadme(e)}>Learn More</Anchor>
      </Panel>
    </>
  };

  const renderFannyLeftToFarm = () => {
    if (fannyFarming.fanniesLeftToFarm === DATA_UNAVAILABLE) {
      return <></>;
    }

    if (fannyFarming.fanniesLeftToFarm > 0) {
      return <div style={{ lineHeight: '1.1rem' }}>Just{" "}
        <span style={{ fontWeight: 'bold' }}>{renderBalance(fannyFarming.fanniesLeftToFarm)}</span> fanny left to farm <br />
        <span style={{ fontSize: '0.7em' }}>Are you going to be fannyless?</span>
      </div>
    }

    return <>
    <div>Fanny Farming Ended</div>
    <Anchor target="_blank" href={'https://app.uniswap.org/#/swap?inputCurrency=0x62359ed7505efc61ff1d56fef82158ccaffa23d7&outputCurrency=0x8ad66f7e0e3e3dc331d3dbf2c662d7ae293c1fe0'}>You can now only buy Fanny on Uniswap</Anchor>
    </>
  };

  const renderFarming = () => {
    return <div>
      <div style={{ flex: '20%', fontSize: '1.1em', textAlign: 'center', paddingTop: '0.5rem' }}>
        {renderFannyLeftToFarm()}

      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingTop: '1rem' }}>
          {ApproveOrStakeButton()}
          {fannyFarming.totalWithdrawableCORE !== DATA_UNAVAILABLE && fannyFarming.totalWithdrawableCORE > 0 &&
            <TransactionButton
              onClick={() => onWithdrawCORE()}
              style={{ width: '150px', marginTop: '0.5em' }}
              text="Withdraw" textLoading="Withdrawing..." />
          }
          {fannyFarming.totalDepositedCOREAndNotWithdrawed > 0 ? <>
            <div style={{ fontWidth: 'bold', marginTop: '0.5em' }}>Withdrawable CORE</div>
            <div>{renderBalance(fannyFarming.totalWithdrawableCORE)} / {renderBalance(fannyFarming.totalDepositedCOREAndNotWithdrawed)}</div>
          </>
            :
            <div style={{ marginTop: '0.5em' }}>You have nothing staked yet</div>
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'right', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
          {fannyFarming.fanniesLeftToFarm > 0 && <div style={{ fontWidth: 'bold', marginTop: '0.5em', fontSize: '0.7em' }}>You are farming with {renderBalance(fannyFarming.amountCredit)} CORE units</div>}
          <div style={{ fontWidth: 'bold', marginTop: '0.5em' }}>{renderBalance(fannyFarming.claimableFanny)} Farmed FANNY</div>
          <TransactionButton style={{ width: '150px', marginTop: '0.5em' }}
            onClick={(e) => onClaimFannyRewards(e)}
            text="Gimme"
            textLoading="Claiming..."
          ></TransactionButton>
        </div>
      </div>
    </div>
  };

  const renderClaim = () => {
    return <div style={{ textAlign: 'center', marginTop: '1em' }}>
      <div>You have {renderBalance(fannyInfo.fannyBalance, 18, 2)} FANNY</div>
      <TransactionButton
        style={{ margin: 'auto', marginTop: '0.5em', fontSize: '1.5em', height: '2em', width: '50%' }}
        disabled={!isRedeemButtonEnabled()}
        onClick={e => onRedeem(e)} text="Redeem" textLoading="Loading..." />

      <Anchor style={{ cursor: 'pointer', display: 'block', marginTop: '0.5em', textAlign: 'right' }} onClick={e => onOrders(e)}>My Fanny Orders...</Anchor>
    </div>
  };

  const renderSell = () => {
    return <div style={{ display: 'flex' }}>
      <div>
        FANNY in pool : {renderBalance(fannyInfo.fannyReserve, 18, 0)} <br />
        CORE in pool : {renderBalance(fannyInfo.coreReserve, 18, 0)} <br />
        1 FANNY sold in CORE : {renderBalance(fannyInfo.COREAmountToSellOneFanny, 18, 4)} <br />
        1 FANNY sold in ETH (post FoT) : {renderBalance(fannyInfo.ETHAmountToSellOneFanny, 18, 4)} <br />
      </div>
      <div style={{
        height: 'auto',
        width: 'auto',
        textAlign: 'right',
        flex: '50%',
        display: 'block',
        justifyContent: 'flex-end'
      }}>
        <div style={{ marginTop: '0.5em',  display: 'flex', alignItems: 'center', alignContent: 'center' }}>
          <TransactionButton
            allowanceRequiredFor={{ contract: 'FannyRouter', token: 'fanny' }}
            style={{ display: 'block', height: '4.3em' }}
            disabled={true}
            onClick={e => onSell(e, 'eth')} text="Sell 1 FANNY for ETH" textLoading="Loading..." />
          <TransactionButton
            allowanceRequiredFor={{ contract: 'FannyRouter', token: 'fanny' }}
            disabled={fannyInfo.fannyBalance == 0}
            style={{ display: 'block', height: '4.3em' }}
            onClick={e => onSell(e, 'core')} text="Sell 1 FANNY for CORE" textLoading="Loading..." />
        </div>

        <div style={{ marginTop: '0.5em' }}>
          <Anchor href="https://uniswap.info/pair/0x85d9DCCe9Ea06C2621795889Be650A8c3Ad844BB" target="_blank">
            Sell on Uniswap
          </Anchor>
        </div>
      </div>


    </div>
  };


  const [state, setState] = React.useState({
    activeTab: 0,
  });
  const { activeTab } = state;
  const handleChange = (e, value) => setState({ activeTab: value });

  const renderContent = () => {
    return <>
      <FannyPackHeader>
        <div>
          <h1>CORE Fanny Pack</h1>
          <div>"First Liquidity Providers Edition"</div>
        </div>
        <img className='zoom-in-zoom-out' alt="fanny-pack" src={fannyPackIMG2} />
      </FannyPackHeader>
      <h1 style={{
        textAlign: 'center',
        textWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 2rem 0.25rem 2rem',
        alignItems: 'flex-end'
      }}>
        <div>${fannyInfo.priceInUSD.toLocaleString('en')}</div>
        <div style={{ fontSize: '0.8em', fontWeight: 'normal' }}>
          {renderBalance(fannyInfo.totalSupply, 18, 0)}/{renderBalance(fannyInfo.maxSupply, 0, 0)} available
        </div>
      </h1>
      <Tabs style={{ marginTop: '0.5rem' }} value={activeTab} onChange={handleChange}>
        <CoreTab value={0} style={{ width: '25%' }}>
          Buy
        </CoreTab>
        <CoreTab value={1} style={{ width: '25%' }}>
          Sell
        </CoreTab>
        <CoreTab value={2} style={{ width: '25%' }}>
          Farm
        </CoreTab>
        <CoreTab value={3} style={{ width: '25%' }}>
          Redeem
        </CoreTab>
      </Tabs>
      <CoreTabBody>
        {activeTab === 0 && renderBuy()}
        {activeTab === 1 && renderSell()}
        {activeTab === 2 && renderFarming()}
        {activeTab === 3 && renderClaim()}
      </CoreTabBody>
    </>;
  };

  return (
    <CoreWindow
      {...props}
      windowTitle='CORE Merch Network'
      width='545px'
      top='10%'
      left='10%'
    >
      <CoreWindowContent>
        {wallet.status === 'connected' ? renderContent() : renderConnectToWallet()}
      </CoreWindowContent>
    </CoreWindow>
  );
};

export default FannyMainWindow;
