import { CoreWindow } from '../../../components/Windows';
import React from 'react';
import solitaireIMG from '../../../assets/img/solitaire.png';
import Iframe from 'react-iframe';

const SolitaireWindow = props => {
  return (
    <CoreWindow
      {...props}
      icon={solitaireIMG}
      windowTitle='Solitaire'
      top='14%'
      left='30%'
    >
      <div style={{ overflow: 'hidden' }} id="solitaire-container">
        <Iframe
          url="https://js-solitaire-beta.vercel.app/"
          id="solitaire-iframe"
        />
      </div>
    </CoreWindow>
  );
};
export default SolitaireWindow;
