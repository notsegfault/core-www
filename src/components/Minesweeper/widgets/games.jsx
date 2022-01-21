import React from 'react';
import { render } from 'react-dom';
import Game from '../components/Game';
import { create } from 'mines';
import { takeTurn } from 'mines-robot';
import { each } from 'lodash';
import { gameStates } from 'mines';

global.minesweeperGames = {};

export default (element) => {
  const preset = 'intermediate';

  const game = create({ preset: preset });

  const name = 'intermediate';

  if (name) {
    global.minesweeperGames[name] = game;
  }

  // if (element.getAttribute('data-robot')) {
  //   const ms = parseInt(element.getAttribute('data-robot'));
  //   const poll = () => {
  //     if (game.state() === gameStates.WON || game.state() === gameStates.LOST) {
  //       game.reset();
  //     }
  //     takeTurn(game);
  //     setTimeout(poll, ms);
  //   };
  //   poll();
  // }
  return <Game game={game} />;
};

