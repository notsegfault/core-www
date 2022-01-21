import React from 'react';
import styled from 'styled-components';
import { Fieldset } from 'react95';
import useYam from "../../../hooks/useYam"
import useWallet from 'use-wallet'
import { SmallBalancesDisplay } from '../../../components/Text';
import ScrambleDisplay from '../../../components/Text/ScrambleDisplay';
import { WindowsContext } from '../../../contexts/Windows';
import { getTransactionWindowName } from '../windows/TransactionWindow';
import { WindowType } from '../../../config/windowTypes.config';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';
import { useUserTokenBalance } from '../../../hooks';
import { TransactionButton } from '../../../components/Button';
import { transactions, tokenLogo } from '../../../helpers';
import { ErrorType } from '../../../contexts/Windows/WindowsProvider';
import wrapIMG from '../../../assets/img/wrap.png';
import unwrapIMG from '../../../assets/img/unwrap.png';
import unwrapAllIMG from '../../../assets/img/unwrapall.png';
import { TokenIcon } from '../../../components/Icon';

const configuration = [{
  erc95Token: {
    contract: 'CBTC',
    name: 'cBTC',
    decimals: 8
  },
  wrappedToken: {
    contract: 'WBTC',
    name: 'wBTC',
    decimals: 8
  }
}, {
  erc95Token: {
    contract: 'cDAI',
    name: 'coreDAI',
    decimals: 18
  },
  wrappedToken: {
    contract: 'DAI',
    name: 'DAI',
    decimals: 18
  },
}, {
  erc95Token: {
    contract: 'wCORE',
    name: 'wCORE',
    decimals: 18
  },
  wrappedToken: {
    contract: 'core',
    name: 'CORE',
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

const WrapSection = ({ erc95Token, wrappedToken }) => {
  const windowsContext = React.useContext(WindowsContext);
  const yam = useYam()
  const wallet = useWallet()

  const { balance: userErc95Balance, refresh: refreshErc95Balance } = useUserTokenBalance(erc95Token.contract)
  const { balance: userWrappedTokenBalance, refresh: refreshWrappedTokenBalance } = useUserTokenBalance(wrappedToken.contract)

  const unwrapAllERC95 = async () => {
    try {
      const transaction = yam.contracts[erc95Token.contract].methods.unwrapAll();

      await transaction.send({
        from: wallet.account,
        gas: 200000,
      });

      refreshWrappedTokenBalance();
      refreshErc95Balance()

    } catch (error) {
      const transactionError = transactions.getTransactionError(error);
      windowsContext.showError('Error while Unwrapping', '', ErrorType.Fatal, transactionError.message);
    }
  };

  const onWrap = async e => {
    return windowsContext.openModal(
      WindowType.Transaction, null, {
      type: 'wrapInErc95',
      additional: {
        tokenName: wrappedToken.contract,
        decimals: wrappedToken.decimals,
        tokenFriendlyName: wrappedToken.name,
        erc95TokenContract: erc95Token.contract,
        erc95TokenContractFriendlyName: erc95Token.name,
        onAfterTransaction: () => {
          refreshWrappedTokenBalance();
          refreshErc95Balance();
        }
      }
    }, {
      windowName: getTransactionWindowName('wrapInErc95')
    }
    );
  };

  const onUnwrap = async e => {
    return windowsContext.openModal(
      WindowType.Transaction, null, {
      type: 'unwrapErc95',
      additional: {
        tokenName: erc95Token.contract,
        decimals: erc95Token.decimals,
        tokenFriendlyName: erc95Token.name,
        erc95TokenContract: erc95Token.contract,
        erc95TokenContractFriendlyName: erc95Token.name,
        onAfterTransaction: () => {
          refreshWrappedTokenBalance();
          refreshErc95Balance();
        }
      }
    }, {
      windowName: getTransactionWindowName('unwrapErc95')
    }
    );
  };

  const wrappedTokenButtons = React.useMemo(() => {
    const disabled = userWrappedTokenBalance === DATA_UNAVAILABLE || userWrappedTokenBalance <= 0;
    return <TransactionButton icon={wrapIMG} iconStyle={iconStyle} disabled={disabled} style={{ minWidth: '90px' }} text="Wrap" allowanceRequiredFor={{ contract: erc95Token.contract, token: wrappedToken.contract }} onClick={e => onWrap(e)} />
  }, [userErc95Balance, userWrappedTokenBalance])

  const erc95Buttons = React.useMemo(() => {
    const disabled = userErc95Balance === DATA_UNAVAILABLE || userErc95Balance <= 0;
    return <>
      <TransactionButton icon={unwrapIMG} iconStyle={iconStyle} disabled={disabled} style={{ minWidth: '90px', marginRight: '0.2rem' }} text="Unwrap" onClick={e => onUnwrap(e)} />
      <TransactionButton icon={unwrapAllIMG} iconStyle={iconStyle} disabled={disabled} style={{ minWidth: '120px' }} text="Unwrap All" onClick={_ => unwrapAllERC95()} />
    </>;
  }, [userErc95Balance])

  const getWrappingLabel = () => {
    return <span style={{ display: 'flex' }}>
      <TokenIcon address={yam?.contracts[wrappedToken.contract]._address} style={tokenLogoStyle} />
      {wrappedToken.name} ⇆ {erc95Token.name}
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
        <WrappingPanelButtons>{erc95Buttons}</WrappingPanelButtons>
      </WrappingPanel>
    </Fieldset>
  );
};

const WrapTab = () => {
  return (
    <div>
      {configuration.map(section => <WrapSection {...section} />)}
      <div style={{ maxWidth: '35ch', margin: 'auto', textAlign: 'center', paddingTop: '1rem' }}>
        ERC95 tokens are wrapped versions of their respective tokens. You can wrap and unwrap between them at will. Always 1:1, and without any fees.
      </div>
    </div>
  );
};

export default WrapTab;
