import React from 'react';

let numLoading = 0;

const WindowLoadingComponent = () => {
  React.useEffect(() => {
    document.body.style.cursor = 'wait';
    numLoading++;

    return () => {
      --numLoading <= 0 && (document.body.style.cursor = 'auto');
    }
  }, []);
  return <></>
};

export default WindowLoadingComponent;
