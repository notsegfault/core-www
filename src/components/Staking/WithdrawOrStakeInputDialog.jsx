import React from 'react';
import { Button, TextField } from 'react95';
import { useWallet } from 'use-wallet';
import BigNumber from 'bignumber.js';
import {
  useCoreBalance,
  useFannyInfo,
  useUserStakedInPool,
  useUserTokenBalance,
} from '../../hooks';
import { DATA_UNAVAILABLE } from '../../yam/lib/constants';
import warningIMG from '../../assets/img/warning.png';
import { FannyStakingMultiplierSelect } from '../Fanny';
import { staking } from '../../helpers';

const WithdrawOrStakeInputDialog = ({
  setTransactionValue,
  type,
  tokenName,
  pid,
  lockTimeWeeks,
  setLockTimeWeeks,
}) => {
  const wallet = useWallet();

  const getTypeCurrency = () => {
    switch (type) {
      case 'stake-core-fanny':
        return 'CORE';
      case 'liquidity-zap':
        return 'ETH';
      case 'LGE2':
        return tokenName;
      default:
        switch (pid) {
          case 0:
            return "CORE/WETH UNIv2 LP'";
          case 1:
            return 'cBTC/CORE UNIv2 LP';
          case 2:
            return 'wCORE/coreDAI UNIv2 LP';
          case 3:
            return 'CoreDAO';
        }
    }
  };

  const getFriendlyType = () => {
    switch (type) {
      case 'stake-core-fanny':
        return 'stake';
      case 'withdraw-core-fanny':
        return 'withdraw';
      default:
        return type;
    }
  };

  const getQuestionText = () => {
    return (
      <>
        How much {type === 'LGE2' && getTypeCurrency()} do you want to{' '}
        {type === 'LGE2' ? 'Add to Liquidity' : getFriendlyType(type)}?
      </>
    );
  };

  const pairName = staking.getPairNameByPid(pid);
  const userLPTokens = useUserTokenBalance(pairName);
  const userCORETokens = useCoreBalance();
  const fannyInfo = useFannyInfo();
  const userLPTokensInPool = useUserStakedInPool(pid ? pid : 0, wallet.account);
  const [value, setValue] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    switch (type) {
      case 'stake-core-fanny':
      case 'withdraw-core-fanny':
        break;
      default:
        setValue(type === 'stake' ? userLPTokens.balance : userLPTokensInPool.value);
    }
  }, [userLPTokensInPool, userLPTokens]);

  React.useEffect(() => {
    switch (type) {
      case 'withdraw-core-fanny':
        setValue(fannyInfo.staked);
        break;
    }
  }, [fannyInfo]);

  React.useEffect(() => {
    switch (type) {
      case 'stake-core-fanny':
      case 'withdraw-core-fanny':
        setValue(userCORETokens);
        break;
    }
  }, [userCORETokens]);

  const [textFieldValue, setTextFieldValue] = React.useState(0);
  React.useEffect(() => {
    if (value !== DATA_UNAVAILABLE) {
      let textFieldValue = value;

      if (!BigNumber.isBigNumber(value)) {
        textFieldValue = new BigNumber(value);
      }

      setTextFieldValue(textFieldValue.div(new BigNumber(10).pow(18)));
    }
  }, [value]);

  const handleChange = e => {
    let targetValue = e.target.value.replace(/\s/g, '');
    let currentValue = value;

    if (new BigNumber(targetValue).isNaN()) {
      targetValue = '';
    }

    if (!BigNumber.isBigNumber(value)) {
      currentValue = new BigNumber(value);
    }

    const targetValueAsBigNumber = new BigNumber(new BigNumber(targetValue).toFixed(18));
    const biggerThanMax = targetValueAsBigNumber.gt(currentValue.div(new BigNumber(10).pow(18)));
    if (biggerThanMax) {
      targetValue = currentValue.div(new BigNumber(10).pow(18));
    }

    setTextFieldValue(targetValue);
  };

  React.useEffect(() => {
    let transactionValue = new BigNumber(textFieldValue);
    if (transactionValue.isNaN()) {
      transactionValue = new BigNumber(0);
    }

    transactionValue.toFixed();
    setTransactionValue(transactionValue);
  }, [textFieldValue]);

  const onFannyStakingMultiplierChanged = e => {
    setLockTimeWeeks(e.target.value);
  };

  const renderFannyStakingMultiplierExplanation = () => {
    switch (lockTimeWeeks) {
      case 0:
        return <>Your CORE will not be locked.</>;
      case 'burn':
        return (
          <div style={{ display: 'flex' }}>
            <img src={warningIMG} alt="warning" />
            <span style={{ margin: 'auto' }}>
              Your CORE will be burnt but you
              <br />
              will benefit from the maximum multiplier.
            </span>
          </div>
        );
      default:
        return <>Your CORE will be locked for {parseInt(lockTimeWeeks) / 4} months.</>;
    }
  };

  const renderFannyStakingLockTimeMultipliers = () => {
    return (
      <div style={{ marginTop: '1em' }}>
        <div>
          <strong>Choose your reward multiplier</strong>
        </div>
        <div>
          <FannyStakingMultiplierSelect onChange={e => onFannyStakingMultiplierChanged(e)} />
        </div>
        <div style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
          {renderFannyStakingMultiplierExplanation()}
        </div>
      </div>
    );
  };

  return React.useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1
        style={{
          marginRight: '0.6rem',
          display: 'flex',
          alignItems: 'flex-end',
          maxWidth: '30ch',
          justifyContent: 'center',
        }}
      >
        {getQuestionText()}
      </h1>
      <div
        style={{
          display: 'flex',
          width: '80%',
          paddingTop: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <TextField value={textFieldValue} onChange={handleChange} style={{ width: '300px' }} />
        <Button
          style={{ width: '4rem', marginLeft: '-4rem' }}
          onClick={() =>
            BigNumber.isBigNumber(value) && setTextFieldValue(value.div(new BigNumber(10).pow(18)))
          }
        >
          MAX
        </Button>
      </div>
      {type === 'stake-core-fanny' && renderFannyStakingLockTimeMultipliers()}
    </div>
  ));
};

export default WithdrawOrStakeInputDialog;
