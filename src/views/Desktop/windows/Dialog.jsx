import React from 'react';
import {
  Button
} from 'react95';
import { CoreModalWindow, CoreWindowContent } from '../../../components/Windows';
import { WindowsContext } from '../../../contexts/Windows';

const Dialog = ({ title, content, buttonContent, ...props }) => {
  buttonContent = buttonContent || 'Ok';

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
            <div>
              <div>
                {content}
              </div>
            </div>
          </div>
          <Button style={{ padding: '0 2rem', marginTop: '1.0rem' }} onClick={(e) => windowsContext.closeDialog(e)}>
            {buttonContent}
          </Button>
        </div>
      </CoreWindowContent>
    </CoreModalWindow>
  );
};

export default Dialog;
