import React from 'react';
import styled from 'styled-components';
import Draggable from 'react-draggable';
import { Window, WindowHeader, Button } from 'react95';
import { WindowsContext } from '../../contexts/Windows';
import { isMobile } from 'react-device-detect';

export const changePointer = pointer => {
  document.body.style.cursor = pointer;
};

const DEFAULT_TOP_POSITION = '10%';
const DEFAULT_LEFT_POSITION = '10%';

const CloseButton = styled(Button)`
  margin-top: 0.2rem;
  .close-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: -1px;
    margin-top: -1px;
    transform: rotateZ(45deg);
    position: relative;
    &:before,
    &:after {
      content: '';
      position: absolute;
      background: #000;
    }
    &:before {
      height: 100%;
      width: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &:after {
      height: 3px;
      width: 100%;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
`;

const StyledWindow = styled(Window)`
  position: absolute;
  top: ${props => props.centerizedPosition.top || props.top || DEFAULT_TOP_POSITION};
  left: ${props => props.centerizedPosition.left || props.left || DEFAULT_LEFT_POSITION};
  min-width: ${props => props.minWidth};
  max-width: ${props => props.maxWidth};
  width: ${props => props.width};
  min-height: ${props => props.minHeight};
  max-height: ${props => props.maxHeight};
  height: ${props => props.height};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  
  @media only screen and (max-width: 767px) {
    position: fixed !important;
    top: 0px !important;
    left: 0px !important;
    width: 100%;
    min-width: 100% ;
    max-width: 100%;
    margin: 0px;
    padding: 0px;
    height: calc(100% - var(--app-bar-height));
    max-height: 100%;
    box-shadow: none;
  }
`;

const CoreWindow = ({ centerize, ...props }) => {
  const windowsContext = React.useContext(WindowsContext);

  if (!(props.windowName in windowsContext.windows)) {
    throw new Error(`${props.windowName || 'The window'} does not exist in WindowContext windows' list. ` +
      `Is {...props} added to the CoreWindow type? ` +
      `Or, is  the necessary 'windowName' been provided to CoreWindow?`);
  }

  const [centerizedPosition, setCenterizedPosition] = React.useState({
    top: undefined,
    left: undefined
  });

  const [visible, setVisible] = React.useState(isMobile || !centerize);

  const handleDisabled = e => {
    if (props.disabled === true) {
      e.stopPropagation();
      e.preventDefault();
      return true;
    }

    return false;
  }

  const onDragStart = e => {
    if (handleDisabled(e)) return false;

    let preventDefault = false;
    if (props.onDragStart) {
      preventDefault = props.onDragStart(e);
    }

    if (!preventDefault) {
      changePointer('grabbing');
      windowsContext.setActive(props.windowName, e)
    }
  };

  const onSetActive = e => {
    if (handleDisabled(e)) return false;
    windowsContext.setActive(props.windowName, e);
  };

  const onCloseButton = e => {
    if (handleDisabled(e)) return false;
    windowsContext.closeWindow(props.windowName, e);
  };

  /*
   * Now that the window has been instantied and that we know more about it,
   * we can attach additionnal properties to the existing window instance
   * properties.
   */
  React.useEffect(() => {
    windowsContext.addAdditionnalProperties(props.windowName, {
      windowTitle: props.windowTitle
    })
  }, []);

  const isVisible = () => {
    return visible && ((props.visible === undefined) || !!props.visible);
  };

  /**
   * Automatic desktop centering logic.
   */
  React.useEffect(() => {
    if (!Array.isArray(centerize) || !windowsContext.desktopSize || isMobile) {
      return;
    }

    const [centerX, centerY] = centerize;
    const width = centerX && parseInt(props.width);
    const height = centerY && parseInt(props.height);

    if (width) {
      const left = (width && (windowsContext.desktopSize.width - width) / 2) || props.left;
      setCenterizedPosition(position => ({
        ...position,
        left: ((left / windowsContext.desktopSize.width) * 100) + '%',
      }));
    }

    if (height) {
      const top = (height && (windowsContext.desktopSize.height - height) / 2) || props.top;
      setCenterizedPosition(position => ({
        ...position,
        top: ((top / windowsContext.desktopSize.height) * 100) + '%',
      }));
    }

    setVisible(true);

  }, [windowsContext.desktopSize, centerize, props.width, props.height]);

  return (
    <Draggable
      bounds="#desktop"
      handle=".window-header"
      cancel=".window-header > button"
      scale={windowsContext.zoom}
      onStart={onDragStart}
      onStop={() => changePointer('auto')}
      defaultPosition={props.defaultPosition}
    >
      <StyledWindow
        {...props}
        centerizedPosition={centerizedPosition}
        className={`window ${props.className || ''}`}
        style={{
          zIndex: windowsContext.getWindowByName(props.windowName).zIndex,
          visibility: isVisible() ? 'visible' : 'hidden'
        }}
        onClick={onSetActive}
      >
        <WindowHeader
          className="window-header"
          active={windowsContext.isWindowActiveByName(props.windowName)}
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {props.icon && <img alt="window-icon" src={props.icon} height={24} style={{ marginRight: '5px' }} />}
            {props.windowTitle}
          </span>
          <CloseButton onClick={onCloseButton}>
            <span className="close-icon" />
          </CloseButton>
        </WindowHeader>
        {props.children}
      </StyledWindow>
    </Draggable>
  );
};

export default CoreWindow;
