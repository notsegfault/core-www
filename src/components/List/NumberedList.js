import styled from 'styled-components'

const NumberedList = styled.ol`
  list-style: none;
  counter-reset: muffins;

  li {
    counter-increment: muffins
  }
  li:before {
    content: counter(muffins) ". ";
  }
`;

export default NumberedList;
