import React from 'react';
import {
  Panel,
  Button,
  TextField,
  Fieldset,
  Radio,
  Anchor,
  Tooltip
} from 'react95';
import Reward from 'react-rewards';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import wizardIMG from '../../../assets/img/wizard1.gif';
import arrowIMG from '../../../assets/img/arrow1.png';
import { WindowsContext } from '../../../contexts/Windows';
import { useYam, useUniPairTokensInfo, UniPairTokensInfoState } from '../../../hooks';
import { useDebounce } from 'use-debounce';
import ErrorText from '../../../components/Text/ErrorText';
import { useWallet } from 'use-wallet';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import { addressMap } from '../../../yam/lib/constants';
import Hamster from '../../../components/Memes/Hamster';
import '../../../styles/effects.css';
import styled from 'styled-components';

const MAX_STEPS = 20;

const PageType = {
  Welcome: 0,
  ChooseBorrowPair: 1,
  ChooseStrategyPair: 2,
  Creating: 3
};

const WizardPanelLeft = styled(Panel)`
  padding: 0.8rem;
  height: 360;
  width: 210;
  margin-right: 0.5em;
  background-color: teal;

  @media only screen and (max-width: 767px) {
    display none; 
  }
`;

const WizardPanelRight = styled.div`
  width: 100%;
  text-align: justify;
  margin-left: 0.5em;
  margin-right: 0.5em;

  @media only screen and (max-width: 767px) {
    margin: 0
  }
`;

