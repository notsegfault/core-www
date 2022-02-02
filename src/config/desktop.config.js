import React from 'react';
import { WindowType } from "./windowTypes.config";
import userkeyIMG from '../assets/img/users-key.png';
import bookIMG from '../assets/img/book.png';
import book2IMG from '../assets/img/book2.png';
import infoIMG from '../assets/img/info.png';
import modemIMG from '../assets/img/modem.png';
import fannyIMG from '../assets/img/fannyIcon.png';
import installerIMG from '../assets/img/installer.png';
import coreburnIMG from '../assets/img/coreburn.png';
/**
 * List of windows that should be open when the website is loaded.
 * Each item property are used as arguments for openWindow.1
 */
export const defaultOpenedWindows = [{
  type: WindowType.MyWallet,
}];

/**
* Can be used to open default modal windows.
* Each item property are used as arguments for openModal.
*/
export const defaultOpenedModals = [];

/**
 * List of registered window type with their associated component.
 */
export const WindowComponents = {};
WindowComponents[WindowType.MyWallet] = {
  component: React.lazy(() => import('../views/Desktop/windows/MyWalletWindow')),
  taskbar: {
    icon: userkeyIMG,
    text: 'Wallet',
    alwaysVisible: true
  }
};
WindowComponents[WindowType.ReadMore] = {
  component: React.lazy(() => import('../views/Desktop/windows/ReadMore')),
  taskbar: {
    icon: bookIMG,
    text: 'Read More',
    alwaysVisible: true
  }
};
WindowComponents[WindowType.Articles] = {
  component: React.lazy(() => import('../views/Desktop/windows/ArticlesWindow')),
  taskbar: {
    icon: book2IMG,
    text: 'Articles',
    alwaysVisible: true
  }
};
WindowComponents[WindowType.Router] = {
  component: React.lazy(() => import('../views/Desktop/windows/Router')),
  taskbar: {
    icon: modemIMG,
    text: 'Router',
    alwaysVisible: true
  }
};
WindowComponents[WindowType.CoreBurned] = {
  component: React.lazy(() => import('../views/Desktop/windows/CoreBurned')),
  taskbar: {
    icon: coreburnIMG,
    text: 'burn.exe',
    alwaysVisible: true
  }
};

WindowComponents[WindowType.CoreBurnedChart] = {
  component: React.lazy(() => import('../views/Desktop/windows/CoreBurnedChart')),
  taskbar: {
    icon: coreburnIMG,
    text: 'burn feed',
    alwaysVisible: false
  }
};

WindowComponents[WindowType.Diablo] = {
  component: React.lazy(() => import('../views/Desktop/windows/Diablo'))
};
WindowComponents[WindowType.Doom] = {
  component: React.lazy(() => import('../views/Desktop/windows/DOOM'))
};
WindowComponents[WindowType.PacMan] = {
  component: React.lazy(() => import('../views/Desktop/windows/PacMan'))
};
WindowComponents[WindowType.Winamp] = {
  component: React.lazy(() => import('../components/Webamp/WebampWrapper'))
};
WindowComponents[WindowType.Minesweeper] = {
  component: React.lazy(() => import('../views/Desktop/windows/Minesweeper'))
};
WindowComponents[WindowType.Solitaire] = {
  component: React.lazy(() => import('../views/Desktop/windows/Solitaire'))
};
WindowComponents[WindowType.CountdownLge1] = {
  component: React.lazy(() => import('../views/Desktop/windows/CountdownLge1'))
};
WindowComponents[WindowType.CountdownLge2] = {
  component: React.lazy(() => import('../views/Desktop/windows/CountdownLge2'))
};
WindowComponents[WindowType.CountdownLge3] = {
  component: React.lazy(() => import('../views/Desktop/windows/CountdownLge3'))
};
WindowComponents[WindowType.Transaction] = {
  component: React.lazy(() => import('../views/Desktop/windows/TransactionWindow'))
};
WindowComponents[WindowType.UniswapInfo] = {
  component: React.lazy(() => import('../views/Desktop/windows/UniswapInfoWindow')),
  taskbar: {
    icon: infoIMG
  }
};
WindowComponents[WindowType.Error] = {
  component: React.lazy(() => import('../views/Desktop/windows/Error'))
};
WindowComponents[WindowType.Dialog] = {
  component: React.lazy(() => import('../views/Desktop/windows/Dialog'))
};
WindowComponents[WindowType.Confirm] = {
  component: React.lazy(() => import('../views/Desktop/windows/Confirm'))
};
WindowComponents[WindowType.Deposit] = {
  component: React.lazy(() => import('../views/Desktop/windows/Deposit'))
};
WindowComponents[WindowType.ArbitrageStrategy] = {
  component: React.lazy(() => import('../views/Desktop/windows/ArbitrageStrategyWindow'))
};
WindowComponents[WindowType.AddStrategy] = {
  component: React.lazy(() => import('../views/Desktop/windows/AddStrategyWindow')),
  taskbar: {
    icon: installerIMG
  }
};
WindowComponents[WindowType.Migrations] = {
  component: React.lazy(() => import('../views/Desktop/windows/Migrations'))
};
WindowComponents[WindowType.FannyMain] = {
  component: React.lazy(() => import('../views/Desktop/windows/fanny/FannyMainWindow')),
  taskbar: {
    icon: fannyIMG
  }
};
WindowComponents[WindowType.FannyShippingForm] = {
  component: React.lazy(() => import('../views/Desktop/windows/fanny/FannyShippingFormWindow'))
};
WindowComponents[WindowType.FannyReadme] = {
  component: React.lazy(() => import('../views/Desktop/windows/fanny/FannyReadmeWindow'))
};
WindowComponents[WindowType.FannyOrders] = {
  component: React.lazy(() => import('../views/Desktop/windows/fanny/FannyOrdersWindow'))
};