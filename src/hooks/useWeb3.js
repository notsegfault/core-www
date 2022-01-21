import React from 'react';
import { Web3Context } from '../contexts/Web3';

const useWeb3 = () => {
    const { web3 } = React.useContext(Web3Context);
    return web3;
};

export default useWeb3;