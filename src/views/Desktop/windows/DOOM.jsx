import React from 'react';
import doomIMG from '../../../assets/img/doom.png';
import JsDos from '../../../components/JsDos/JsDos';
import { CoreWindow } from '../../../components/Windows';

const DOOM = props => {
  return (
      <CoreWindow
        {...props}
        icon={doomIMG}
        windowTitle='Doom'
        top='24%'
        left='30%'
      >
        <JsDos game='doom' />
      </CoreWindow>
  );
};
export default DOOM;
