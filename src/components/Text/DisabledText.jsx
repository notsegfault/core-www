import styled from 'styled-components';

const DisabledText = styled.span`
  color: black;
  font-weight: 100;
  text-shadow: 1px 1px white;

  color: ${({ theme }) => theme.borderDark};
  text-decoration: none;
  /* font-style: normal; */
`;
export default DisabledText;
