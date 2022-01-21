import React from "react";
import { isMobile } from "react-device-detect";
import Webamp from "webamp";
import WebampConfig from "../../config/webamp.config";
import { WindowType } from "../../config/windowTypes.config";
import { WebampContext } from "../../contexts/Webamp";
import { WindowsContext } from "../../contexts/Windows";
import { getDefaultWindowNameByType } from "../../contexts/Windows/WindowsProvider";

const windowName = getDefaultWindowNameByType(WindowType.Winamp);

const config = {
  zIndex: 999999,
  initialTracks: WebampConfig.tracks,
  __butterchurnOptions: {
    importButterchurn: () => {
      // Only load butterchurn when music starts playing to reduce initial page load
      return import("butterchurn");
    },
    getPresets: async () => {
      // Load presets from preset URL mapping on demand as they are used
      const resp = await fetch(
        "https://unpkg.com/butterchurn-presets-weekly@0.0.2/weeks/week1/presets.json"
      );
      const namesToPresetUrls = await resp.json();
      return Object.keys(namesToPresetUrls).map((name) => {
        return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
      });
    },
    butterchurnOpen: true,
  },
  __initialWindowLayout: {
    main: { position: { x: 0, y: 0 } },
    equalizer: { position: { x: 0, y: 116 } },
    playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
    milkdrop: { position: { x: 275, y: 0 }, size: [7, 12] },
  },
  availableSkins: [
    { url: 'https://ia800905.us.archive.org/15/items/winampskin_Pika_Amp/Pika_Amp.wsz', name: 'Pika' },
    { url: 'https://ia802803.us.archive.org/9/items/winampskin_Super_Mario_Bros_Skin_Remix/Super_Mario_Bros_-_Skin_Remix.wsz', name: 'Super Mario Bros' },
    { url: 'https://ia800906.us.archive.org/9/items/winampskin_the_matrixAMP/the_matrixAMP.wsz', name: 'The Matrix' }
  ]
};

// Remove milkdrop on mobile since it doesn't work well on some devices.
if (isMobile) {
  delete config.__initialWindowLayout.milkdrop;
  delete config.__butterchurnOptions;
}

const WebampWrapper = () => {
  const webampContext = React.useContext(WebampContext);
  const windowsContext = React.useContext(WindowsContext);

  const [divRef, setDivRef] = React.useState(null);

  const webamp = React.useRef();
  const mainWindowObserver = React.useRef();

  const onClick = () => {
    windowsContext.setActive(windowName);
  }

  const updateZIndex = () => {
    if (windowsContext.isVisible(windowName)) {
      document.getElementById('webamp').style.zIndex = windowsContext.getWindowByName(windowName).zIndex;
    }
  };

  // Workaround since Webamp doesn't support playing a specific track: We create a track list with
  // the track that is meant to be played at top position.
  const getTracksWithGivenIdFirst = (trackId) => {
    let tracks = [...WebampConfig.tracks];
    const trackIndex = tracks.findIndex((value) => value.id === trackId);
    const trackToPlay = tracks[trackIndex];
    delete tracks[trackIndex];

    return [trackToPlay, ...tracks].filter(i => i);
  };

  const onMainWindowAttributeModified = (mutationsList) => {
    for (var mutation of mutationsList) {
      if (mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target.classList.contains('selected')) {

          onClick();
      }
    }
  };

  React.useEffect(() => updateZIndex, [windowsContext.activeWindow]);

  React.useEffect(() => {
    if (webampContext.playTrackIdSignal && webamp.current) {
      const tracks = getTracksWithGivenIdFirst(webampContext.playTrackIdSignal);
      webamp.current.setTracksToPlay(tracks);
      webamp.current.play();
      webampContext.clearPlayTrackIdSignal();
    }
  }, [webampContext.playTrackIdSignal, webamp.current]);

  React.useEffect(() => {
    if (divRef == null) {
      return;
    }

    webamp.current = new Webamp(config);
    webamp.current.renderWhenReady(divRef).then(() => {
      document.getElementById('webamp').addEventListener('click', () => { onClick() });
      windowsContext.setActive(windowName);
      updateZIndex();
      webampContext.setInstance(webamp.current);

      // Since we don't have any onDragStart/onFocus event, listen to the main-window
      // for the 'selectable' attribute.
      const mainWindow = document.querySelector('#webamp #main-window');
      if (mainWindow) {
        mainWindowObserver.current = new MutationObserver(onMainWindowAttributeModified);
        mainWindowObserver.current.observe(
          mainWindow, {
          attributes: true,
          childList: false
        });
      } else {
        console.error('Failed to retrieve the main-window element from Webamp.');
      }
    })

    webamp.current.onClose(() => {
      windowsContext.closeWindow(windowName);
    })

    return () => {
      mainWindowObserver.current && mainWindowObserver.current.disconnect();
      webamp.current && webamp.current.dispose();
    };
  }, [divRef]);

  // Check if Winamp is supported in this browser
  if (!Webamp.browserIsSupported()) {
    return <div>Not supported</div>;
  }

  return <div ref={setDivRef} />;
}


export default WebampWrapper;
