import React from 'react';
import Lcd from '../../../Lcd';
import Status from './Status';
import styles from './styles.css';

class Top extends React.Component {
  constructor(props) {
    super(props);
    const game = props.game;
    game.onRemainingMineCountChange(
      (count) => { this.setState({ mineCount: count }); }
    );
    game.onTimerChange(
      (ms) => { this.setState({ seconds: Math.floor(ms / 1000) }); }
    );

    this.state = {
      mineCount: game.remainingMineCount(),
      seconds: 0
    };
  }

  render() {
    const state = this.state;

    return (
      <div className={'top'}>
        <Lcd number={state.mineCount} className={'minesRemaining'} />
        <Status game={this.props.game} />
        <Lcd number={state.seconds} className={'timer'} />
      </div>
    );
  }
}



export default Top;
