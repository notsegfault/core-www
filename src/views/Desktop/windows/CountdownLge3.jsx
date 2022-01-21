import React from 'react';
import { ethers } from 'ethers';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import {
  Button,
  Anchor,
  TextField,
  Progress,
  Hourglass,
  Tooltip,
  Fieldset
} from 'react95';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';

import {
  useUserPoolPending,
  useUserStakedInPool,
  useUserTokenBalance,
  useYam,
  useTokenDecimals,
  useForkMigrations
} from '../../../hooks';
import Countdown from 'react-countdown';
import RetroHitCounter from 'react-retro-hit-counter';
import BigNumber from 'bignumber.js';
import infoIMG from '../../../assets/img/info.png';
import bookIMG from '../../../assets/img/book.png';
import executableIMG from '../../../assets/img/executable.png';

import checkmarkIMG from '../../../assets/img/checkmark.png';
import headerIMG from '../../../assets/img/lge3_header.png';

import useWallet from 'use-wallet';
import { DATA_UNAVAILABLE, pairInfoMap } from '../../../yam/lib/constants';
import useApprovalOfCoreVault from '../../../hooks/useApprovalOfCoreVault';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from './TransactionWindow';
import { isValidAddress } from '../../../utils/util';
import { TransactionButton } from '../../../components/Button';
import { LGEContext } from '../../../contexts/LGE';
import { hooks, printable } from '../../../helpers';
import styled from 'styled-components';

const ForkCountdownTable = styled.div`
  display: table;
  width: 50%;
  table-layout: fixed;
  border-spacing: 0.2em;
`;

const ForkCountdownRow = styled.div`
  display: table-row;
`;

const ForkCountdownCell = styled.span`
  display: table-cell;
  fiex: 25%;
`;

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const depositClosedTimestamp = 606613529135 + (9 * day);

const safeParseJSON = json =>  {
  try{
    return JSON.parse(json)
  }
  catch {
    return undefined;
  }
}

const useTokenName = tokenAddress => {

  const yam = useYam();

  const [tokenName, setTokenName] = React.useState('');

  React.useEffect(() => {
    if (yam) {
      getTokenName();
    }

  }, [yam, tokenAddress]);

  async function getTokenName() {


    const savedtokens = safeParseJSON(localStorage.getItem("savedTokens"))
    if(savedtokens?.[tokenAddress]?.decimals) {
      console.log("Readng from saved decimal storage")
      setTokenName(savedtokens[tokenAddress].name);
    }

    if(tokenName !== '') return;
    const name = await yam.contracts.ARBITRAGECONTROLLER.methods
      .getTokenSafeName(tokenAddress)
      .call(); // gracefully fails

      const newSavedTokens = savedtokens ? {[tokenAddress] : {name }, ...savedtokens} : {[tokenAddress] : {name}};
      localStorage.setItem('savedTokens', JSON.stringify(newSavedTokens));
      setTokenName(name);
  }

  const returnObject = {
    DATA_UNAVAILABLE : tokenName === '',
    refresh : getTokenName,
    value : tokenName,
    isFallBack : false // no fallsbackx
  }
  return React.useMemo(() => returnObject, [tokenName])

};

const useUserTokenBalanceByAddress = tokenAddress => {
  const yam = useYam();
  const wallet = useWallet();

  const [tokenBalance, setTokenBalance] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, update, 15000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet.account, tokenAddress]);

  async function update() {
    if(isValidAddress(tokenAddress) == false) return
    yam.contracts.genericERC20.address = tokenAddress;
    yam.contracts.genericERC20._address = tokenAddress;
    const tokenBalance = await yam.contracts.genericERC20.methods.balanceOf(wallet.account).call();

    setTokenBalance(tokenBalance);
  }

  const returnObject = {
    DATA_UNAVAILABLE : tokenBalance === '',
    refresh : update,
    value : new BigNumber(tokenBalance),
    isFallBack : false // no fallsbackx
  }
  return React.useMemo(() => returnObject, [tokenBalance])


};

