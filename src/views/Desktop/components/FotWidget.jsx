import React from 'react'
import { useTransferChecker } from '../../../hooks';

const NORMAL_FOT = 1;

const FotWidget = () => {
  const transferCheckerData = useTransferChecker();

  if (transferCheckerData.fot <= NORMAL_FOT) {
    return <></>;
  }

  return <div style={{display:'none', alignItems:'flex-end', flexDirection:'column'}}>
    <h2>Surge protector initialized</h2>
    <h3>Current FoT {transferCheckerData.fot} %</h3>
  </div>;
};

export default FotWidget;
