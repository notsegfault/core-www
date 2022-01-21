import React from 'react';
import styled from 'styled-components';
import { AppBar, Toolbar, Button, List, ListItem, Divider, Bar } from 'react95';
import logoIMG from '../../assets/img/start-menu-logo.png';
import desktopIMG from '../../assets/img/desktop.png';

import useWallet from 'use-wallet';
import { WindowsContext } from '../../contexts/Windows';
import { WindowType } from '../../config/windowTypes.config';
import menuItems from '../../config/menu.config';
import { getDefaultWindowNameByType } from '../../contexts/Windows/WindowsProvider';
import { WindowComponents } from '../../config/desktop.config';

const ShortcutToolbarBarStart = styled(Bar)`
  border-top: none;
  border-left: none;
  border-bottom: none;
  margin-left: 5px;
  margin-right: 2px;
  position: relative;
  top: 3px;
`;
const ShortcutToolbarBarEnd = styled(Bar)`
  border-top: none;
  border-left: none;
  border-bottom: none;
  margin-right: 6px;
  position: relative;
  top: 3px;
  left: 1px;
`;

const ShortcutButton = styled(Button)`
  padding: 3px;
  position: relative;
  top: -1px;
  left: 1px;
`;

const StyledApplicationButton = styled(Button)`
  margin-top: 1px;
  margin-bottom: 1px;
  margin-left: 2px;
  width: 10rem;

  div {
    display: flex;
    justify-content: flex-start;
    width: 100%
  }

  div > span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-left: 0.2em;
    position: relative;
    top: 1px;
  }

  img {
    height: 20px;
    margin-right: 4px;
  }

  @media only screen and (max-width: 767px) {
    width: 42px !important;
    div > span {
      display: none;
    }
  }
`;

const ToolbarItems = styled.div`
  display: flex;
`;

const ShortcutToolbar = styled.div`
  @media only screen and (max-width: 767px) {
    display: none;
  }
`;

const ApplicationBar = styled.div`;
  overflow-x: auto;
  display: inline-flex;
  top: -1px;
  position: relative;
`;

const defaultApplicationButtons = Object.keys(WindowComponents).map(windowType => {
  const item = WindowComponents[windowType];
  if (item.taskbar?.alwaysVisible) {
    return {
      windowName: getDefaultWindowNameByType(windowType),
      windowType,
      icon: item.taskbar.icon,
      text: item.taskbar.text
    }
  }
  return false;
}).filter(item => item);

const ApplicationButton = ({ windowName, windowType, icon, text, windowProps }) => {
  const windowsContext = React.useContext(WindowsContext);

  return <StyledApplicationButton
    onClick={e => windowsContext.openWindow(windowType, e, windowProps, { windowName })}
    active={windowsContext.activeWindow?.props?.windowName === windowName}>
    <div>
      <img src={icon} alt="icon" />
      <span>{text}</span>
    </div>
  </StyledApplicationButton>
};

const TopBar = () => {
  const [open, setOpen] = React.useState(false);
  const windowsContext = React.useContext(WindowsContext);

  const wallet = useWallet();

  const isStartMenuDescendant = child => {
    const menuItem = document.getElementById('start-menu');
    const startButton = document.getElementById('start-button');

    if (child === startButton) {
      return true;
    }

    let node = child;
    while (node != null) {
      if (node === menuItem) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const onBodyMouseUp = React.useRef(event => {
    if (!isStartMenuDescendant(event.target)) {
      setOpen(false);
    }
  });

  React.useEffect(() => {
    if (open) {
      window.addEventListener('mouseup', onBodyMouseUp.current);
    } else {
      window.removeEventListener('mouseup', onBodyMouseUp.current);
    }
  }, [open]);

  const renderMenu = () => {
    if (!open) return <></>;

    return <List
      id="start-menu"
      onClick={() => setOpen(false)}
    >
      {menuItems.filter(m => m.visible).map((menuItem, index) => (
        <ListItem key={`menu-item-${index}`} disabled={!menuItem.enabled} onClick={_ => menuItem.windowType && windowsContext.openWindow(menuItem.windowType)}>
          <img style={{ opacity: menuItem.enabled ? 1 : 0.5 }} alt="menu-item-icon" src={menuItem.icon} width={24} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              lineHeight: '0.9rem',
            }}>
            <span style={{ fontSize: '1rem', textAlign: 'end' }}>{menuItem.subLabel}</span>
            <span>{menuItem.label}</span>
          </div>
        </ListItem>
      ))}
      <Divider />
      <ListItem disabled={!wallet.account} onClick={() => wallet.reset()}>
        <span role="img" aria-label="🔙"> 🔙 </span>
        Disconnect wallet
      </ListItem>
    </List>
  };

  const renderApplicationButtons = () => {
    const applicationButtons = Object.keys(windowsContext.windows).map(windowName => {
      const window = windowsContext.windows[windowName];
      const windowType = window.type;
      const windowTitle = window.props.windowTitle;
      const taskbarConfig = WindowComponents[windowType].taskbar;

      if (taskbarConfig && !taskbarConfig.alwaysVisible) {
        return {
          windowName,
          windowType,
          icon: taskbarConfig.icon,
          text: windowTitle || taskbarConfig.text,
          windowProps: window.props
        }
      }
      return false;
    }).filter(item => item);

    return <ApplicationBar>
      {defaultApplicationButtons.map((props, index) => {
        return <ApplicationButton key={`app-button-${index}`} {...props} />
      })}
      {applicationButtons.map((props, index) => {
        return <ApplicationButton key={`app-button-${index}`} {...props} />
      })}
    </ApplicationBar>
  };

  const renderShortcutBar = () => {
    return <ShortcutToolbar>
      <ShortcutToolbarBarStart variant='menu' size={30} />
      <ShortcutButton variant='menu' onClick={(e) => { windowsContext.closeAllWindows([WindowType.Winamp]) }}>
        <img src={desktopIMG} alt="desktop" style={{ height: '23px' }} />
      </ShortcutButton>
      <ShortcutToolbarBarEnd variant='menu' size={30} />
    </ShortcutToolbar>
  };

  return (
    <>
      <AppBar id="appbar">
        <Toolbar>
          <ToolbarItems>
            <Button id="start-button" onClick={() => setOpen(!open)} active={open} style={{ fontWeight: 'bold' }}>
              <img src={logoIMG} alt="react95 logo" style={{ height: '20px', marginRight: 4 }} />
            Start
          </Button>
          {renderShortcutBar()}
          {renderApplicationButtons()}
          </ToolbarItems>
        </Toolbar>
      </AppBar>
      {renderMenu()}
    </>
  );
};

export default TopBar;