const useClaimedLGE = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [claim, setClaimed] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, update, 15000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function update() {
    const claimed = await yam.contracts.LGE3.methods.claimed(wallet.account).call();
    setClaimed(claimed);
  }

  const returnObject = {
    DATA_UNAVAILABLE : claim === '',
    refresh : update,
    value : claim,
    isFallBack : false // no fallsbackx
  }
  return React.useMemo(() => returnObject, [claim])


};



const useUserTokenAllowanceOfUserToAddress = (tokenAddress, otherAddress) => {
  const yam = useYam();
  const wallet = useWallet();

  const [allowanceOfAddress, setAllowanceOfAddress] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, update, 15000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet.account, tokenAddress]);

  async function update() {
    if(isValidAddress(tokenAddress) == false) return

    yam.contracts.genericERC20.address = tokenAddress;
    yam.contracts.genericERC20._address = tokenAddress;
    const allowance = await yam.contracts.genericERC20.methods.allowance(wallet.account, otherAddress).call();

    setAllowanceOfAddress(allowance);
  }

  const returnObject = {
    DATA_UNAVAILABLE : allowanceOfAddress === '',
    refresh : update,
    value : new BigNumber(allowanceOfAddress),
    isFallBack : false // no fallsbackx
  }
  return React.useMemo(() => returnObject, [allowanceOfAddress])


};


const useLGE3Credit = () => {
  const yam = useYam();
  const wallet = useWallet();

  const [credit, setCredit] = React.useState('');

  React.useEffect(() => {
    let interval;

    if (yam) {
      interval = hooks.setWalletAwareInterval(wallet, update, 15000);
    }

    return () => clearInterval(interval);
  }, [yam, wallet]);

  async function update() {
    const userCredit = await yam.contracts.LGE3.methods.credit(wallet.account).call();
    setCredit(userCredit);
  }

  const returnObject = {
    DATA_UNAVAILABLE : credit === '',
    refresh : update,
    value : new BigNumber(credit),
    isFallBack : false // no fallsbackx
  }
  return React.useMemo(() => returnObject, [credit])


};

const ShittyReusableInputElement = ({
  startingValue,
  maxValue,
  decimals,
  setValueInParent,
  onChangeHookBefore = () => {},
  onBlurHookBefore = () => {},
  onChangeHookAfter = () => {},
  onBlurHookAfter = () => {},
  style
}) => {

  const onChange = (e) => {
    onChangeHookBefore()
    console.log(e.target.value)
    setValue(e.target.value);
    onChangeHookAfter()
  }

  const decimalsCorrection = new BigNumber(10).exponentiatedBy(decimals);
  const onBlur = (e) => {
    onBlurHookBefore()
    const preDecimalValue = new BigNumber(e.target.value);
    const correctedValue = preDecimalValue.multipliedBy(decimalsCorrection);
    if(correctedValue.gte(maxValue)) {
      setValueInParent(maxValue);
      setValue(maxValue.dividedBy(decimalsCorrection))
    }else{
      setValueInParent(correctedValue)
    }
    console.log("Called on blur", correctedValue.valueOf())
    onBlurHookAfter()
  }
  const [value, setValue] = React.useState();

  React.useEffect(()=>{
    setValue(startingValue)
    if(isNaN(startingValue) == false)
    {
      const correctedValue = new BigNumber(startingValue).multipliedBy(decimalsCorrection);
      setValueInParent(correctedValue)}
    }
    , [startingValue])

  return <TextField
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    style={{ ...style }}
  />

}

