import { WindowType } from './windowTypes.config';
import { isMobile } from "react-device-detect";
import bookIMG from '../assets/img/book.png';
import userkeyIMG from '../assets/img/users-key.png';
import defragIMG from '../assets/img/defrag.png';
import governanceIMG from '../assets/img/notepad-users.png';
import minesweeperIMG from '../assets/img/minesweeper.png';
import doomIMG from '../assets/img/doom.png';
import pacmanIMG from '../assets/img/pacman.png';
import winampIMG from '../assets/img/winamp.png';
import diabloIMG from '../assets/img/diablo.png';
import book2IMG from '../assets/img/book2.png';
import solitaireIMG from '../assets/img/solitaire.png';
import modemIMG from '../assets/img/modem.png';

const menuItems = [{
  icon: solitaireIMG,
  label: 'Solitaire',
  windowType: WindowType.Solitaire,
  visible: !isMobile,
  enabled: true
}, {
  icon: minesweeperIMG,
  label: 'Minesweeper',
  windowType: WindowType.Minesweeper,
  visible: !isMobile,
  enabled: true
}, {
  icon: doomIMG,
  label: 'DOOM',
  windowType: WindowType.Doom,
  visible: !isMobile,
  enabled: true
}, {
  icon: pacmanIMG,
  label: 'PacMan',
  windowType: WindowType.PacMan,
  visible: !isMobile,
  enabled: true
}, {
  icon: diabloIMG,
  label: 'Diablo 1',
  windowType: WindowType.Diablo,
  visible: !isMobile,
  enabled: true
}, {
  icon: winampIMG,
  label: 'Winamp',
  windowType: WindowType.Winamp,
  visible: true,
  enabled: true
}, {
  icon: userkeyIMG,
  label: 'My wallet',
  windowType: WindowType.MyWallet,
  visible: true,
  enabled: true
}, {
  icon: bookIMG,
  label: 'Read more',
  windowType: WindowType.ReadMore,
  visible: true,
  enabled: true
}, {
  icon: book2IMG,
  label: 'Articles',
  windowType: WindowType.Articles,
  visible: true,
  enabled: true
}, {
  icon: modemIMG,
  label: 'Router',
  windowType: WindowType.Router,
  visible: true,
  enabled: true
}, {
  icon: defragIMG,
  label: 'Liquidity Event #3',
  subLabel: 'ended',
  windowType: WindowType.CountdownLge3,
  visible: true,
  enabled: true
}, {
  icon: defragIMG,
  label: 'Liquidity Event #2',
  subLabel: 'ended',
  windowType: WindowType.CountdownLge2,
  visible: true,
  enabled: true
}, {
  icon: defragIMG,
  label: 'Liquidity Event #1',
  subLabel: 'ended',
  windowType: WindowType.CountdownLge1,
  visible: true,
  enabled: true
}, {
  icon: governanceIMG,
  label: 'Governance',
  subLabel: 'Coming soon',
  visible: true,
  enabled: false
}];

export default menuItems;