import styled from 'styled-components';

const Header = styled.header`
  align-items: center;
  padding: 0 5px;
  margin-bottom: 0.5em;
  width:100%;

  h1 {
    font - size: 1.8rem;
    font-weight: bold;
    font-style: italic;
    color: ${({ theme }) => theme.borderDark};
    text-shadow: 2px 2px white;
    display: flex;
    justify-self: flex-end;
    align-items: flex-end;
  
    small {
      font - size: 0.8em;
      color: black;
      font-weight: 100;
      text-shadow: 1px 1px white;
      color: ${({ theme }) => theme.borderDark};
      text-decoration: none;
      margin-left: 0.5rem;
    }
    smaller {
        line - height:1em;
      display:flex;
      align-items:flex-end;
      font-size: 0.7em;
      color: black;
      font-weight: 100;
      text-shadow: 1px 1px white;
      color: ${({ theme }) => theme.borderDark};
      text-decoration: none;
      margin-left: 0.5rem;
    }
  }
`;
export default Header;