const PostLgePanel = () => {
  const windowsContext = React.useContext(WindowsContext);
  const wallet= useWallet();
  const yam = useYam();
  const [totalLPCreated, setTotalLPCreated] = React.useState(DATA_UNAVAILABLE);
  const pairInfo = pairInfoMap['cDAIxwCORE'];
  const LPBalance = useUserTokenBalance('cDAIxwCORE');
  const lgeService = React.useContext(LGEContext);
  const forkMigrations = useForkMigrations();
  const {value:  claimed,  refresh : refreshClaimed } = useClaimedLGE();
  const {value : userCredit, refresh: refreshCredit} = useLGE3Credit()

  const shouldDisplayClaim = () => {

    if(claimed == true) return false;
    if(userCredit.gt(0)) return true;
    return false;

  }
  React.useEffect(() => {
    const fetchTotalLPCreated = async () => {
      setTotalLPCreated((await yam.contracts.LGE3.methods.totalLPCreated().call() / 1e18).toFixed(4));
    };

    if (yam) {
      fetchTotalLPCreated();
    }
  }, [yam]);

  const claimAndStake = async () => {
    try {
      await lgeService.claim(yam, wallet, 'LGE3', true);
    } catch (error) {
      windowsContext.showError('Error while claiming', '', ErrorType.Fatal, error.message);
    }
  };

  const claimFromMigrations = async () => {
    try {
      await lgeService.claimFromMigrations(yam, wallet);
      forkMigrations.refresh();
    } catch (error) {
      windowsContext.showError('Error while claiming', '', ErrorType.Fatal, error.message);
    }
  };

  const renderForkMigrationTimer = () => {
    const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
      return <ForkCountdownTable>
        <ForkCountdownRow>
          <ForkCountdownCell><RetroHitCounter hits={days} withBorder={false} minLength={2} size={20} segmentThickness={2} /></ForkCountdownCell>
          <ForkCountdownCell><RetroHitCounter hits={hours} withBorder={false} minLength={2} size={20} segmentThickness={2} /></ForkCountdownCell>
          <ForkCountdownCell><RetroHitCounter hits={minutes} withBorder={false} minLength={2} size={20} segmentThickness={2} /></ForkCountdownCell>
        </ForkCountdownRow>
        <ForkCountdownRow style={{ fontSize:' 0.8em' }}>
          <ForkCountdownCell>days</ForkCountdownCell>
          <ForkCountdownCell>hours</ForkCountdownCell>
          <ForkCountdownCell>minutes</ForkCountdownCell>
        </ForkCountdownRow>
      </ForkCountdownTable>
    };

    return <div style={{ marginBottom: '0.5em' }}>
      <div style={{ marginBottom: '0.5', fontWeight: 'bold' }}>Time remaining to claim your LP</div>
      <Countdown date={forkMigrations.endDateInMilliseconds} renderer={countdownRenderer} />
    </div>
  };

  const renderForkMigrationClaim = () => {
    if (forkMigrations.LPDebtForUser === DATA_UNAVAILABLE) {
      return <div>Loading...</div>;
    }
    
    if (forkMigrations.claimClosed) {
      return <div>The claiming period has ended.</div>;
    }

    const renderContent = () => {
      if (forkMigrations.LPDebtForUser.lte(0) || forkMigrations.claimed) {
        return <div>You have nothing to claim currently.</div>;
      }

      return <>
        <div>You also have <strong>{printable.getPrintableTokenAmount(forkMigrations.LPDebtForUser)}</strong> LP to claim from the fork absorption.</div>
        <div style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
          <TransactionButton
            style={{ marginTop: '0.5em' }}
            onClick={() => claimFromMigrations()}
            text="Claim"
            textLoading="Claiming..." />
        </div>
        
        <p style={{ marginTop: '1em' }}>
          <hr/>
          Claim Details <span style={{ fontStyle: "italic" }}>(in ETH unit)</span>
          <ul style={{ paddingLeft: '0.25em' }}>
            <li><strong>▸ Encore: </strong>{printable.getPrintableTokenAmount(forkMigrations.encoreCreditedEth)} ETH</li>
            <li><strong>▸ Unicore: </strong>{printable.getPrintableTokenAmount(forkMigrations.unicoreCreditedEth)} ETH</li>
            <li><strong>▸ Tenspeed: </strong>{printable.getPrintableTokenAmount(forkMigrations.tensCreditedEth)} ETH</li>
          </ul>
        </p>
      </>
    };

    return <div>
      {renderForkMigrationTimer()}
      {renderContent()}
    </div>
  }

  const renderContent = () => {
    return <div style={{ marginTop: '1em' }}>
      <div style={{ fontSize: '1.2em', marginBottom: '1.5em' }}>LGE3 deposit is closed! </div>
        <div style={{ marginTop: '1em' }}>
          <Fieldset label="LGE Contributions">
            {shouldDisplayClaim() == true ?
              <>
                You can now claim and stake your LP tokens. <br />
                <TransactionButton style={{ marginTop: '0.5em' }} text="Claim and Stake" textLoading="Claiming..." onClick={(e) => claimAndStake()} />
              </>
              :
              <>
                You have nothing to claim currently.
            </>
            }
          </Fieldset>

          <Fieldset label="Fork Contributions" style={{ marginTop: '1.5em' }}>
            {renderForkMigrationClaim()}
          </Fieldset>

          <div style={{ marginTop: '1em' }}>
            <div><strong>LP in your wallet: </strong>{LPBalance.balance !== DATA_UNAVAILABLE && (LPBalance.balance / 1e18 * pairInfo.supplyScale).toFixed(4)} {pairInfo.unit}</div>
            <div><strong>Total LP created: </strong>{totalLPCreated !== DATA_UNAVAILABLE && parseFloat(totalLPCreated).toLocaleString('en')}</div>
          </div>
        </div>
    </div>
  };

  return <div style={{ marginTop: '1em', marginBottom: '1em' }}>
    <h1>
      Fairly Added $4,500,000 in Liquidity <img src={checkmarkIMG} width={24} />
    </h1>
    { yam ? renderContent() : <div style={{ marginTop: '1em' }}>Connect your wallet to claim.</div> }
  </div>
};

