import { Tab } from 'react95';
import styled from 'styled-components'

const CoreTab = styled(Tab)`
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media only screen and (max-width: 767px) {
    width: 100px;
  }
`;

export default CoreTab;
