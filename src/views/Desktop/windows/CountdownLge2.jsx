import React from 'react';
import { ethers } from 'ethers';
import { CoreWindow } from '../../../components/Windows';
import {
  Button,
  Anchor,
  TextField,
  Panel
} from 'react95';

import {
  useUserPoolPending,
  useUserStakedInPool,
  useUserTokenBalance,
  useYam
} from '../../../hooks';

import BigNumber from 'bignumber.js';
import infoIMG from '../../../assets/img/info.png';
import checkmarkIMG from '../../../assets/img/checkmark.png';
import useWallet from 'use-wallet';
import { claimCORE } from '../../../utils';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import useApprovalOfCoreVault from '../../../hooks/useApprovalOfCoreVault';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from './TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import { hooks } from '../../../helpers';

const useUserClaimedLGE2 = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [approval, setApproval] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTokenBalance, 30000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTokenBalance() {
    const approved = await yam.contracts.LGE2.methods.unitsClaimed(wallet.account).call();

    setApproval(approved);
  }

  return React.useMemo(() => (approval === '' ? DATA_UNAVAILABLE : new BigNumber(approval)), [approval]);
};


const useUserContributionLGE2 = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [approval, setApproval] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTokenBalance, 30000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTokenBalance() {
    const approved = await yam.contracts.LGE2.methods.unitsContributed(wallet.account).call();

    setApproval(approved);
  }

  return React.useMemo(() => (approval === '' ? DATA_UNAVAILABLE : new BigNumber(approval)), [approval]);
};

const useUserApprovalOfLGE2OfToken = tokenName => {
  const yam = useYam();
  const wallet = useWallet();

  const [approval, setApproval] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, getTokenBalance, 30000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function getTokenBalance() {
    const approved = await yam.contracts[tokenName].methods
      .allowance(wallet.account, yam.contracts.LGE2._address)
      .call();

    setApproval(approved);
  }

  return React.useMemo(() => (approval === '' ? DATA_UNAVAILABLE : new BigNumber(approval)), [approval]);
};

const LGE2Input = ({ setTransactionValue, type, tokenName, decimals }) => {
  const wallet = useWallet();
  const getTypeCurrency = () => tokenName;

  const userTokenNum = useUserTokenBalance(tokenName);

  const [value, setValue] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    console.log(wallet.balance);
    setValue(tokenName === 'eth' ? new BigNumber(wallet.balance) : userTokenNum.balance);
  }, [userTokenNum, wallet]);

  const [textFieldValue, setTextFieldValue] = React.useState(0);
  React.useEffect(() => {
    if (value !== DATA_UNAVAILABLE) setTextFieldValue(value.div(new BigNumber(10).pow(decimals)));
  }, [value]);

  const handleChange = e => {
    const targetValue = new BigNumber(e.target.value);

    setTextFieldValue(targetValue);
  };

  const handleBlur = e => {
    const targetValue = new BigNumber(e.target.value);
    const biggerThanMax = targetValue > value.div(new BigNumber(10).pow(decimals));
    if (biggerThanMax) {
      setTextFieldValue(value.div(new BigNumber(10).pow(decimals)));
    } else {
      setTextFieldValue(targetValue);
    }
  };

  React.useEffect(() => {
    setTransactionValue(textFieldValue);
  }, [textFieldValue]);

  return React.useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1
        style={{
          marginRight: '0.6rem',
          display: 'flex',
          alignItems: 'flex-end',
          maxWidth: '30ch',
        }}
      >
        How much {type === 'LGE2' && getTypeCurrency()} do you want to{' '}
        {type === 'LGE2' ? 'Add to Liquidity' : type}?
      </h1>
      <div
        style={{
          display: 'flex',
          width: '80%',
          paddingTop: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <TextField
          value={textFieldValue}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ width: '300px' }}
        />
        <Button
          style={{ width: '4rem', marginLeft: '-4rem' }}
          onClick={() => setTextFieldValue(value.div(new BigNumber(10).pow(decimals)))}
        >
          MAX
        </Button>
      </div>
    </div>
  ));
};

