import React from 'react';
import { isMobile, withOrientationChange } from "react-device-detect";
import WindowsContext from './WindowsContext';
import { WindowType } from '../../config/windowTypes.config';
import { APP_VERSION } from '../../yam/lib/constants';
import { defaultOpenedModals, defaultOpenedWindows } from '../../config/desktop.config';

const ZOOM_SCALING_ENABLED = true;
const MIN_ZOOM = isMobile ? 0.3 : 0.621;
const MAX_ZOOM = 1.0;
const MINIMUM_START_SCALE_WIDTH = 767;
const START_SCALE_WIDTH = 1280;
const START_SCALE_HEIGHT = 900;

export const DESKTOP_ZINDEX = 0;
export const MILKDROP_ZINDEX = -1;
export const BASE_WINDOW_ZINDEX = 100;
export const ZINDEX_DISTANCE_BETWEEN_WINDOWS = 10;
export const ERROR_WINDOWNAME = 'error';
export const DIALOG_WINDOWNAME = 'dialog';
export const CONFIRM_WINDOWNAME = 'confirm';

export const ErrorType = {
  Warning: 'warning',
  Fatal: 'fatal',
};

export const getDefaultWindowNameByType = (type) => type.toString();

const WindowsProvider = props => {
  const { isLandscape, children } = props

  /**
   * Holds the current windows states.
   *
   * When a new window is opened, an entry is inserted in this map.
   * Each window has a unique key which serves has its unique instance identifier.
   *
   * This way, when openWindow or openModal is called using an already window name, if there
   * is a window of that named already existing in the map, it's going to be reused but using
   * potential new provided props.
   *
   * No window pre-registering is necessary and created on fly using an instance name, tagname
   * and props.
   */
  const windows = {};

  let activeWindow = undefined;
  let activeWindowNum = 0;

  const updateZoomLevel = (auto = true) => {
    let zoom = 1;

    if (auto) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width >= MINIMUM_START_SCALE_WIDTH) {
        const scale = Math.min(width / START_SCALE_WIDTH, height / START_SCALE_HEIGHT);
        zoom = Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM));
      }
    }

    setState(state => ({ ...state, zoom }));
    if (zoom === 1) {
      document.getElementsByTagName('html')[0].style.removeProperty('zoom');
    } else {
      document.getElementsByTagName('html')[0].style.setProperty('zoom', zoom);
    }
  };


  React.useEffect(() => {
    if (ZOOM_SCALING_ENABLED && !isMobile) {
      updateZoomLevel();
      window.addEventListener('resize', updateZoomLevel);
    }

    defaultOpenedWindows.forEach(def => openWindow(def.type, false, def.props))
    defaultOpenedModals.forEach(def => openModal(def.type, false, def.props))
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      updateZoomLevel(isLandscape);
    }
  }, [isLandscape]);

  /**
   * Recorder the windows to have inline z-indexes and make sure
   * modals are in front of normal windows and in front of
   * each other modals.
   */
  const reorderWindowsZindexes = () => {
    let zIndex = BASE_WINDOW_ZINDEX - 1;

    const windowsAsArray = Object.keys(windows).map(key => windows[key])
    activeWindowNum = windowsAsArray.length;

    // Reorder non-modal windows first
    windowsAsArray
      .filter(window => !window.modal)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(window => {
        zIndex += ZINDEX_DISTANCE_BETWEEN_WINDOWS;
        window.zIndex = zIndex
      })

    // Reorder modal windows
    windowsAsArray
      .filter(window => window.modal)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(window => {
        zIndex += ZINDEX_DISTANCE_BETWEEN_WINDOWS;
        window.zIndex = zIndex
      })
  };

  const getFrontWindow = () => {
    const windowsAsArray = Object.keys(windows).map(key => windows[key])

    if (windowsAsArray.length > 0) {
      windowsAsArray.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      return windowsAsArray[windowsAsArray.length - 1];
    }

    return null;
  };


  const isModal = windowName => {
    return !!((windowName in windows) && windows[windowName].modal === true);
  };

  const isVisible = windowName => {
    return (windowName in windows);
  };

  const getWindowByName = windowName => {
    return windows[windowName];
  }

  const hasModal = () => {
    return Object.keys(windows)
      .map(key => windows[key])
      .filter(window => window.modal === true).length > 0;
  };

  const getWindowsByType = (type) => {
    return Object.keys(windows)
      .map(key => windows[key])
      .filter(window => window.type === type);
  }

  const isWindowBehindFrontWindow = (window, frontWindow) => {
    const windowZIndex = window.zIndex || BASE_WINDOW_ZINDEX;
    return frontWindow && windowZIndex <= frontWindow.zIndex;
  }

  const validateOpenWindowArguments = (name, type, event, props) => {
    if (typeof name !== 'string')
      throw new Error('a window name must be provided as a string');
    if (typeof type !== 'string')
      throw new Error('a type name must be provided as a string');
    if (props && !(props instanceof Object))
      throw new Error('props argument must be an object');
    if (event && !(event instanceof Object))
      throw new Error('event argument must be an object');
  };

  const ensureWindowInstanceExist = (windowName, type, props) => {
    if (!(windowName in windows)) {
      windows[windowName] = {
        type,
        props: {
          ...props,
          windowName
        }
      };
    }
  };

  const openWindow = (type, event, props = {}, options = {}) => {
    options.windowName = options.windowName || type.toString();
    options.reload = options.reload || false;
    const { windowName, reload } = options;

    // Prevent opening more non-modal window when a modal is current displayed
    if (hasModal()) return;

    if (reload) {
      closeWindow(windowName, event);
    }

    validateOpenWindowArguments(windowName, type, event, props);
    ensureWindowInstanceExist(windowName, type, props);

    if (event) event.stopPropagation();
    moveToFront(windowName, true);
  };

  const _openModal = (windowName, type, event, props = {}) => {
    validateOpenWindowArguments(windowName, type, event, props);
    ensureWindowInstanceExist(windowName, type, props);

    if (event) event.stopPropagation();

    windows[windowName].modal = true;
    moveToFront(windowName, true);
  };

  const openModal = (type, event, props = {}, options = { windowName: type.toString() }) => {
    const { windowName } = options;

    return new Promise(resolve => {
      _openModal(windowName, type, event, {
        ...props,
        onClose: () => resolve(true)
      });
    });
  };

  const showError = (title, errorMessage, errorType, errorExplaination, additional = null, event) => {
    return new Promise(resolve => {
      _openModal(ERROR_WINDOWNAME, WindowType.Error, event, {
        title,
        errorMessage,
        errorType,
        errorExplaination,
        additional,
        onOk: () => resolve(true),
        onClose: () => resolve(false),
      });
    });
  };

  const showConfirm = (title, content, event, props) => {
    return new Promise(resolve => {
      _openModal(CONFIRM_WINDOWNAME, WindowType.Confirm, event, {
        title,
        content,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        onClose: () => resolve(false),
        ...props
      });
    });
  };

  const showDialog = (title, content, buttonContent, event, props) => {
    return new Promise(resolve => {
      _openModal(DIALOG_WINDOWNAME, WindowType.Dialog, event, {
        title,
        content,
        onClose: () => resolve(true),
        buttonContent,
        ...props
      });
    });
  };

  const setActive = (windowName, event) => {
    if (event) event.stopPropagation();

    // Prevent focusing non-modal windows when a modal is shown.
    if (hasModal() && !isModal(windowName)) return;

    moveToFront(windowName, false);

    if (activeWindow.props?.onSetActive) {
      activeWindow.props.onSetActive(event);
    };
  };

  const closeWindow = (windowName, event) => {
    if (event) event.stopPropagation();

    const window = windows[windowName];
    if (window?.props?.onClose) {
      window.props.onClose(event);
    };

    delete windows[windowName];
    reorderWindowsZindexes();

    activeWindow = getFrontWindow();

    setState(state => ({
      ...state,
      windows,
      activeWindow,
      activeWindowNum
    }));
  };

  const closeAllWindows = (exceptions = []) => {
    if (exceptions && !Array.isArray(exceptions)) {
      throw new Error('exceptions argument must be an array');
    }

    Object.keys(windows).map(windowName => {
      if (!exceptions.includes(windows[windowName].type)) {
        closeWindow(windowName);
      }
    });
  };

  const closeError = (event) => {
    closeWindow(ERROR_WINDOWNAME, event);
  };

  const closeConfirm = (event) => {
    closeWindow(CONFIRM_WINDOWNAME, event);
  };

  const closeDialog = (event) => {
    closeWindow(DIALOG_WINDOWNAME, event);
  };

  const moveToFront = (windowName, newWindow = false) => {
    const frontWindow = getFrontWindow()

    if (!(windowName in windows) || !frontWindow) {
      let baseMessage = `The window name '${windowName}' does not exist. `

      if (!frontWindow) {
        baseMessage = `No frontWindow to focus on. `
      }

      console.error(baseMessage +
        `This can happen when a window is trying to get the focus when it has just been closed. ` +
        `Try to pass the Event argument to the closeWindow method to stop the event propagation. ` +
        `Example: 'onClick(e) => windowsContext.closeWindow('window_name', e)`);
      return;
    }

    // When moving an already opened window, to front,
    // avoid moving in front of already opened modals.
    if (!newWindow && frontWindow.modal) {
      return;
    }

    let zIndex = BASE_WINDOW_ZINDEX;

    if (isWindowBehindFrontWindow(windows[windowName], frontWindow)) {
      zIndex = frontWindow.zIndex + ZINDEX_DISTANCE_BETWEEN_WINDOWS;
    }

    windows[windowName].zIndex = zIndex;
    reorderWindowsZindexes();
    activeWindow = windows[windowName];

    setState(state => ({
      ...state,
      windows,
      activeWindow,
      activeWindowNum
    }));
  }

  const addAdditionnalProperties = (windowName, props) => {
    windows[windowName].props = {
      ...windows[windowName].props,
      ...props
    }
    setState(state => ({
      ...state,
      windows
    }));
  };

  const isWindowActiveByName = name => {
    return activeWindow?.props?.windowName === name;
  };

  const updateDesktopSize = (width, height) => {
    setState(state => ({
      ...state,
      desktopSize: {
        width, height
      }
    }));
  };

  const [state, setState] = React.useState({
    windows,
    activeWindow,
    activeWindowNum,
    zoom: MAX_ZOOM,
    desktopSize: undefined,
    openWindow,
    openModal,
    isModal,
    isVisible,
    getWindowByName,
    hasModal,
    closeWindow,
    setActive,
    showError,
    showDialog,
    showConfirm,
    closeError,
    closeConfirm,
    closeDialog,
    closeAllWindows,
    getWindowsByType,
    addAdditionnalProperties,
    isWindowActiveByName,
    getFrontWindow,
    updateDesktopSize
  });

  return <WindowsContext.Provider value={state}>{children}</WindowsContext.Provider>;
};

export default withOrientationChange(WindowsProvider);
