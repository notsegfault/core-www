import React from 'react';
import {
  Select
} from 'react95';

const AVAIBLE_LOCK_TIMES = [0, 'burn', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // months

const options = AVAIBLE_LOCK_TIMES.map(months => {
  if (months === 'burn') {
    return {
      label: `Burn - 25x`,
      value: 'burn'
    };
  }
  if (months === 0) {
    return {
      label: `No Locktime - 1x`,
      value: (0).toString()
    };
  }

  return {
    label: `${months} months - ${months}x`,
    value: (months * 4).toString()
  };
});

const FannyStakingMultiplierSelect = ({
  onChange,
  value,
  ...props
}) => {
  return <Select
    value={value}
    options={options}
    menuMaxHeight={250}
    width={295}
    onChange={onChange}
    {...props}
  />;
};

export default FannyStakingMultiplierSelect;
