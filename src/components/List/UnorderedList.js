import styled from 'styled-components'

const UnorderedList = styled.ul`
  list-style: none;
  text-indent: -1ch;
  margin-left: 2ch;
  li:before {
    content: "• ";
  }
`;

export default UnorderedList;
