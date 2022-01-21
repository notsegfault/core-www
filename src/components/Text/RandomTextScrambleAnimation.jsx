import DisabledText from './DisabledText';
import styled from 'styled-components';
import React from 'react';
import { generateRandomSeed } from '../../utils/util';

const ScramblingDisabledText = styled(DisabledText)`
  @keyframes randomGen {
    100% {
      transform: translateX(-3000%);
    }
  }

  font-family: 'vt323_regular';
  font-size: 1em;
  width: 6ch;
  overflow: hidden;

  div {
    animation: randomGen 3s steps(30) infinite;
    position: relative;
    top: -0.13em;
  }
`;

const RandomTextScrambleAnimation = () => {
  const randomSeed = generateRandomSeed(300);

  return (
    <ScramblingDisabledText>
      <div>{randomSeed}</div>
    </ScramblingDisabledText>
  );
};

export default RandomTextScrambleAnimation;