const ShitCoinDumpElement = props => {
  const windowsContext = React.useContext(WindowsContext);
  const {tokenAddress, txState, setTxState, refreshCredit} = props
  const LGE3 = "0xaac50b95fbb13956d7c45511f24c3bf9e2a4a76b";
  const {value: allowanceOfLGE3, refresh : refreshAllowance} = useUserTokenAllowanceOfUserToAddress(tokenAddress, LGE3);
  const {value: userShitCoinAmount, refresh : refreshAmount, isFallBack} = useUserTokenBalanceByAddress(tokenAddress);
  const {value : name} = useTokenName(tokenAddress);
  const {value : decimals} = useTokenDecimals(tokenAddress);
  const wallet= useWallet()
  const yam = useYam()
  const [transactionValue, setStransactionValue] = React.useState(0)
  const [displayValue, setDisplayValue] = React.useState()

  React.useEffect(()=> {
    if(decimals == '--') {setDisplayValue("--"); return }
    if(userShitCoinAmount == "--") {setDisplayValue("--"); return}
    const amount = new BigNumber(userShitCoinAmount);
    const decimalsAdjustement = new BigNumber(10).exponentiatedBy(new BigNumber(decimals));
    const displayValue = amount.dividedBy(decimalsAdjustement).toFixed(4,1).valueOf();
    setDisplayValue(isNaN(displayValue) ? "--" : displayValue)
  }, [userShitCoinAmount, decimals])

  if(!tokenAddress) return ""

  const approveMaxForContract = async (token, contract) => {
    setTxState('loading')
    yam.contracts.genericERC20.address = tokenAddress;
    yam.contracts.genericERC20._address = tokenAddress;
    let tx = yam.contracts.genericERC20.methods.approve(contract, ethers.constants.MaxUint256)
    let gas;

    try {
      gas = await tx.estimateGas({from: wallet.account});
      await tx.send({from:wallet.account,  gas, gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.25) })
    } catch (err) {
      console.debug(err)
      console.log(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error Approving Token Spend",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
    } finally {
      refreshEverything();
      setTxState('waiting')
    }
  }

  const depositTokenIntoLGE = async (tokenAddress, amount) => {
    console.log("Depositing ", amount.valueOf(), "Token units");
    setTxState('loading')
    let tx = yam.contracts.LGE3.methods.contributeWithAllowance(tokenAddress, amount.valueOf())
    let gas;

    try {
      gas = await tx.estimateGas({from: wallet.account});
      await tx.send({from:wallet.account,  gas : 400000, gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.25) })
    } catch (err) {
      console.debug(err)
      console.log(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error Contributing into LGE3",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
    } finally {
      refreshEverything();
      setTxState('waiting')
    }
  }




  const hasAllowance = () => {
    if(allowanceOfLGE3.isNaN() || userShitCoinAmount.isNaN()) return DATA_UNAVAILABLE;
    return allowanceOfLGE3.gte(userShitCoinAmount);
  }

  const userInputButton = () => {
    if(hasAllowance() === DATA_UNAVAILABLE) return <>Please connect your wallet</>
    if(userShitCoinAmount.isZero()) return <></>
    if(hasAllowance() == false) return <>

    <Button
      style={{minWidth:'80px'}}
      disabled={txState != 'waiting'}
      onClick={()=>approveMaxForContract(tokenAddress, LGE3)} >
        {txState === 'loading' ? <Hourglass size={20} /> : "Approve"}
    </Button>
    </>


    return <div style={{display:'flex'}}>
      <Button disabled={txState != 'waiting'} style={{minWidth:'80px'}}
      onClick={()=>depositTokenIntoLGE(tokenAddress, userShitCoinAmount.minus(1))}>
        {txState === 'loading' ? <Hourglass size={20} /> : "Deposit All"}
      </Button>

      <ShittyReusableInputElement
        decimals={decimals}
        maxValue={userShitCoinAmount}
        startingValue={displayValue}
        setValueInParent={setStransactionValue}
        style={{width:'150px'}}
      />

      <Button disabled={txState != 'waiting'} style={{marginLeft:'-1.5rem',minWidth:'80px'}} onClick={()=>depositTokenIntoLGE(tokenAddress, transactionValue)}>
        {txState === 'loading' ? <Hourglass size={20} /> : "Contribute"}
      </Button>
    </div>
  }

  const refreshEverything = () => {
    refreshAmount()
    refreshAllowance()
    refreshCredit()
  }




  return  <>
  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>

    <div style={{fontSize:'1.5em'}}>
      <span style={{opacity:'80%'}}>{name}</span> {displayValue} {isFallBack && <>
      <Tooltip text='Value might be incorrect, couldn`t get decimals. Falling back to 18' enterDelay={50} leaveDelay={50}>
      <img src={infoIMG} style={{height:'20px'}} />
      </Tooltip>

      </>}
    </div>




    {userInputButton()}

  </div>
  </>

}



