import React from 'react';
import styled from 'styled-components';

const StyledScrollableContent = styled.div`
  overflow-y: auto;
`;

const CoreScrollableContent = ({ style, children }) => {
  return <StyledScrollableContent style={style}>
    {children}
  </StyledScrollableContent>
};

export default CoreScrollableContent;
