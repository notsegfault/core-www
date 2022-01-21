import React from 'react';
import {
  Button,
  WindowContent,
  TextField,
  Fieldset
} from 'react95';
import { useWallet } from 'use-wallet';
import { CountrySelect } from '../../../../components/Select';
import { CoreScrollableContent, CoreWindow, CoreWindowContent } from '../../../../components/Windows';
import { WindowsContext } from '../../../../contexts/Windows';
import { ErrorType } from '../../../../contexts/Windows/WindowsProvider';
import { useYam } from '../../../../hooks';
import '../../../../styles/form.css';
import fullCountriesCities from 'full-countries-cities';
import { API_URL } from '../../../../config/api.config';

const FORM_DEFAULT_VALUE = {
  fullName: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateRegion: '',
  postalCodeZip: '',
  country: 'US'
};

const FannyShippingFormWindow = props => {
  const windowsContext = React.useContext(WindowsContext);
  const wallet = useWallet();
  const yam = useYam();
  const [formDisabled, setFormDisabled] = React.useState('');
  const [shippingInfo, setShippingInfo] = React.useState({
    ...FORM_DEFAULT_VALUE
  });

  React.useEffect(() => {
    resetForm();
  }, [props.id]);

  const onClose = e => {
    windowsContext.closeWindow(props.windowName, e);
  };

  const getCountryNameByCode = code => {
    return fullCountriesCities.getCountries().filter(info => info.cca2 === code)[0].name.common;
  }

  const sendOrder = async () => {
    const msgHash = yam.web3.utils.sha3(JSON.stringify(shippingInfo));
    const signature = await yam.web3.eth.sign(msgHash, wallet.account);
    const url = new URL(`/claims`, API_URL);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...shippingInfo,
        claimId: props.id,
        signature
      })
    });

    if (response.status !== 200) {
      const json = await response.json();
      throw new Error(json.errors?.map(error => error.msg).join('<br/>'));
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormDisabled('disabled');

    const confirmContent = <>
      <h2>Are you sure you want to order your fanny pack using the following shipping information?</h2>
      <Fieldset style={{ marginTop: '1em' }}>
        <ul className="flex-outer-readonly">
          <li><label>Full Name</label><span>{shippingInfo.fullName}</span></li>
          <li><label>Email</label><span>{shippingInfo.email}</span></li>
          <li><label>Adresse</label><span>{shippingInfo.addressLine1} {shippingInfo.addressLine2}</span></li>
          <li><label>City</label><span>{shippingInfo.city}</span></li>
          <li><label>State/Region</label><span>{shippingInfo.stateRegion}</span></li>
          <li><label>Postal Code/ZIP</label><span>{shippingInfo.postalCodeZip}</span></li>
          <li><label>Country</label><span>{getCountryNameByCode(shippingInfo.country)}</span></li>
        </ul>
      </Fieldset>
    </>

    const confirm = await windowsContext.showConfirm('Confirmation', confirmContent, e, { maxWidth: '500px' });

    if (confirm) {
      try {
        await sendOrder();
  
        windowsContext.showDialog(
          'Thank you for your order',
          <div>
            Congratulations, your $FANNY token was successfully redeemed. We will send out your limited-edition CORE Fanny Pack.<br />
                An Email with your courier tracking number will be sent to you.
              </div>,
          'Ok');
  
        onClose(e);
      } catch(error) {
        await windowsContext.showError('Error', error.message, ErrorType.Fatal, 'An error occured while sending the order');
        setFormDisabled('');
      }
    } else {
      setFormDisabled('');
    }
  };

  const resetForm = () => {
    setShippingInfo(shippingInfo => ({
      ...shippingInfo,
      ...FORM_DEFAULT_VALUE
    }));
  };

  const onFormFieldValueChanged = (e, propertyName) => {
    const targetValue = e.target.value;

    setShippingInfo(info => {
      const form = {};
      form[propertyName] = targetValue;

      return {
        ...info,
        ...form,
      };
    })
  };

  const renderContent = () => {
    return <CoreScrollableContent style={{ padding: '0.5em' }}>
      <h1>Fanny Pack Shipping Form</h1>
      <div style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
        The information is not kept on our database.
      </div>
      <form onSubmit={onSubmit}>
        <ul className="flex-outer">
          <li>
            <label htmlFor="full-name">Claim</label>
            <span>#{props.id}</span>
          </li>
          <li>
            <label htmlFor="full-name">Full Name</label>
            <TextField
              id="full-name"
              placeholder='Full Name'
              disabled={formDisabled}
              value={shippingInfo.fullName}
              onChange={(e) => onFormFieldValueChanged(e, 'fullName')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="email">Email</label>
            <TextField
              placeholder='your@email.com'
              type="email"
              id="email"
              disabled={formDisabled}
              value={shippingInfo.email}
              onChange={(e) => onFormFieldValueChanged(e, 'email')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="address-line-1">Address Line 1</label>
            <TextField
              placeholder='Address Line 1'
              id="address-line-1"
              disabled={formDisabled}
              value={shippingInfo.addressLine1}
              onChange={(e) => onFormFieldValueChanged(e, 'addressLine1')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="address-line-2">Address Line 2</label>
            <TextField
              placeholder='Address Line 2 (optional)'
              id="address-line-2"
              disabled={formDisabled}
              value={shippingInfo.addressLine2}
              onChange={(e) => onFormFieldValueChanged(e, 'addressLine2')}
              style={{ width: '400px' }}
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="city">City</label>
            <TextField
              placeholder='City (If appropriate)'
              id="city"
              disabled={formDisabled}
              value={shippingInfo.city}
              onChange={(e) => onFormFieldValueChanged(e, 'city')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="stateRegion">State/Region</label>
            <TextField
              placeholder='State/Region'
              id="stateRegion"
              disabled={formDisabled}
              value={shippingInfo.stateRegion}
              onChange={(e) => onFormFieldValueChanged(e, 'stateRegion')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="postalCodeZip">Postal Code/ZIP</label>
            <TextField
              placeholder='Postal Code/ZIP'
              id="postalCodeZip"
              disabled={formDisabled}
              value={shippingInfo.postalCodeZip}
              onChange={(e) => onFormFieldValueChanged(e, 'postalCodeZip')}
              style={{ width: '400px' }}
              required='required'
              maxLength={255}
            />
          </li>
          <li>
            <label htmlFor="country">Country</label>
            <CountrySelect id="country" disabled={formDisabled} value={shippingInfo.country} {...{ required: 'required' }} onChange={(e) => onFormFieldValueChanged(e, 'country')}></CountrySelect>
          </li>
          <li>
            <div style={{ marginLeft: 'auto' }}>
              <Button disabled={formDisabled} type="submit">Submit</Button>
              <Button style={{ marginLeft: '0.5em' }} onClick={e => onClose(e)}>Cancel</Button>
            </div>
          </li>
        </ul>
      </form>
    </CoreScrollableContent>
  };

  const renderConnectToWallet = () => {
    return <div>Your wallet must be connected to redeem your fanny pack.</div>
  }

  return (
    <CoreWindow
      {...props}
      windowTitle='FannyPackShippingForm.vb'
      top='5%'
      left='5%'
      width='600px'
      disabled={formDisabled === 'disabled'}
    >
      <CoreWindowContent>
        {wallet.status === 'connected' ? renderContent() : renderConnectToWallet()}
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default FannyShippingFormWindow;
