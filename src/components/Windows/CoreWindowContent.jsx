import React from 'react';
import {
  WindowContent
} from 'react95';
import styled from 'styled-components';

const StyledWindowContent = styled(WindowContent)`
  padding: ${props => props.extraPadding ? "16px" : "8px"};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  min-height: 100px;
  min-width: 100px;
  max-height: 100% !important;
`;

const CoreWindowContent = React.forwardRef(function CoreWindowContent(props, ref) {
  const { children, ...otherProps } = props;

  return (
    <StyledWindowContent ref={ref} {...otherProps}>
      {children}
    </StyledWindowContent>
  );
});

export default CoreWindowContent;