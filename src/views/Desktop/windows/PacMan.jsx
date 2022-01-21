import React from 'react';
import pacmanIMG from '../../../assets/img/pacman.png';
import JsDos from '../../../components/JsDos/JsDos';
import { CoreWindow } from '../../../components/Windows';

const PacMan = props => {
  return (
      <CoreWindow
        {...props}
        icon={pacmanIMG}
        windowTitle='PacMan'
        top='24%'
        left='30%'
      >
        <JsDos game="pacman" />
      </CoreWindow>
  );
};
export default PacMan;
