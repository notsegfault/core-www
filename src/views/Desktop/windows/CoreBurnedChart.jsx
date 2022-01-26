import React from 'react';
import { CoreWindow } from '../../../components/Windows';
import CoreWindowContent from '../../../components/Windows/CoreWindowContent';
import coreBurnIMG from '../../../assets/img/coreburn.png';
import { CoreBurnedDuneAnalytics } from '../../../yam/lib/constants';

const CoreBurnedChart = props => {
  return (
    <CoreWindow
      {...props}
      windowTitle="Core Burn History"
      top="10px"
      icon={coreBurnIMG}
      width="1240px"
      height="800px"
      left="10px"
    >
      <CoreWindowContent>
        <iframe style={{marginTop: "1em"}} src={CoreBurnedDuneAnalytics} width="100%" height="100%"/>
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default CoreBurnedChart;
