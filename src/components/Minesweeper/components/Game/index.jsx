import React from 'react';
import Outer from './Outer';
import styled from 'styled-components'

class Game extends React.Component {
  getChildContext() {
    return { game: this.props.game };
  }

  render() {
    const cols = this.props.game.dimensions[1];
    const width = cols * 16 + 20;
    return (
      <Mineswepper className="minesweeper" style={{ width: width }}>
        <Outer game={this.props.game} />
      </Mineswepper>
    );
  }
}

const Mineswepper = styled.div`
  margin: auto auto;
  top: 4px;
  border-width: 1px;
  border-style: outset;
  background-color: #BBB;
  padding: 1px;
`

export default Game;