const EthereumDumpElement = props => {
  const windowsContext = React.useContext(WindowsContext);
  const {refreshCredit, txState, setTxState} = props
  const wallet= useWallet()
  const yam = useYam()
  const [transactionValue, setStransactionValue] = React.useState(0)
  const [displayValue, setDisplayValue] = React.useState()


  React.useEffect(()=> {
    if(wallet.balance == -1) {setDisplayValue("--"); return}
    const amount = new BigNumber(wallet.balance);
    const decimalsAdjustement = new BigNumber(10).exponentiatedBy(18);
    const displayValue = amount.dividedBy(decimalsAdjustement).toFixed(4,1).valueOf();
    setDisplayValue(isNaN(displayValue) ? "--" : displayValue)
  }, [wallet])





  const depositETHIntoLGE = async (amount) => {
    console.log("Depostiting ETH", amount)
    setTxState('loading')
    let tx = yam.contracts.LGE3.methods.addLiquidityETH()
    let gas;

    try {
      gas = await tx.estimateGas({from: wallet.account, value: amount });
      await tx.send({from:wallet.account,  gas : 300000, gasPrice: parseInt((await yam.web3.eth.getGasPrice()) * 1.25), value: amount  })
    } catch (err) {
      console.debug(err)
      console.log(err)
      const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
      windowsContext.showError(
        "Error Contributing into LGE3",
        messageWithoutFluff.split("{")[0],
        ErrorType.Fatal,
        "Always failing transaction"
      );
    } finally {
      refreshEverything();
      setTxState('waiting')
    }
  }



  const userInputButton = () => {
    if(wallet.balance <= 0) return <></>




    return <div style={{display:'flex'}}>
      <Button disabled={txState != 'waiting'} style={{minWidth:'80px'}}
      onClick={()=>depositETHIntoLGE(Math.max(wallet.balance  - (1e18 * 0.02),0))}>
        {txState === 'loading' ? <Hourglass size={20} /> : "Deposit All"}
      </Button>

      <ShittyReusableInputElement
        decimals={18}
        maxValue={wallet.balance}
        startingValue={displayValue}
        setValueInParent={setStransactionValue}
        style={{width:'150px'}}
      />

      <Button disabled={txState != 'waiting'} style={{marginLeft:'-1.5rem',minWidth:'80px'}} onClick={()=>depositETHIntoLGE(transactionValue)}>
        {txState === 'loading' ? <Hourglass size={20} /> : "Contribute"}
      </Button>
    </div>
  }

  const refreshEverything = () => {
    refreshCredit()
  }




  return  <>
  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>

    <div style={{fontSize:'1.5em'}}>
      <span style={{opacity:'80%'}}>ETH</span> {displayValue}
    </div>

    {userInputButton()}

  </div>
  </>

}




