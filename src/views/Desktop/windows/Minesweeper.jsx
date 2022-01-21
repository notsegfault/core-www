import Minesweeper from '../../../components/Minesweeper';
import React from 'react';
import minesweeperIMG from '../../../assets/img/minesweeper.png';
import { CoreWindow } from '../../../components/Windows';

const MinesweeperWindow = props => {
  return (
      <CoreWindow
        {...props}
        icon={minesweeperIMG}
        windowTitle='Minesweeper'
        top='20%'
        left='25%'
        width='290px'
      >
        <Minesweeper />
      </CoreWindow>
  );
};
export default MinesweeperWindow;
