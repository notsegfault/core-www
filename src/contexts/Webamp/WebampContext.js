import React from 'react';

const WebampContext = React.createContext({
    instance: undefined,
    playTrackIdSignal: undefined,
    clearPlayTrackIdSignal: () => {},
    triggerPlayTrackIdSignal: (_trackId) => {},
    setInstance: (_instance) => {}
});

export default WebampContext;