const CountdownWindowToLGE3 = props => {
  const windowsContext = React.useContext(WindowsContext);
  const wallet = useWallet();

  const yam = useYam();
  const {value : userCredit, refresh: refreshCredit} = useLGE3Credit()

  const [depositClosed, setDepositClosed] = React.useState(false);

  // ///Contribtions
  // const USERCONTRIBUTION = useUserContributionLGE2();
  // const USERCLAIMED = useUserClaimedLGE2();
  // const LPNEWBLANCE = useUserTokenBalance('CORExcBTC');
  // const approvalOfVault = useApprovalOfCoreVault('CORExcBTC');

  let percentLeft = Math.min(
    100,
    100 - (((1606526145276 + (8*day) - Date.now()) / (9 * 24 * hour)) * 100)
    );
    if (isNaN(percentLeft)) percentLeft = 0;

    const renderer = ({ days, hours, minutes, seconds, completed }) => {
      if (completed) {
        setDepositClosed(true);
        return <></>;
      } else {
        // Render a countdown
        return <span>{days} Days {hours} Hours {minutes} Minutes {seconds} Seconds Remaining To Deposit</span>;
      }
    };

  const defaultList = [
    "0x62359ed7505efc61ff1d56fef82158ccaffa23d7", //CORE
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", // YFI
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
    "0xD533a949740bb3306d119CC777fa900bA034cd52", //CRV
    "0x584bC13c7D411c00c01A62e8019472dE68768430", // HEGIC
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" // AAVE
  ]
  const [txState, setTxState] = React.useState('waiting');
  const [addingState, setAddingState] = React.useState('waiting')
  const [addressInput, setAddressInput] = React.useState("")

  const addNewTokenToList = async address => {

    if(isValidAddress(address) == false){
      windowsContext.showError(
        "Error Adding token",
        "",
        ErrorType.Fatal,
        "Incorrect address"
      );
      setAddingState('error')
      return;
    }

    yam.contracts.genericERC20.address = address;
    yam.contracts.genericERC20._address = address;
    let tx = yam.contracts.genericERC20.methods.balanceOf(wallet.account)
    let gas;

    try {
      gas = await tx.estimateGas({from: wallet.account});
      await tx.call({from:wallet.account,  gas })

      const displayTokens = safeParseJSON(localStorage.getItem("customTokens"))
      const tokens = displayTokens ? displayTokens : [];
      const list = [...defaultList,...tokens]
      let error
      list.forEach(
        tokenInList => {
          if(tokenInList == address) {
            windowsContext.showError(
              "Error Adding token",
              "",
              ErrorType.Fatal,
              "Token already tracked",
            );
            setAddingState('error')
            error = true
          }

        })

      if(!error) {
        localStorage.setItem("customTokens", JSON.stringify([...tokens, address]))
        setList([...defaultList, ...tokens,address])
        setAddressInput("")
      }


    } catch (err) {
      console.log('Error')
      windowsContext.showError(
        "Error Adding token",
        "",
        ErrorType.Fatal,
        "Not a valid token address",
      );
      setAddingState('error')

    } finally {


    }


  }
  const [list, setList] = React.useState([]);

  React.useEffect(()=>{
    const displayTokens = safeParseJSON(localStorage.getItem("customTokens"))
    console.log(displayTokens)
    const tokens = displayTokens ? displayTokens : []
    setList([...defaultList, ...tokens])

  },[])


  return (
      <CoreWindow
        {...props}
        windowTitle='Last CORE Liquidity Event is over!'
        width='500px'
        top="5%"
        left="5%"
      >
        <CoreWindowContent>
        <div style={{ padding: '1rem', paddingTop: 0, marginTop: 0}}>
        {/* <h1>The last Liquidity Event Review Period<img src={checkmarkIMG} width={24} /></h1> */}

        { !depositClosed ?
          <>
            <div style={{fontSize:'1.05em', paddingBottom:'1rem', textAlign:'center'}}>
              CORE Fairly Gathered more than $30,000,000 in locked liquidity, now its time to use it.
            </div>

            <div style={{ display: depositClosed ? 'none' : 'block' }}>
              <Progress value={percentLeft > 0 ? percentLeft : 0} variant="tile" />
              <div style={{marginBottom:'1.5rem'}}><Countdown date={depositClosedTimestamp} renderer={renderer} /></div>
            </div>
            <h2 style={{fontWeight:'bold', textAlign:'center'}}>Your contribution value so far {isNaN(userCredit) ? "--" : (userCredit/1e18).toFixed(3)} CORE</h2>
            <div style={{maxHeight:'30vh', overflowY:'auto', overflowX:'hidden', padding:'1rem 0'}}>
              <EthereumDumpElement refreshCredit={refreshCredit} txState={txState} setTxState={setTxState} />
              {list.map(address => <ShitCoinDumpElement refreshCredit={refreshCredit} txState={txState} setTxState={setTxState} tokenAddress={address}/>)}
            </div>

            {wallet.account &&
              <>
                <div style={{display:'flex', width:'100%', paddingTop:'1rem'}}>
                  <TextField
                  value={addressInput}
                  onChange={e=> setAddressInput(e.target.value)}
                  placeholder="0x62359ed..."
                  style={{border: addingState == 'error' && '1px solid red' , width:'100%'}} />
                  <Button style={{marginLeft:'-100px', width:'100px'}} onClick={()=>addNewTokenToList(addressInput)}>Add Token</Button>
                </div>
              </>
            }
          </>
          : <PostLgePanel/>
        }

          {/* <div style={{ maxWidth: '50ch' }}>
            The Liquidity Generation Event Contract is a novelty in the cryptocurrency space.
            It is important to us that an adequate amount of time is given to our contributors to get acquainted with the smart contract mechanics.
          </div>
          <br />
          <div style={{ maxWidth: '50ch' }}>
            This review period will last until 4pm California time Nov 28th.
            After the countdown ends, the liquidity deposits for any token and LP token will be accepted.
          </div> */}
{/*
CORE: The Final Liquidity Generation Event https://link.medium.com/L2TGBoTHybb
LGE 3: The Final Opportunity https://link.medium.com/QVR7aT3aKbb */}
          <div style={{ maxWidth: '50ch' }}>
            <span style={{ fontWeight: 600 }}>Articles about this event:</span> <br />
            <div style={{ display: 'flex', alignItems: 'center' }}><img src={bookIMG} style={{ height: '1.2em', paddingRight: '0.2em' }} />Articles :</div>
            <Anchor target="_blank" href="https://link.medium.com/QVR7aT3aKbb "> LGE 3: The Final Opportunity</Anchor> <br />
            <Anchor target="_blank" href="https://link.medium.com/L2TGBoTHybb"> CORE: The Final Liquidity Generation Event </Anchor>  <br />

          </div>
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
        </CoreWindowContent>
      </CoreWindow>
  );
};

export default CountdownWindowToLGE3;
