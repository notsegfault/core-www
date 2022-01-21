import CoreWindow from './CoreWindow';
import styled from 'styled-components';

const CoreModalWindow = styled(CoreWindow)`
  @media only screen and (max-width: 767px) {
    height: auto;
    min-width: 95% !important;
    width: 95% !important;
    position: absolute;
    top: 40% !important;
    left: 50% !important;
    transform: translate(-50%,-50%) !important;
  }
`;

export default CoreModalWindow;