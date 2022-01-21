import speakerIMG from '../../assets/img/speaker.png';
import {
    Button
} from 'react95';
import React from 'react';
import { WindowType } from '../../config/windowTypes.config';
import { WindowsContext } from '../../contexts/Windows';
import { WebampContext } from '../../contexts/Webamp';

const WebampPlayTrackButton = ({ trackId, text }) => {
    const windowsContext = React.useContext(WindowsContext);
    const webampContext = React.useContext(WebampContext);

    return <Button variant='menu' onClick={(e) => {
        windowsContext.openWindow(WindowType.Winamp, e);
        webampContext.triggerPlayTrackIdSignal(trackId);
    }}>
        <img alt="listen" src={speakerIMG} width="24" height="24" style={{ paddingRight: '0.5rem' }} /> {text}
    </Button>
};

export default WebampPlayTrackButton;
