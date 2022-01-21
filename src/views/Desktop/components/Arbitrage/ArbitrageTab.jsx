import React from 'react';
import {
  Button,
  Panel,
  TextField,
  Bar
} from 'react95';
import styled from 'styled-components';
import warningIMG from '../../../../assets/img/warning.png';
import shortcutIMG from '../../../../assets/img/shortcut.png';
import { WindowsContext } from '../../../../contexts/Windows';
import { useArbitrageStrategyCount, useMostProfitableStrategy, useYam } from '../../../../hooks';
import ArbitrageStrategyBlock from './ArbitrageStrategyBlock';
import { arrayMove, SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { useWallet } from 'use-wallet';
import { getArbitrageWindowName } from '../../windows/ArbitrageStrategyWindow';
import { WindowType } from '../../../../config/windowTypes.config';
import { ErrorType } from '../../../../contexts/Windows/WindowsProvider';
import StrategyInfo from './StrategyInfo';
import { DATA_UNAVAILABLE } from '../../../../yam/lib/constants';
import { TransactionButton } from '../../../../components/Button';

const DEFAULT_STRATS = [0, 1];

export const ArbitrageTabHeader = styled.div`
  margin-top: 0.5em;
  justify-content: space-between;
  display: inline-flex;
`;

export const LeftHandles = styled.span`
  float: left;
  display: block;
`;

export const RightHandles = styled.span`
  float: right;
  display: block;
`;

export const DragHandle = styled.span`
  display: inline-block;
  width: 18px;
  height: 11px;
  opacity: .25;
  cursor: row-resize;
  background: -webkit-linear-gradient(top,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000);
  background: linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000);
`;

export const DetachHandle = styled.span`
  display: inline-block;
  width: 18px;
  opacity: .60;
  margin-right: 0.5em;
  top: 0.15em;
  position: relative;
  cursor: pointer;
`;

export const CloseButton = styled.span`
  cursor: pointer;
  display: inline-block;
  opacity: .60;
  width: 16px;
  height: 16px;
  margin-left: -1px;
  top: 0.145rem;
  margin-left: 10px;
  margin-top: -1px;
  transform: rotateZ(45deg);
  position: relative;
  &:before,
  &:after {
    content: '';
    position: absolute;
    background: #000;
  }
  &:before {
    height: 100%;
    width: 3px;
    left: 50%;
    transform: translateX(-50%);
  }
  &:after {
    height: 3px;
    width: 100%;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const StyledSortableStrategyContainer = styled(Panel)`
    overflow: auto;
    height: 400px;
    width: 100%;

    @media only screen and (max-width: 767px) {
      overflow: visible;
      height: auto;
    }
`;

const SortDragHandle = SortableHandle(() => <DragHandle></DragHandle>);

const StrategyBlock = ({ setProjectedProfits, strategyID, style, className }) => {
  return <ArbitrageStrategyBlock style={style} setProjectedProfits={setProjectedProfits} strategyID={`${strategyID}`}>
    {props =>
      <div className={className} style={{ ...style, textAlign: 'center' }}>
        <span style={{ fontWeight: 'bold', marginBottom: '0.7rem' }}>{props.name}</span><br />
        <div style={{ textAlign: 'left', margin: '0.5rem' }}>
          <StrategyInfo {...props} />
        </div>
        <div style={{ display: 'flex', alignItems: 'start', alignSelf: 'flex-end' }}>
          <TransactionButton style={{ margin: '1rem', width: '100%' }}
            onClick={() => props.executeStrategy(strategyID)} text="Execute" textLoading="Executing...">
          </TransactionButton>
        </div>
      </div>
    }
  </ArbitrageStrategyBlock>;
};

const SortableStrategyItem = SortableElement(({ strategyID, onDetach, onRemove }) => {
  const [projectedProfits, setProjectedProfits] = React.useState(0);

  return <li>
    <Panel
      variant='outside'
      shadow={parseInt(projectedProfits.inEth) > 0}
      style={{ padding: '0.5rem', lineHeight: '1.5', width: '100%', marginBottom: '0.5rem' }}
    >
      <LeftHandles>
        <DetachHandle onClick={(e) => onDetach(e)}><img alt="detach" src={shortcutIMG} /></DetachHandle>
      </LeftHandles>
      <RightHandles>
        <SortDragHandle />
        <CloseButton onClick={() => onRemove()} />
      </RightHandles>
      <StrategyBlock setProjectedProfits={setProjectedProfits} strategyID={strategyID} />
    </Panel>
  </li>
});

const SortableStrategyContainer = SortableContainer(({ children }) => {
  return <StyledSortableStrategyContainer variant="well">
    {children}
  </StyledSortableStrategyContainer>;
});

const ArbitrageTab = ({ parentWindow }) => {
  const wallet = useWallet();
  const yam = useYam();
  const windowsContext = React.useContext(WindowsContext);
  const numberOfStrategies = useArbitrageStrategyCount();
  const mostProfitableStrategy = useMostProfitableStrategy();
  const [trackedStrategies, setTrackedStrategies] = React.useState({
    items: DEFAULT_STRATS
  });

  const [searchStrategyID, setSearchStrategyID] = React.useState('');

  React.useEffect(() => {
    if (localStorage.trackedStrategies) {
      let items = DEFAULT_STRATS;

      try {
        const potentialItems = JSON.parse(localStorage.trackedStrategies);
        if (!Array.isArray(items)) {
          throw new Error();
        }

        items = potentialItems;
      } catch {
        delete localStorage.trackedStrategies;
      }

      setTrackedStrategies({
        items
      })
    }
  }, []);

  React.useEffect(() => {
    localStorage.trackedStrategies = JSON.stringify(trackedStrategies.items);
  }, [trackedStrategies]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setTrackedStrategies(({ items }) => ({
      items: arrayMove(items, oldIndex, newIndex),
    }));
  };

  /**
   * Use a ref to keep the same context when coming from
   * onClose() from the detached window.
   */
  const addSearchStrategyToWatch = React.useRef();
  addSearchStrategyToWatch.current = strategyID => {
    const addToWatch = async () => {
      try {
        await yam.contracts.ARBITRAGECONTROLLER.methods.strategyInfo(strategyID).call();

        if (trackedStrategies.items.indexOf(strategyID) === -1) {
          setTrackedStrategies(trackedStrategies => ({
            items: [strategyID, ...trackedStrategies.items]
          }));
        }
      } catch {
        windowsContext.showError(
          "Invalid Strategy Id",
          `The given strategy '${strategyID}' does not exist.`,
          ErrorType.Fatal, ""
        );
      }
    }

    addToWatch();
  };

  const updateBeforeSortStart = (node) => {
    node.node.style.zIndex = parentWindow.zIndex + 1;
  };

  const onDetach = (event, strategyID, _index) => {
    const windowName = getArbitrageWindowName(strategyID);
    windowsContext.openWindow(WindowType.ArbitrageStrategy, event, {
      strategyID,
      onClose: (e) => {
        addSearchStrategyToWatch.current(strategyID);
      }
    }, { windowName })
  };

  const onRemove = (strategyID) => {
    setTrackedStrategies(trackedStrategies => ({
      items: trackedStrategies.items.filter(i => i !== strategyID)
    }));
  }

  const handleSearchStrategyID = (e) => {
    const targetValue = parseInt(e.target.value)
    setSearchStrategyID(Number.isNaN(targetValue) ? '' : targetValue);
  };

  const renderTrackedStrategies = () => {
    const detachedStrategyIds = windowsContext.getWindowsByType(WindowType.ArbitrageStrategy).map(window => window.props.strategyID);
    const undetachedTrackedStrategies = trackedStrategies.items.filter(i => detachedStrategyIds.indexOf(i) === -1);

    return undetachedTrackedStrategies.map((strategyID, index) => (
      <SortableStrategyItem key={`item-${strategyID}`}
        index={index}
        strategyID={strategyID}
        onDetach={event => onDetach(event, strategyID, index)}
        onRemove={() => onRemove(strategyID)} />
    ))
  }

  const renderMostProfitableStrategy = () => {
    if (mostProfitableStrategy.inEth === DATA_UNAVAILABLE || mostProfitableStrategy.inEth <= 0) {
      return <></>;
    }
    return <StrategyBlock style={{ border: "4px solid gold", borderRadius: '10px', padding: '0.4em', marginBottom: '0.4em' }} strategyID={mostProfitableStrategy.strategyID} />
  };

  const render = () => {
    if (!wallet.account) {
      return <div>Your wallet must be connected to use the arbitrage.</div>
    }

    return <>
      <div>Number of strategies in the contract {numberOfStrategies}</div>
      <ArbitrageTabHeader>
        <Button style={{ marginBottom: '0.7rem' }} onClick={(e) => windowsContext.openWindow(WindowType.AddStrategy, e)}>Add new strategy...</Button>
        <Bar size={30} style={{ position: 'relative', top: '-0.4rem', margin: '0.5rem' }} />
        <TextField
          value={searchStrategyID}
          onChange={handleSearchStrategyID}
          style={{ width: '100px', height: '20px', marginRight: '0.5rem' }}
        />
        <Button disabled={searchStrategyID === '' || !yam} onClick={() => {
          addSearchStrategyToWatch.current(searchStrategyID);
          setSearchStrategyID('');
        }}>Add to watch</Button>
      </ArbitrageTabHeader>
      {/*renderMostProfitableStrategy()*/}
      <SortableStrategyContainer updateBeforeSortStart={updateBeforeSortStart} onSortEnd={onSortEnd} useDragHandle lockAxis={'y'}>
        {renderTrackedStrategies()}
      </SortableStrategyContainer>
      <Panel variant='well' style={{ marginTop: '0.5rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
        <img style={{ width: '20px', marginRight: '0.2rem' }} src={warningIMG} />
        Executing strategy on chain will only work for the first person who calls it.
      </Panel>
    </>
  };

  return <>
    {render()}
  </>;
}

export default ArbitrageTab;
