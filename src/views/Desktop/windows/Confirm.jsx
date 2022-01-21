import React from 'react';
import {
  Button
} from 'react95';
import { CoreModalWindow, CoreWindowContent } from '../../../components/Windows';
import { WindowsContext } from '../../../contexts/Windows';

const Confirm = ({ title, content, onOk, onCancel, ...props }) => {
  const windowsContext = React.useContext(WindowsContext);

  return (
    <CoreModalWindow
      centerize={[true, false]}
      width='500px'
      minWidth='500px'
      top="30%"
      {...props}
      windowTitle={title}
    >
      <CoreWindowContent extraPadding>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <div style={{ textAlign: 'center', margin: 'auto' }}>
                {content}
              </div>
            </div>
          </div>
          <hr/>
          <div style={{ display: 'flex', marginTop: '1.0rem' }}>
            <Button style={{ flexDirection: 'column' }} onClick={(e) => { onOk(e); windowsContext.closeConfirm(e) }}>Ok</Button>
            <Button style={{ flexDirection: 'column', marginLeft: '0.5em' }} onClick={(e) => { onCancel(e); windowsContext.closeConfirm(e)}}>Cancel</Button>
          </div>
        </div>
      </CoreWindowContent>
    </CoreModalWindow>
  );
};

export default Confirm;