const AddStrategyWindow = props => {
  const yam = useYam();
  const wallet = useWallet();
  const windowsContext = React.useContext(WindowsContext);
  const [strategySteps, setStrategySteps] = React.useState([]);
  const [pageType, setPageType] = React.useState(PageType.Welcome);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [newlyCreatedStrategyID, setNewlyCreatedStrategyID] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedBorrowToken, setSelectedBorrowToken] = React.useState(null);

  const reward = React.useRef();

  /**
   * Waterfall states: changeing pairContractAddressText triggers useDebounce
   * that eventually changes pairContractAddress that triggers useUniPairTokensInfo
   */
  const [pairContractAddressText, setPairContractAddressText] = React.useState('');
  const [pairContractAddress] = useDebounce(pairContractAddressText, 500);
  const [uniPairTokensInfo, clearUniPairTokensInfo] = useUniPairTokensInfo(pairContractAddress);

  React.useEffect(() => {
    console.log('strategySteps', strategySteps);
  }, [strategySteps]);

  /**
   * Used for the initial step where the user needs to select a token
   * to borrow from. Triggers when the selected radio button is changed.
   */
  React.useEffect(() => {
    switch (pageType) {
      case PageType.ChooseBorrowPair:
        if (selectedBorrowToken !== null && !isUniPairInfoContainingCoreToken()) {
          let tokenIn, tokenOut;
          if (selectedBorrowToken === uniPairTokensInfo.token0.address) {
            tokenIn = uniPairTokensInfo.token1.address;
            tokenOut = uniPairTokensInfo.token0.address;
          } else {
            tokenIn = uniPairTokensInfo.token0.address;
            tokenOut = uniPairTokensInfo.token1.address;
          }
          setStrategyEntry(uniPairTokensInfo, tokenIn, tokenOut, 0);
        }
        break;
    }
  }, [selectedBorrowToken])

  /**
   * Triggers once the smart contract textfield has been modified post-debounce.
   */
  React.useEffect(() => {
    switch (pageType) {
      case PageType.ChooseBorrowPair:
        setSelectedBorrowToken(null);
        removeCurrentStrategyStep();
        break;
      case PageType.ChooseStrategyPair:
        removeCurrentStrategyStep();
        break;
    }
  }, [pairContractAddress]);

  /**
   * Triggers the uniswap pair information has been received from
   * what the user input in the smart contract textfield.
   */
  React.useEffect(() => {
    switch (pageType) {
      case PageType.ChooseStrategyPair:
        switch (uniPairTokensInfo.state) {
          case UniPairTokensInfoState.Ready:
            const previousStep = getPreviousStrategyStep();
            if (isUniPairChainableWithPreviousStep(previousStep) &&
              !isUniPairSameAsPairBorrowedFrom() &&
              !isUniPairInfoContainingCoreToken()) {
              let tokenIn, tokenOut;
              if (previousStep.tokenOut === uniPairTokensInfo.token0.address) {
                tokenIn = uniPairTokensInfo.token0.address;
                tokenOut = uniPairTokensInfo.token1.address;
              } else {
                tokenIn = uniPairTokensInfo.token1.address;
                tokenOut = uniPairTokensInfo.token0.address;
              }
              setStrategyEntry(uniPairTokensInfo, tokenIn, tokenOut, 0);
            }
            break
        }
    }

    setLoading(uniPairTokensInfo.state === UniPairTokensInfoState.Loading);
  }, [uniPairTokensInfo]);

  /**
   * Resets the wizard to add a new strategy.
   */
  const resetWizard = () => {
    setStrategySteps([]);
    setSelectedBorrowToken(null);
    setStepIndex(0);
    setNewlyCreatedStrategyID(null);
    setPairContractAddressText('');
    clearUniPairTokensInfo();
    setPageType(PageType.ChooseBorrowPair);
    setLoading(false);
  };

  const removeCurrentStrategyStep = () => {
    setStrategySteps(strategySteps => [
      ...strategySteps.slice(0, stepIndex)
    ])
  };

  /**
   * Adds a new strategy entry in the chain.
   */
  const setStrategyEntry = (pairInfo, tokenIn, tokenOut, feeOnTransfer) => {
    const entry = {
      pairInfo,
      tokenIn,
      tokenOut,
      feeOnTransfer,
    };

    if (entry.pairInfo.token0.address === tokenOut) {
      entry['tokenOutName'] = entry.pairInfo.token0.name;
    } else {
      entry['tokenOutName'] = entry.pairInfo.token1.name;
    }

    if (entry.pairInfo.token0.address === tokenIn) {
      entry['tokenInName'] = entry.pairInfo.token0.name;
    } else {
      entry['tokenInName'] = entry.pairInfo.token1.name;
    }

    setStrategySteps(strategySteps => [
      ...strategySteps.slice(0, stepIndex),
      entry,
      ...strategySteps.slice(stepIndex + 1)
    ])
  };

  /**
   * Returns true when the last strategy step tokenOut is the
   * same as the first strategy step tokenIn which is 
   * the inverse of the borrowed token.
   */
  const isStrategyLooping = () => {
    if (strategySteps.length > 1) {
      const lastStep = strategySteps[strategySteps.length - 1];
      const firstStep = strategySteps[0]

      return lastStep.tokenOut === firstStep.tokenIn;
    }

    return false;
  };

  /**
   * Verify that the current uniswap pair contains the tokenOut of
   * the specified previousStep.
   */
  const isUniPairChainableWithPreviousStep = (previousStep) => {
    return (previousStep.tokenOut === uniPairTokensInfo.token0.address ||
      previousStep.tokenOut === uniPairTokensInfo.token1.address);
  }

  /**
   * Returns true when the current specified uniswap pair address
   * is the same one as the pair we are borrowing from.
   */
  const isUniPairSameAsPairBorrowedFrom = () => {
    return uniPairTokensInfo.address === strategySteps[0].pairInfo.address
  }

  const getPreviousStrategyStep = () => {
    if (stepIndex > 0) {
      return strategySteps[stepIndex - 1];
    }
    return null;
  }

  const handleNextButtonDisabled = () => {
    if (!yam) return 'disabled';

    if (stepIndex >= MAX_STEPS - 1) return 'disabled';

    switch (pageType) {
      case PageType.ChooseBorrowPair:
        return selectedBorrowToken === null ? 'disabled' : '';
      case PageType.ChooseStrategyPair:
        return strategySteps.length - 1 < stepIndex ? 'disabled' : '';
      case PageType.Creating:
        return 'disabled';
    }

    return '';
  };

  const handlePreviousButtonDisabled = () => {
    if (!yam) return 'disabled';

    switch (pageType) {
      case PageType.ChooseStrategyPair:
        return strategySteps.length < 1 ? 'disabled' : '';
      case PageType.Welcome:
      case PageType.ChooseBorrowPair:
      case PageType.Creating:
        return 'disabled';
    }

    return '';
  };

  const handleFinishButtonDisabled = () => {
    switch (pageType) {
      case PageType.Creating:
        return 'disabled';
      default:
        return !isStrategyLooping() ? 'disabled' : '';
    }
  }

  const renderEtherscanLink = (content, address) => {
    return <Anchor href={`https://etherscan.io/address/${address}`} target="_blank">
      {content}
    </Anchor>
  }

  const renderPage = () => {
    switch (pageType) {
      case PageType.Welcome:
        return renderWelcome();
      case PageType.ChooseBorrowPair:
        return renderChooseBorrowPairStep();
      case PageType.ChooseStrategyPair:
        return renderChooseStrategyPair();
      case PageType.Creating:
        return renderCreatingStrategy();
    }
  };

  const renderWelcome = () => {
    return <>
      {wallet.status === 'connected' ?
        <>
          <h2>Welcome to the Abitrage Strategy Wizard!</h2>
          <p style={{ marginTop: '0.6rem' }}>
            This Wizard will guide you through the process of creating a new arbitrage strategy.
        </p>
          <p style={{ marginTop: '0.6rem' }}>
            Arbitrage represents an opportunity for low risk profit from discrepancies in prices of financial instruments.
            While Supply and Demand is the primary driving factor behind financial markets, a change in one of these factors can affect the price of an asset.
            To successfully profit from such an opportunity, one must spot the differences in price.
          <br /><br />
            [<Anchor target="_blank" href=' https://medium.com/core-vault/spotlight-flash-arbitrage-d8c1a38a809e'>More information...</Anchor>]
          <br /><br />
          Click next to continue
        </p>
        </>
        :
        <ErrorText style={{ marginTop: '1.5rem' }}>Your wallet must be connected to use this feature</ErrorText>
      }
    </>
  };

  const renderChooseBorrowPairStep = () => {
    const renderContent = () => {
      if (pairContractAddress.trim().length > 0) {
        if (!yam.web3.utils.isAddress(pairContractAddress)) {
          return renderInvalidSmartContractAddress(pairContractAddress);
        }

        switch (uniPairTokensInfo.state) {
          case UniPairTokensInfoState.Loading:
            return <>Loading pair information...</>;
          case UniPairTokensInfoState.Ready:
            if (isUniPairInfoContainingCoreToken()) {
              return <ErrorText>Pairs containing Core are forbidden.</ErrorText>
            }
            return <>
              <Fieldset label='Which coin do you want the strategy to borrow?' style={{ marginTop: '1.5em' }}>
                <Radio
                  checked={selectedBorrowToken === uniPairTokensInfo.token0.address}
                  onChange={handleTokenSelectionChange}
                  value={uniPairTokensInfo.token0.address}
                  label={uniPairTokensInfo.token0.name}
                  name={uniPairTokensInfo.token0.name}
                />
                <br />
                <Radio
                  checked={selectedBorrowToken === uniPairTokensInfo.token1.address}
                  onChange={handleTokenSelectionChange}
                  value={uniPairTokensInfo.token1.address}
                  label={uniPairTokensInfo.token1.name}
                  name={uniPairTokensInfo.token1.name}
                />
              </Fieldset>
            </>;
          case UniPairTokensInfoState.Error:
            return <ErrorText>{pairContractAddress} is not a valid Uniswap pair smart contract address.</ErrorText>
        };
      }
    }


    const isUniPairValid = () => {
      return yam && pairContractAddress.trim().length > 0 && yam.web3.utils.isAddress(pairContractAddress) &&
        uniPairTokensInfo.state === UniPairTokensInfoState.Ready && !isUniPairInfoContainingCoreToken();
    };

    if (!isUniPairValid()) {
      return <div style={{ marginTop: '4.5em' }}>
        <div class="wordart blues" style={{ fontSize: '3em', fontWeight: 'bold', width: '100%', textAlign: 'center' }}><span class="text">Add the first pair</span></div>
        <p style={{ marginTop: '0.6rem', marginBottom: '0.5em' }}>
          First pair is the pair you're borrowing from.<br />
          Just provide an address and you can pick which asset to borrow in the flash loan!
        </p>
        {renderUniPairTextField()}
        <br />
        {renderContent()}
      </div>;
    } else {
      return <>
        {renderUniPairTextField()}
        <div style={{ marginTop: '1em' }}>
          {renderContent()}
        </div>
        <div style={{ marginTop: '1em', overflow: 'auto' }}>
          {renderStrategyBreadcrumb()}
        </div>
      </>
    }
  };

  const renderChooseStrategyPair = () => {
    const renderContent = () => {
      if (pairContractAddress.trim().length > 0) {
        if (!yam.web3.utils.isAddress(pairContractAddress)) {
          return renderInvalidSmartContractAddress(pairContractAddress);
        }

        switch (uniPairTokensInfo.state) {
          case UniPairTokensInfoState.Loading:
            return <>Loading pair information...</>;
          case UniPairTokensInfoState.Ready:
            const previousStep = getPreviousStrategyStep();
            const pairName = `${uniPairTokensInfo.token0.name} / ${uniPairTokensInfo.token1.name}`;

            if (isUniPairInfoContainingCoreToken()) {
              return <ErrorText>
                Pairs containing Core are forbidden.
                </ErrorText>
            }
            if (!isUniPairChainableWithPreviousStep(previousStep)) {
              return <ErrorText>
                {pairName} is not valid pair to swap to. A pair containing {renderEtherscanLink(previousStep.tokenOutName, previousStep.tokenOut)} {' '}
                  is expected but {renderEtherscanLink(`${uniPairTokensInfo.token0.name}/${uniPairTokensInfo.token1.name}`, uniPairTokensInfo.address)} was found.
                </ErrorText>
            }
            if (isUniPairSameAsPairBorrowedFrom()) {
              return <ErrorText>
                Including a pair that is already used to borrow from is not allowed.
                </ErrorText>
            }
            return <></>;
          case UniPairTokensInfoState.Error:
            return <ErrorText>{pairContractAddress} is not a valid Uniswap pair smart contract address.</ErrorText>
        }
      }
    };

    const previousStep = getPreviousStrategyStep();

    return <>
      <p style={{ marginTop: '0.6rem' }}>
        Enter a pair that contains <strong>{previousStep.tokenOutName}</strong>
      </p>
      {renderUniPairTextField()}
      <div style={{ marginTop: '1em' }}>
        {renderContent()}
      </div>
      <div style={{ marginTop: '1em', overflow: 'auto' }}>
        {(isLastStep() && !isStrategyLooping()) &&
          <>
            <ErrorText>
              This is the last step allowed since the maximum number of swap a strategy can contain is {MAX_STEPS}. You must therefore provide a pair to return {strategySteps[0].tokenInName}.
            </ErrorText>
            <br />
          </>
        }
        {renderStrategyBreadcrumb()}
      </div>
    </>
  };

  const renderInvalidSmartContractAddress = (pairContractAddress) => {
    return <ErrorText>
      {pairContractAddress} is not a valid Ethereum smart contract address.
    </ErrorText>
  };

  const renderUniPairTextField = () => {
    return <TextField
      placeholder='0x0000000000000000000000000000000000000000'
      value={pairContractAddressText}
      onChange={(e) => {
        setPairContractAddressText(e.target.value.trim());
      }}
      fullWidth
    />
  };

  const renderCreatingStrategy = () => {
    const renderMain = () => {
      switch (pageType) {
        case PageType.Creating:
          if (newlyCreatedStrategyID === null) {
            return <p>Creating strategy...</p>
          } else {
            return <div style={{ textAlign: 'center' }}>
              <h1 style={{ marginTop: '30%' }}>
                <Reward ref={(ref) => { reward.current = ref }} type='confetti'></Reward>
                The strategy with the id {newlyCreatedStrategyID} has been created!
              </h1>
              <div>
                <Hamster style={{ margin: 'auto' }} />
              </div>
            </div>
          }
      }
    };

    return <>
      {renderMain()}
    </>

  };

  const isUniPairInfoContainingCoreToken = () => {
    return uniPairTokensInfo.token0.address.toUpperCase() === addressMap.core.toUpperCase() ||
      uniPairTokensInfo.token0.address.toUpperCase() === addressMap.core.toUpperCase();
  };

  const renderStrategyBreadcrumb = () => {
    const renderToken = (step, token, index, looping) => {
      if (index === 0) {
        if (token.address === step.tokenOut) {
          return <span style={{ fontWeight: 'bold', color: '#6000D6' }}>{token.name}</span>
        } if (looping) {
          return <span style={{ fontWeight: 'bold', color: 'blue' }}>{token.name}</span>
        }
      }
      if (index === strategySteps.length - 1 && looping) {
        if (token.address === strategySteps[0].tokenIn) {
          return <span style={{ fontWeight: 'bold', color: 'blue' }}>{token.name}</span>
        }
      }

      return <span style={{ fontWeight: step.tokenOut === token.address ? 'bold' : '' }}>{token.name}</span>
    };

    const renderArrow = (index, looping) => {
      if (index <= strategySteps.length - 2) {
        if (index === strategySteps.length - 1 && looping) {
          return <></>
        }
        return <span style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}><img alt="arrow" src={arrowIMG} /></span>
      }
      return <></>
    }

    const renderCurrentStrategyStep = (step, index) => {
      const looping = isStrategyLooping();

      return <span key={`strat-step-${index}`}>
        {renderToken(step, step.pairInfo.token0, index, looping)} / {renderToken(step, step.pairInfo.token1, index, looping)}
        {renderArrow(index, looping)}
      </span>
    };

    if (strategySteps.length > 0) {
      return <div style={{ lineBreak: 'anywhere' }}>
        <div><strong>Current Strategy</strong></div>
        {!isStrategyLooping() && <div>Token that needs to be returned: {strategySteps[0].tokenInName}
          <span style={{ marginLeft: '0.2em', fontSize: '0.7em', verticalAlign: 'top' }}>
            <Tooltip text='More information on flash swaps' enterDelay={100} leaveDelay={100}>
              <Anchor target="_blank" href="https://uniswap.org/docs/v2/smart-contract-integration/using-flash-swaps/">(?)</Anchor>
            </Tooltip>
          </span>
        </div>}
        <hr />
        {strategySteps.map((step, index) => renderCurrentStrategyStep(step, index))}
      </div>
    }

    return <></>
  };

  const handleTokenSelectionChange = (e) => {
    setSelectedBorrowToken(e.target.value);
  };

  const isLastStep = () => {
    return stepIndex >= MAX_STEPS - 1;
  };

  const onNext = () => {
    switch (pageType) {
      case PageType.Welcome:
        setPageType(PageType.ChooseBorrowPair);
        break;

      case PageType.ChooseBorrowPair:
        setPairContractAddressText('');
        clearUniPairTokensInfo();
        setPageType(PageType.ChooseStrategyPair);
        setStepIndex(stepIndex => stepIndex + 1);
        break;

      case PageType.ChooseStrategyPair:
        setPairContractAddressText('');
        clearUniPairTokensInfo();
        setStepIndex(stepIndex => stepIndex + 1);
        break;
    }
  };

  /**
   * WIP
   */
  const onPrevious = () => {
    switch (pageType) {
      case PageType.ChooseStrategyPair:
        const previousStepIndex = stepIndex - 1;
        setPairContractAddressText(strategySteps[previousStepIndex].pairInfo.address);

        if (previousStepIndex == 0) {
          setSelectedBorrowToken(strategySteps[previousStepIndex].tokenOut);
        }
        if (stepIndex == 1) {
          setPageType(PageType.ChooseBorrowPair);
        }
        setStepIndex(stepIndex => stepIndex - 1);
        break;
    }
  };

  const onFinish = (e) => {
    const addStrategy = async () => {
      const borrowToken0 = strategySteps[0].tokenOut === strategySteps[0].pairInfo.token0.address;
      const pairs = strategySteps.map(step => step.pairInfo.address);
      const feeOnTransfers = strategySteps.map(step => step.feeOnTransfer);

      console.debug('Adding Strategy', borrowToken0, pairs);
      const transaction = await yam.contracts.ARBITRAGECONTROLLER.methods.addNewStrategyWithFeeOnTransferTokens(borrowToken0, pairs, feeOnTransfers)

      let transactionGasEstimate
      try {
        setPageType(PageType.Creating)
        setLoading(true);

        transactionGasEstimate = await transaction.estimateGas({ from: wallet.account })

        const tx = await transaction.send({
          from: wallet.account,
          gas: transactionGasEstimate
        });

        const strategyID = parseInt(tx.events.StrategyAdded.returnValues[1]);
        setImmediate(() => {
          reward && reward.current.rewardMe();
        });
        setNewlyCreatedStrategyID(strategyID);
      }
      catch (err) {
        const messageWithoutFluff = err.message.split(":")[1] + err.message.split(":")[2];
        windowsContext.showError(
          "Error",
          messageWithoutFluff.split("{")[0],
          ErrorType.Fatal,
          "An error occured while adding the strategy:"
        );
        setPageType(PageType.ChooseStrategyPair);
      } finally {
        setLoading(false);
      }
    };

    addStrategy();
  };

  const onCancel = async (e) => {
    let close = true;

    if (pageType > 0) {
      close = await windowsContext.showConfirm('Confirmation', <>Are you sure you want to quit the strategy installation setup?</>);
    }

    close && windowsContext.closeWindow(props.windowName, e)
  };

  const loadingOverlayZIndex = windowsContext.getWindowByName(props.windowName).zIndex + 1;

  // TODO: Make loading mechanism available directly from CoreWindow since 
  // it will probably be useful elsewhere later on.
  const windowWidth = 675;
  const windowHeight = 500;
  const windowBarHeight = 41;
  const borderSize = 2;

  return (
    <CoreWindow
      {...props}
      windowTitle='Strategy Setup Wizard'
      width={`${windowWidth}px`}
      height={`${windowHeight}px`}
      top='20%'
      left='25%'
    >
      <CoreWindowContent extraPadding>
        {loading && <div style={{
          position: 'absolute',
          top: windowBarHeight + borderSize,
          pointerEvent: 'none',
          left: borderSize,
          width: windowWidth - 10,
          height: windowHeight - windowBarHeight - 10,
          opacity: 0.6,
          zIndex: loadingOverlayZIndex,
          backgroundColor: 'gray',
        }}></div>}
        <div style={{ display: 'inline-flex' }}>
          <WizardPanelLeft variant='well'>
            <img alt="wizard" src={wizardIMG} style={{ height: 325 }} />
          </WizardPanelLeft>
          <WizardPanelRight>
            {renderPage()}
          </WizardPanelRight>
        </div>
        <hr />
        {isStrategyLooping() && pageType == PageType.ChooseStrategyPair && <span class="smallfadeintout" style={{ fontWeight: 'bold', position: 'relative' }}>Strategy is now ready to be finalized</span>}
        <div style={{ textAlign: 'right' }}>
          {newlyCreatedStrategyID !== null && <Button style={{ marginRight: '10px' }} onClick={resetWizard}>Start a new</Button>}
          {/* WIP: <Button disabled={handlePreviousButtonDisabled()} onClick={onPrevious}>&lt; Previous</Button>*/}
          <Button disabled={handleNextButtonDisabled()} style={{
            marginRight: '10px',
            border: pageType != PageType.Welcome && handleNextButtonDisabled() != 'disabled' ? '3px solid orange' : '',
          }} onClick={onNext}>Next &gt;</Button>
          <Button disabled={handleFinishButtonDisabled()} style={{
            marginRight: '10px',
            border: isStrategyLooping() && pageType == PageType.ChooseStrategyPair ? '3px solid green' : '',
          }} onClick={(e) => onFinish(e)}>Finish</Button>
          <Button onClick={(e) => onCancel(e)}>Cancel</Button>
        </div>
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default AddStrategyWindow;
