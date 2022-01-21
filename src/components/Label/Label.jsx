import styled from 'styled-components';

const Label = styled.span`
  color: black;
  font-weight: bold;
  &:after {
    content: ":";
  }
`;

export default Label;