const CountdownWindowToLGE2 = props => {
  const windowsContext = React.useContext(WindowsContext);
  const wallet = useWallet();
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const earnedWBTCPOOL = useUserPoolPending([1], wallet.account);
  const stakedInPool = useUserStakedInPool(1, wallet.account);
  const yam = useYam();

  ///Contribtions
  const USERCONTRIBUTION = useUserContributionLGE2();
  const USERCLAIMED = useUserClaimedLGE2();
  const LPNEWBLANCE = useUserTokenBalance('CORExcBTC');
  const approvalOfVault = useApprovalOfCoreVault('CORExcBTC');

  let percentLeft = Math.min(
    100,
    ((1602975200836 + 7 * day + 2 * hour - Date.now()) / (7 * day + 2 * hour)) * 100
  );
  if (isNaN(percentLeft)) percentLeft = 0;

  const claimLP = token => {
    (async () => {
      try {
        let callApprove = yam.contracts.LGE2.methods.claimLP();

        await callApprove.send({
          from: wallet.account,
          gas: 400000,
        });
      } catch (e) {
        alert(e.message);
      }
    })();
  };

  const claimAndStake = () => {
    (async () => {
      try {
        let callApprove = yam.contracts.LGE2.methods.claimAndStakeLP();

        await callApprove.send({
          from: wallet.account,
          gas: 800000,
        });
      } catch (e) {
        alert(e.message);
      }
    })();
  };

  const ApproveVaultMax = token => {
    (async () => {
      try {
        let callApprove = yam.contracts[token].methods.approve(
          yam.contracts.COREVAULT._address,
          ethers.constants.MaxUint256
        );

        await callApprove.send({
          from: wallet.account,
          gas: 80000,
        });
      } catch (e) {
        alert(e.message);
      }
    })();
  };

  const getButtonToDisplay = React.useMemo(
    () => () => {
      if (LPNEWBLANCE.balance > 0) {
        if (approvalOfVault > 100000) {
          return <StakeButton />;
        } else {
          return <ApproveButton />;
        }
      }
    },
    [LPNEWBLANCE, approvalOfVault]
  );

  const ApproveButton = () => (
    <Button style={{ width: '90px' }} onClick={() => ApproveVaultMax('CORExcBTC')}>
      Approve
    </Button>
  );
  const StakeButton = () => (
    <Button style={{ width: '90px' }} onClick={() => {
      windowsContext.openModal(
        WindowType.Transaction, null, {
          type: 'stake',
          additional: {
            pid: 1
          }
        }, {
          windowName: getTransactionWindowName('stake')
        }
      );
    }}> Stake </Button>
  );
  const ClaimButton = () => (
    <Button style={{ width: '90px' }} onClick={() => claimLP()}>
      Claim
    </Button>
  );
  const ClaimAndStakeButton = React.useMemo(
    () => () => (
      <Button
        primary
        style={{ width: '180px', height: '100px' }}
        onClick={() => claimAndStake()}
      >
        Claim and Stake
      </Button>
    ),
    [USERCONTRIBUTION, USERCLAIMED]
  );
  return (
      <CoreWindow
        {...props}
        windowTitle='Liquidity Event #2 is over!'
        width='500px'
      >
        <div style={{ padding: '1rem', background: '#c0c0c0 !important' }}>
          <h1>
            Fairly Added $6,000,000 in Liquidity <img src={checkmarkIMG} width={24} />
          </h1>
          Thank You to everyone who participated!
          <h1 style={{ paddingTop: '1.5rem' }}>
            {/* {USERCONTRIBUTION > 0 && USERCLAIMED == 0 &&
            <ClaimButton />
          } */}
            {USERCONTRIBUTION > 0 && USERCLAIMED === 0 && <ClaimAndStakeButton />}
          </h1>
          {/* 
          onClick={() => openTransactionWindow('liquidity-zap', transactionValue, 'waiting',
   { shouldStake })} */}
          <div style={{ maxWidth: '50ch' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px',
              }}
            >
              CORE equivalent contribution <ScrambleDisplay value={USERCONTRIBUTION} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px',
              }}
            >
              Claimed CORE equivalent units <ScrambleDisplay value={USERCLAIMED} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px',
              }}
            >
              Staked cmLP <ScrambleDisplay value={stakedInPool} decimals={13} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px',
              }}
            >
              
              CORE Earned <ScrambleDisplay value={earnedWBTCPOOL.value} />{' '}
              {earnedWBTCPOOL.value > 0 && (
                <Button style={{ width: '90px' }} onClick={() => claimCORE(yam, wallet, 1)}>
                  Claim
                </Button>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px',
              }}
            >
              You have in wallet cmLP 
              <ScrambleDisplay value={LPNEWBLANCE.balance} decimals={13} />
              {getButtonToDisplay()}
            </div>


            <div style={{ paddingTop: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img alt="info" src={infoIMG} height="30" style={{ marginRight: '0.5rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', }}>
                <span>
                  CORE/cBTC LP units are displayed in centimillis (1<sup style={{ verticalAlign: 'top', fontSize: '0.8em', marginBottom: '0.5em' }}>-5</sup>)
                </span>
                <span>
                  1 cmLP = 0.00001 LP
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                alignItems: 'center',
                height: '40px',
              }}
            >
              <Panel variant="well" style={{ minWidth: '50ch', textIndent: '0.25em' }}>
                Visit{' '}
                <Anchor target="_blank" href="https://t.me/coretechsupport">
                  t.me/coretechsupport
                </Anchor>{' '}
                for technical support
              </Panel>
            </div>
          </div>
          {/* <div style={{ maxWidth: '50ch' }}>


            The Liquidity Generation Event Contract is a novelty in the cryptocurrency space.
            It is important to us that an adequate amount of time is given to our contributors to get acquainted with the smart contract mechanics.
          </div> */}
          {/* <br />
          <div style={{ maxWidth: '50ch' }}>
            This review period will last 18 hours.
            After the countdown ends, the liquidity deposits for WETH, ETH, wBTC, wBTC/ETH UNI V2 and CORE will be accepted.
</div>
          <br /> */}
          {/* <div style={{ maxWidth: '50ch' }}>
            <span style={{ fontWeight: 600 }}>All relevant links regarding the event:</span> <br />
            <div style={{ display: 'flex', alignItems: 'center' }}><img src={bookIMG} style={{ height: '1.2em', paddingRight: '0.2em' }} />Articles :</div>
            <Anchor target="_blank" href="https://link.medium.com/6Y92VjCOlab"> The power of CORE and its Liquidity Generation Event(s) </Anchor>  <br />
            <Anchor target="_blank" href="https://link.medium.com/OGMLDdV8rab"> CORE: Liquidity Generation Event #2</Anchor> <br />
            <Anchor target="_blank" href="https://link.medium.com/DJaNHxMJBab "> FAQ: LGE #2</Anchor> <br />
            <Anchor target="_blank" href="https://link.medium.com/LedS23xEDab"> Empowering a true DeFi economy with Bitcoin</Anchor> <br />
            <br />
            <div style={{ display: 'flex', alignItems: 'center' }}><img src={executableIMG} style={{ height: '1.2em', paddingRight: '0.2em' }} />CODE :</div>
            <Anchor target="_blank" href="https://github.com/cVault-finance/CORE-v2/blob/master/src/contracts/v612/LGE.sol">Liquidity Generation Event contract on github</Anchor> <br />
            <Anchor target="_blank" href="https://twitter.com/CORE_Vault/status/1317248029716631552" >$50,000 Responsible disclosure bounty</Anchor> <br />
          </div> */}
          {/* <h2>CORE {percentLeft < 100 ? 'will start' : 'started'} with at least
          ${formatNaNWithCommas(((parseFloat(totalContributed / 1e18) * ethPrice * 2).toFixed(2)))} in <span
            style={{ fontWeight: 'bold' }}>locked forever</span> liquidity!</h2>

        <h2 style={{ paddingTop: '1.5rem', fontSize: '1.2rem', lineHeight: '2rem' }}>
          <span style={{ fontWeight: 'bold' }}>
            {formatNaN(parseFloat(totalContributed / 1e18).toFixed(0))}
          </span> ETH Total Contributed <br />
          {(endTime * 1000) > Date.now() && <>
            <span style={{ fontWeight: 'bold' }}>
              {formatNaN(parseFloat(userContributed).toFixed(2))}
            </span> ETH Your Contibution <br /> </>}
          <span style={{ fontWeight: 'bold' }}>
            ${formatNaNWithCommas((parseFloat(totalContributed / 10000 / 1e18) * ethPrice).toFixed(2))}
          </span> CORE Price Estimate after LGE <br />
          <span style={{ fontWeight: 'bold' }}>
            ${formatNaNWithCommas(((parseFloat(totalContributed / 1e18) * ethPrice).toFixed(2)))}
          </span> Market Cap <br />

          {percentLeft == 100 && 'Thank You to everyone who participated!'}
        </h2> */}
          {/*
        <div style={{ display: 'flex', paddingTop: '1.5rem' }}>

          <LinkButton
            fullWidth
            primary
            style={{ marginRight: 8, marginTop: '1rem', marginBottom: '0.5rem' }}
            onClick={() => openWindow('deposit')}
            size="lg"
            disabled={1601142008000 < Date.now()}
          >
            <img src={liquidityIMG} width={24} style={{ paddingRight: '0.5rem' }} />Add Liquidity and Get LP Tokens
          </LinkButton>

        </div>
        <div style={{ display: 'flex' }}>
          <LinkButton
            fullWidth
            primary
            style={{ marginRight: 8, marginTop: '1rem', marginBottom: '0.5rem' }}
            onClick={() => openWindow('lge_livefeed')}
            size="lg"
          >
            <img alt="terminal" src={terminalIMG} width={24} style={{ paddingRight: '0.5rem' }} />{' '}
            Watch Live Feed
          </LinkButton>
        </div>
        */}
        </div>
      </CoreWindow>
  );
};

export default CountdownWindowToLGE2;