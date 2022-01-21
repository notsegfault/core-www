import React from 'react';
import styles from './styles.css';
import styleForStatus from './styleForStatus';

class Status extends React.Component {
  constructor(props) {
    super(props);
    const game = props.game;
    console.log(game.state())
    game.onGameStateChange((newState) => {
      this.setState({ style: styleForStatus(newState) });
    });
    this.onMouseDown = (event) => {
      event.preventDefault();
      this.setState({ style: 'alivePressed' });
    };
    this.onMouseUp = (event) => {
      event.preventDefault();
      this.setState({ style: styleForStatus(game.state()) });
      game.reset();
    };
    this.state = {
      style: styleForStatus(game.state())
    };
  }

  render() {
    return (
      <span onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onTouchStart={this.onMouseDown} onTouchEnd={this.onMouseUp} className={`status ${this.state.style}`}>
      </span>
    );
  }
}

export default Status;
