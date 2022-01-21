import React from 'react';
import diabloIMG from '../../../assets/img/diablo.png';
import { CoreWindow } from '../../../components/Windows';
import Iframe from 'react-iframe';

const DiabloWindow = props => {
  return (
      <CoreWindow
        {...props}
        icon={diabloIMG}
        windowTitle='Diablo 1'
      >
        <Iframe
            url="https://d07riv.github.io/diabloweb/"
            width="800px"
            height="600px"
            display="initial"
            position="relative"
          />
      </CoreWindow>
  );
};
export default DiabloWindow;
