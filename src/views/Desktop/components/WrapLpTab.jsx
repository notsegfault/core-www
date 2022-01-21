import React from 'react';
import styled from 'styled-components';
import { Fieldset } from 'react95';
import useYam from "../../../hooks/useYam"
import useWallet from 'use-wallet'
import { SmallBalancesDisplay } from '../../../components/Text';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import { useUserTokenBalance } from '../../../hooks';
import { TransactionButton } from '../../../components/Button';
import { transactions } from '../../../helpers';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import wrapIMG from '../../../assets/img/wrap.png';
import { TokenIcon } from '../../../components/Icon';

const configuration = [{
  wrapOnly: true,
  tokenIcon: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  erc95Token: {
    contract: 'coreDaoLp1',
    name: 'coreDAO LP1',
    decimals: 18
  },
  wrappedToken: {
    contract: 'CORExWETH',
    name: 'core-weth lp',
    decimals: 18
  },
}, {
  wrapOnly: true,
  tokenIcon: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  erc95Token: {
    contract: 'coreDaoLp2',
    name: 'coreDAO LP2',
    decimals: 18
  },
  wrappedToken: {
    contract: 'CORExcBTC',
    name: 'core-cbtc lp',
    decimals: 18
  },
}, {
  wrapOnly: true,
  tokenIcon: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  erc95Token: {
    contract: 'coreDaoLp3',
    name: 'coreDAO LP3',
    decimals: 18
  },
  wrappedToken: {
    contract: 'cDAIxwCORE',
    name: 'cdai-wcore lp',
    decimals: 18
  },
}]

const WrappingPanel = styled.div`
  display: flex;
  justify-content: space-between;

  @media only screen and (max-width: 767px) {
    margin-top: 1em;
    display: block;
  }
`;

const WrappingPanelButtons = styled.span`
  @media only screen and (max-width: 767px) {
    display: flex;
  }
`;

const iconStyle = {
  width: '16px',
  height: '16px',
  opacity: '0.8'
};

const tokenLogoStyle = {
  alignSelf: 'center',
  width: '16px',
  height: '16px',
  marginRight: '0.5em'
};

const WrapSection = ({ wrapOnly, tokenIcon, erc95Token, wrappedToken }) => {
  const windowsContext = React.useContext(WindowsContext);
  const yam = useYam()
  const wallet = useWallet()

  const { balance: userErc95Balance, refresh: refreshErc95Balance } = useUserTokenBalance(erc95Token.contract)
  const { balance: userWrappedTokenBalance, refresh: refreshWrappedTokenBalance } = useUserTokenBalance(wrappedToken.contract)

  const onWrapAll = async () => {
    const transaction = yam.contracts[erc95Token.contract].methods.wrap();
  
    try {
      const transactionGasEstimate = await transaction.estimateGas({ from: wallet.account });
  
      await transaction.send({
        from: wallet.account,
        gas: transactionGasEstimate
      });

    } catch (error) {
      const transactionError = transactions.getTransactionError(error);
      windowsContext.showError('Error while wrapping', '', ErrorType.Fatal, transactionError.message);
    }
  };

  const wrappedTokenButtons = React.useMemo(() => {
    const disabled = userWrappedTokenBalance === DATA_UNAVAILABLE || userWrappedTokenBalance <= 0;
    return <TransactionButton icon={wrapIMG} iconStyle={iconStyle} disabled={disabled} style={{ minWidth: '90px' }} text="Wrap All" allowanceRequiredFor={{ contract: erc95Token.contract, token: wrappedToken.contract }} onClick={e => onWrapAll(e)} />
  }, [userErc95Balance, userWrappedTokenBalance, wrapOnly])

  const getWrappingLabel = () => {
    return <span style={{ display: 'flex' }}>
      <TokenIcon address={tokenIcon || yam?.contracts[wrappedToken.contract]._address} style={tokenLogoStyle} />
     {wrappedToken.name} → {erc95Token.name}
    </span>;
  };

  return (
    <Fieldset label={getWrappingLabel()} style={{ textAlign: 'left', marginTop: '1rem' }}>
      <WrappingPanel>
        <SmallBalancesDisplay><span style={{ fontWeight: 600, marginRight: '0.2em' }}>{wrappedToken.name}</span> <ScrambleDisplay value={userWrappedTokenBalance} decimals={wrappedToken.decimals} /></SmallBalancesDisplay>
        <WrappingPanelButtons>{wrappedTokenButtons}</WrappingPanelButtons>
      </WrappingPanel>
      <hr />
      <WrappingPanel style={{ paddingBottom: '0.2rem' }}>
        <SmallBalancesDisplay><span style={{ fontWeight: 600, marginRight: '0.2em' }}>{erc95Token.name}</span> <ScrambleDisplay value={userErc95Balance} decimals={erc95Token.decimals} /></SmallBalancesDisplay>
      </WrappingPanel>
    </Fieldset>
  );
};

const WrapLpTab = () => {
  return (
    <div>
      {configuration.map((section, index) => <WrapSection key={`section-${index}`} {...section} />)}
    </div>
  );
};

export default WrapLpTab;
