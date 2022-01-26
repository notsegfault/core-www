import React from 'react';
import {
  Panel,
  Bar,
  Button
} from 'react95';
import { CoreWindow } from '../../../components/Windows';
import { WindowsContext } from '../../../contexts/Windows';
import CoreWindowContent from '../../../components/Windows/CoreWindowContent';
import coreBurnIMG from '../../../assets/img/coreburn.png';
import { CoreBurnedDuneAnalytics } from '../../../yam/lib/constants';

const ReadMore = props => {
  const windowsContext = React.useContext(WindowsContext);
  return (
    <CoreWindow
      {...props}
      windowTitle='coreburn.exe'
      top='0'
      icon={coreBurnIMG}
      width='800px'
      height='600px'
      left={`${window.innerWidth / 5}px`}
    >
      <CoreWindowContent>
        <div>
        Starting on 26 January 2022, 1/7th of the CORE is burning every day leading up to the CORE lending protocol launch, for a total of 8,300 CORE.
        </div>
        <iframe style={{marginTop: "1em"}} src={CoreBurnedDuneAnalytics} width="100%" height="100%"/>
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default ReadMore;
