import React from 'react';
import {
  Button,
  TextField,
} from 'react95';

import {
  useUserTokenBalance,
} from '../../../hooks';

import BigNumber from 'bignumber.js';
import { DATA_UNAVAILABLE } from '../../../yam/lib/constants';

const WrapAndUnwrapInput = ({ setTransactionValue, type, tokenName, tokenFriendlyName, decimals }) => {
  const getTypeCurrency = () => {
    switch (type) {
      default:
        return tokenName;
    }
  };
  const userTokens = useUserTokenBalance(tokenName);


  const [value, setValue] = React.useState(DATA_UNAVAILABLE);

  React.useEffect(() => {
    setValue(userTokens.balance);
  }, [userTokens]);

  const [textFieldValue, setTextFieldValue] = React.useState(0);
  React.useEffect(() => {
    if (value !== DATA_UNAVAILABLE) {
      let textFieldValue = value;

      if (!BigNumber.isBigNumber(value)) {
        textFieldValue = new BigNumber(value);
      }

      setTextFieldValue(textFieldValue.div(new BigNumber(10).pow(decimals)));
    }
  }, [value]);

  React.useEffect(() => {
    let transactionValue = new BigNumber(textFieldValue);
    if (transactionValue.isNaN()) {
      transactionValue = new BigNumber(0)
    }

    transactionValue.toFixed();
    setTransactionValue(transactionValue);
  }, [textFieldValue]);

  const getQuestionText = () => {
    if (type === 'wrapInErc95') return <div style={{ textAlign: 'center' }}> How much {tokenFriendlyName} do you want to wrap?</div>
    if (type === 'unwrapErc95') return <div style={{ textAlign: 'center' }}> How much {tokenFriendlyName} do you want to unwrap?</div>

    return <>How much { type === 'LGE2' && getTypeCurrency()} do you want to{ ' '}
      {type === 'LGE2' ? 'Add to Liquidity' : type}?
    </>
  }

  const handleChange = (e) => {
    let targetValue = e.target.value.replace(/\s/g, '');
    let currentValue = value;

    if (new BigNumber(targetValue).isNaN()) {
      targetValue = '';
    }

    if (!BigNumber.isBigNumber(value)) {
      currentValue = new BigNumber(value);
    }

    const targetValueAsBigNumber = new BigNumber(new BigNumber(targetValue).toFixed(decimals));
    const biggerThanMax = targetValueAsBigNumber.gt(currentValue.div(new BigNumber(10).pow(decimals)))
    if (biggerThanMax) {
      targetValue = currentValue.div(new BigNumber(10).pow(decimals));
    }

    setTextFieldValue(targetValue);
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
        <TextField
          value={textFieldValue}
          onChange={handleChange}
          style={{ width: '300px' }}
        />
        <Button
          style={{ width: '4rem', marginLeft: '-4rem' }}
          onClick={() => setTextFieldValue(value.div(new BigNumber(10).pow(decimals)))}
        >
          MAX
        </Button>
      </div>
    </div>
  ));
};

export default WrapAndUnwrapInput;
