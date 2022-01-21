import React from 'react';
import NormalHamsterIMG from '../../assets/img/hamster.gif';
import FannyHamsterIMG from '../../assets/img/fanny/hamster_slow.gif';
import { SettingsContext } from '../../contexts/Settings';

const Hamster = props => {
  const settings = React.useContext(SettingsContext);
  const [hamsterGIF, setHamsterGIF] = React.useState(NormalHamsterIMG);

  React.useEffect(() => {
    setHamsterGIF(settings.store.fannyzone === true ? FannyHamsterIMG : NormalHamsterIMG);
  }, [settings.store.fannyzone]);

  return <img src={hamsterGIF} alt="hamster" style={{ display: 'block', ...props.style }} />;
};

export default Hamster;
