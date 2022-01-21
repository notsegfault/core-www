import React from 'react';
import {
  Button,
  Hourglass,
} from 'react95';
import moment from 'moment';
import { CoreWindow, CoreWindowContent } from '../../../../components/Windows';
import { WindowType } from '../../../../config/windowTypes.config';
import { WindowsContext } from '../../../../contexts/Windows';
import { useFannyOrders } from '../../../../hooks';
import checkboxIMG from '../../../../assets/img/checkmark2.png';
import { FannyOrdersStatus } from '../../../../hooks/fanny/useFannyOrders';
import { useWallet } from 'use-wallet';
import CoreScrollableContent from '../../../../components/Windows/CoreScrollableContent';

const FannyOrdersWindow = props => {
  const windowsContext = React.useContext(WindowsContext);
  const orders = useFannyOrders();
  const wallet = useWallet();

  const [pendingTransactions, setPendingTransactions] = React.useState([]);
  const [completedTransactions, setCompletedTransactions] = React.useState([]);

  React.useEffect(() => {
    setPendingTransactions(orders.items.filter(item => !item.ordered));
    setCompletedTransactions(orders.items.filter(item => item.ordered));
  }, [orders]);

  const onCompleteOrder = (id, e) => {
    windowsContext.openWindow(WindowType.FannyShippingForm, e, { id }, { reload: true })
  };

  const renderColumns = () => {
    return <>
      <div style={{ marginTop: '0.5em', display: 'flex', textAlign: 'center', flexDirection: 'row' }}>
        <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0', borderRight: '1px solid black' }}>Claim Number</span>
        <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0', borderRight: '1px solid black' }}>Claim Date</span>
        <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0' }}>Status</span>
      </div>
      <hr />
    </>
  };

  const renderTransactions = (transactions, header, message) => {
    if (transactions.length === 0) {
      return <></>;
    }

    return <>
      <h1>{header}</h1>
      <div>{message}</div>
      {renderColumns()}
      {transactions.map(item => (
        <div key={`order-${item.id}`}>
          <div style={{ display: 'flex', textAlign: 'center', flexDirection: 'row', marginBottom: '1em' }}>
            <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0' }}>#{item.id}</span>
            <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0' }}>{moment.unix(item.timestamp).format('MM/DD/YYYY h:mm:ss a')}</span>
            <span style={{ flexDirection: 'column', flexBasis: '100%', margin: 'auto 0' }}>
              {item.ordered ?
                <img alt="checkbox" src={checkboxIMG} /> :
                <Button onClick={(e) => onCompleteOrder(item.id, e)}>Finalize Order</Button>
              }
            </span>
          </div>
          <hr />
        </div>
      ))}
    </>
  };

  const renderNoOrdersYet = () => {
    if (orders.status === FannyOrdersStatus.Loaded &&
      pendingTransactions.length === 0 &&
      completedTransactions.length === 0) {
      return <div>You have no orders yet.</div>
    }
    return <></>;
  };

  const renderContent = () => {
    if (orders.status === FannyOrdersStatus.Loading) {
      return <div>
        <Hourglass></Hourglass>
        <div>Loading...</div>
      </div>
    }
    return <CoreScrollableContent>
      <div>{orders.error}</div>
      {renderNoOrdersYet()}
      {renderTransactions(pendingTransactions, 'Pending Claims', 'Provide shipping information to receive your fanny pack')}
      {renderTransactions(completedTransactions, 'Completed Claims')}
    </CoreScrollableContent>
  };

  const renderConnectToWallet = () => {
    return <div>Your wallet must be connected</div>
  }

  return (
    <CoreWindow
      {...props}
      windowTitle='Fanny Orders'
      top='11%'
      left='15%'
      minWidth='600px'
      width='600px'
    >
      <CoreWindowContent>
        {wallet.status === 'connected' ? renderContent() : renderConnectToWallet()}
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default FannyOrdersWindow;
