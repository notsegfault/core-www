import React from 'react';
import styles from './styles.css';
import Cell from './Cell';
import { times } from 'lodash';
import styled from 'styled-components';

class Bottom extends React.Component {
  render() {
    const game = this.props.game;
    const [row_count, column_count] = game.dimensions;

    const rows = times(row_count, (row) => {
      const cols = times(column_count, (col) => {
        return <Cell key={`${row}.${col}`} game={game} position={[row, col]} />;
      });
      return <tr key={row}>{cols}</tr>;
    });

    return (
      <div className={'bottom'}>
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}




export default Bottom;
