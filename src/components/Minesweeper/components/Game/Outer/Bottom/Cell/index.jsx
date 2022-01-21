import React from 'react';
import styles from './styles.css';
import styleForCellState from './styleForCellState';
import { isEqual } from 'lodash';

const now = () => (new Date()).getTime();

class Cell extends React.Component {
  constructor(props) {
    super(props);
    props.game.onCellStateChange(
      (cell, state) => {
        if (isEqual(cell, props.position)) {
          const style = styleForCellState(state);
          this.setState({ style: style });
        }
      }
    );
    this.onMouseDown = (event) => {
      this.setState({ mouseStartPosition: props.position });
      event.preventDefault();
    };
    this.onMouseUp = (event) => {
      const rightMouseButton = 2;
      if (event.button !== rightMouseButton && props.position === this.state.mouseStartPosition) {
        props.game.reveal(props.position);
      }
      event.preventDefault();
    };
    this.onDoubleClick = (event) => {
      props.game.chord(props.position);
      event.preventDefault();
    };
    this.onRightClick = (event) => {
      props.game.mark(props.position);
      event.preventDefault();
    };
    this.onTouchStart = (event) => {
      this.setState({ touchStart: now(), touchStartPosition: props.position });
      event.preventDefault();
    };
    this.onTouchEnd = (event) => {
      if (props.position === this.state.touchStartPosition) {
        const duration = now() - this.state.touchStart;
        if (duration < 500) {
          props.game.reveal(props.position);
        } else {
          props.game.mark(props.position);
        }
      }
      event.preventDefault();
    };
    this.onTouchMove = (event) => {
      event.preventDefault();
    };

    this.state = { style: 'unknown' };
  }


  render() {
    const className = `field ${this.state.style}`;
    return <td onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onDoubleClick={this.onDoubleClick} onContextMenu={this.onRightClick} onTouchEnd={this.onTouchEnd} onTouchStart={this.onTouchStart} className={className} />;
  }
}

export default Cell;
