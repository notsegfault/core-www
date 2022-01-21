import React from 'react';
import { TabBody } from 'react95';
import styled from 'styled-components'

const CoreTabBodyContainer = styled(TabBody)`
  overflow-y: auto;
  padding: 0.5em;
`;
const CoreTabBodyContent = styled(TabBody)`
  overflow-y: auto;
  border: none;
  box-shadow: none;
  padding: 0.5em;
`;

const CoreTabBody = ({ children }) => {
  return <CoreTabBodyContainer>
    <CoreTabBodyContent>
      {children}
    </CoreTabBodyContent>
  </CoreTabBodyContainer>
}

export default CoreTabBody;
