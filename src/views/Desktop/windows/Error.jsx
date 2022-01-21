import React from 'react';
import {
  Button
} from 'react95';
import { CoreModalWindow, CoreWindowContent } from '../../../components/Windows';
import errorIMG from '../../../assets/img/error.png';
import warningIMG from '../../../assets/img/warning.png';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import { WindowsContext } from '../../../contexts/Windows';

const Error = ({ title, errorMessage, errorType, additional, errorExplaination, onOk, ...props }) => {
  const windowsContext = React.useContext(WindowsContext);

  return (
    <CoreModalWindow
      width='400px'
      minWidth='400px'
      centerize={[true, false]}
      top="30%"
      {...props}
      windowTitle={title}
    >
      <CoreWindowContent extraPadding>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img style={{ width: '15%%', marginRight: '1rem' }} src={errorType === ErrorType.Fatal ? errorIMG : warningIMG} />
            <div>
              <div>
                {errorExplaination}
              </div>
              <div>
                {errorMessage}
              </div>
            </div>
          </div>
          <Button style={{ padding: '0 2rem', marginTop: '1.5rem' }} onClick={(e) => {
            onOk(e);
            windowsContext.closeError(e)}
          }> OK </Button>
        </div>
      </CoreWindowContent>
    </CoreModalWindow>
  );
};

export default Error;
