import React from 'react';
import {
  TableDataCell,
  WindowContent,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  WindowHeader,
} from 'react95';
import { getContractEventInterface } from '../../utils/util';
import styled from 'styled-components';
import { CoreWindow } from '../Windows';
import { ScrollableTable } from '../Table';
import useYam from '../../hooks/useYam';
import moment from 'moment';
import InputDataDecoder from 'ethereum-input-data-decoder';
import BigNumber from 'bignumber.js';
import etherscanLogo from '../../assets/img/etherscan.png';
import dialupImg from '../../assets/img/conn_dialup.png';
import Moment from 'react-moment';
import { tokenMap, addressMap } from '../../yam/lib/constants';
import { WindowsContext } from '../../contexts/Windows';

const WINDOW_WIDTH = 750;
const WINDOW_HEIGHT = 600;
const TABLE_HEIGHT = WINDOW_HEIGHT - 125;
const MAX_PAST_LOG_SIZE = 250;
const EVENT_NAMES = ['Contibution', 'COREBought'];

const arrangeEvents = events => {
  // Group event by transaction hashes
  events = mergeEventsByTxId(events);

  // Sort events by the most recent ones
  events = events.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  // Only keep a few of theme to avoid UI lagging when refreshing.
  // This could be remove if a virtual viewport would be integrated
  // ex: https://github.com/vitalif/dynamic-virtual-scroll
  events = events.splice(0, MAX_PAST_LOG_SIZE);
  return events;
};

const mergeEventsByTxId = events => {
  return events.reduce((acc, obj) => {
    if (!acc) acc = [];
    const index = acc.findIndex(o => o.transactionHash === obj.transactionHash);
    if (index !== -1) {
      acc[index] = { ...acc[index], ...obj };
    } else {
      acc.push(obj);
    }

    return acc;
  }, []);
};

const getTableEntryFromContractEvent = async (yam, eventInterface, contractEvent, inputDecoder) => {
  const eventObj = yam.web3.eth.abi.decodeLog(
    eventInterface.inputs,
    contractEvent.data,
    contractEvent.topics.slice(1)
  );

  const block = await yam.web3.eth.getBlock(contractEvent.blockNumber);
  const timestamp = block.timestamp;
  const date = moment.unix(timestamp);
  let amount = new BigNumber(eventObj[0]).div(new BigNumber(10).pow(18)).toFixed(6);

  const entry = {
    transactionHash: contractEvent.transactionHash,
    date,
  };

  if (eventInterface.name === 'Contibution') {
    const transaction = await yam.web3.eth.getTransaction(contractEvent.transactionHash);
    const transactionObj = inputDecoder.decodeData(transaction.input);
    let amountAsString = transaction.value;
    let token = tokenMap[addressMap.WETH];

    // LP,token or core contribution
    if (transactionObj.inputs.length >= 2) {
      token = tokenMap[`0x${transactionObj.inputs[0].toString()}`];
      amountAsString = transactionObj.inputs[1].toString();
    }

    amount = new BigNumber(amountAsString).div(new BigNumber(10).pow(token.decimals)).toFixed(6);
    entry['ContributionToken'] = token.name;
  }

  entry[eventInterface.name] = amount;

  return entry;
};

const fetchPastEvents = async (yam, contract, inputDecoder) => {
  let pastEvents = await Promise.all(
    EVENT_NAMES.map(async eventName => {
      const eventInterface = getContractEventInterface(yam, contract, eventName);

      const pastEvents = await yam.web3.eth.getPastLogs({
        address: contract.options.address,
        topics: [eventInterface.signature],
        fromBlock: 0,
        toBlock: 'latest',
      });

      return Promise.all(
        pastEvents.map(async pastEvent => {
          const entry = await getTableEntryFromContractEvent(
            yam,
            eventInterface,
            pastEvent,
            inputDecoder
          );
          return entry;
        })
      );
    })
  );

  // Flatten the arrays into a single one
  pastEvents = [].concat(...pastEvents);

  pastEvents = arrangeEvents(pastEvents);
  return pastEvents;
};

const useEvents = () => {
  const yam = useYam();
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    if (yam) {
      setEvents('loading');

      const contract = yam.contracts.LGE2;
      const inputDecoder = new InputDataDecoder(yam.contracts.LGE2._jsonInterface);
      const subscriptions = [];

      const initialize = async () => {
        const pastEvents = await fetchPastEvents(yam, contract, inputDecoder);
        setEvents(pastEvents);

        const subscription = EVENT_NAMES.forEach(eventName => {
          const eventInterface = getContractEventInterface(yam, contract, eventName);

          yam.web3.eth.subscribe(
            'logs',
            {
              address: contract.options.address,
              topics: [eventInterface.signature],
            },
            async (error, event) => {
              if (!error) {
                const entry = await getTableEntryFromContractEvent(
                  yam,
                  eventInterface,
                  event,
                  inputDecoder
                );
                console.log(eventName, entry);
                setEvents(events => arrangeEvents([entry, ...events, ...pastEvents]));
              }
            }
          );
        });

        subscriptions.push(subscription);
      };

      initialize();

      return () => {
        subscriptions.forEach(s => s.unsubscribe());
      };
    }
  }, [yam]);

  return events;
};

const ContributionRow = styled(TableRow)`
  background-color: ${props => (props.buyEvent ? '#77DD77' : 'transparent')};
`;

const LgeLiveFeedWindow = props => {
  let events = useEvents();

  const renderTable = pastEvents => {
    if (pastEvents === 'loading') {
      return (
        <div>
          <img alt="dialup" src={dialupImg} />
          <span style={{ position: 'relative', marginLeft: '0.5em', top: '-0.5em' }}>
            Status: Connecting via RPC on Ethereum blockchain...
          </span>
        </div>
      );
    }

    return (
      <ScrollableTable>
        <TableHead>
          <TableRow>
            <TableHeadCell style={{ width: 20 }}></TableHeadCell>
            <TableHeadCell style={{ width: 150 }}>Date</TableHeadCell>
            <TableHeadCell>Contribution</TableHeadCell>
            <TableHeadCell>CORE Bought</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ minHeight: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT }}>
          {events.map(e => (
            <ContributionRow key={e.transactionHash} buyEvent={!!e.COREBought}>
              <TableDataCell style={{ width: 20 }}>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://etherscan.io/tx/${e.transactionHash}`}
                >
                  <img width="16" alt="etherscan" src={etherscanLogo} />
                </a>
              </TableDataCell>
              <TableDataCell style={{ width: 150 }}>
                <Moment fromNow>{e.date}</Moment>
              </TableDataCell>
              <TableDataCell>
                {e.Contibution} {e.ContributionToken}
              </TableDataCell>
              <TableDataCell>{!e.COREBought ? '-' : e.COREBought}</TableDataCell>
            </ContributionRow>
          ))}
        </TableBody>
      </ScrollableTable>
    );
  };

  return (
    <CoreWindow
      {...props}
      windowTitle='Liquidity Generation Event Live Feed'
      width={WINDOW_WIDTH}
      height={WINDOW_HEIGHT}
    >
      <WindowContent>{renderTable(events)}</WindowContent>
    </CoreWindow>
  );
};

export default LgeLiveFeedWindow;
