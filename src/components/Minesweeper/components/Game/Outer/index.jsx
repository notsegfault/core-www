import React from 'react';
import Top from './Top';
import Bottom from './Bottom';
import styles from './styles.css';

const Outer = (props) => (
  <div className={'outer'}>
    <Top game={props.game} />
    <Bottom game={props.game} />
  </div>
);

export default Outer;
