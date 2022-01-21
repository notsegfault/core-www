import React, { useEffect, useState } from 'react';
import { tokenLogo } from '../../helpers';
import { useWeb3 } from '../../hooks';

const TokenIcon = ({ address, ...props }) => {
  const web3Client = useWeb3();
  const [src, setSrc] = useState();

  useEffect(() => {
    if (web3Client && address) {
      setSrc(tokenLogo.get(web3Client.web3, address));
    }
  }, [web3Client, address]);

  return src ? <img src={src} alt="logo" {...props} /> : <></>;
}

export default TokenIcon;
