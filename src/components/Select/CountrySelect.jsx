import React from 'react';
import {
  Select
} from 'react95';
import fullCountriesCities from 'full-countries-cities';

const options = fullCountriesCities.getCountries().map(country => ({
  value: country.cca2,
  label: country.name.common
}));

const CountrySelect = ({
  onChange,
  value,
  ...props
}) => {
  return <Select
    value={value}
    options={options}
    menuMaxHeight={250}
    width={250}
    onChange={onChange}
    {...props}
  />;
};

export default CountrySelect;
