import React from 'react';
import WebampContext from "./WebampContext";

const WebampProvider = ({ children }) => {
  const setInstance = (instance) => {
    setState(state => ({
      ...state,
      instance,
    }))
  };

  const triggerPlayTrackIdSignal = (trackId) => {
    setState(state => ({
      ...state,
      playTrackIdSignal: trackId,
    }))
  };

  const clearPlayTrackIdSignal = () => {
    triggerPlayTrackIdSignal(undefined);
  };

  const [state, setState] = React.useState({
    instance: undefined,
    playTrackIdSignal: undefined,
    triggerPlayTrackIdSignal,
    clearPlayTrackIdSignal,
    setInstance,
  });

  return <WebampContext.Provider value={state}>{children}</WebampContext.Provider>;
};

export default WebampProvider;