import React from 'react';
import { CoreWindow } from '../../../components/Windows';
import {
  Anchor,
  TextField,
  Hourglass,
  Slider,
  Fieldset,
  Checkbox,
} from 'react95';

import {
  useYam
} from '../../../hooks';

import Confetti from 'react-dom-confetti';
import errorIMG from '../../../assets/img/error.png';
import infoIMG from '../../../assets/img/info.png';
import checkmarkIMG from '../../../assets/img/checkmark.png';
import useWallet from 'use-wallet';
import LinkButton from '../components/LinkButton';

const Deposit = props => {
  const wallet = useWallet();
  const yam = useYam();

  const [estimatedGas, setEstimatedGas] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const gas =
        parseInt(await yam.web3.eth.getGasPrice()) *
        parseInt(
          await yam.contracts.core.methods.addLiquidity(true).estimateGas({ value: wallet.balance })
        );
      setEstimatedGas(gas * 1.2);
    })();
  }, [yam, wallet]);

  const config = {
    angle: '71',
    spread: '360',
    startVelocity: '17',
    elementCount: '125',
    dragFriction: '0.07',
    duration: '4180',
    stagger: '4',
    width: '14px',
    height: '11px',
    perspective: '430px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  const [fsm, setFSM] = React.useState(1);
  const [deposit, setDeposit] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [txHash, setTxHash] = React.useState(0);

  const AcceptTerms = () => {
    const [terms, setTerms] = React.useState('Terms loading...');
    const [agreements, setAgreements] = React.useState([0, 0, 0]);
    React.useEffect(() => {
      (async () => {
        const termsCall = await yam.contracts.core.methods
          .liquidityGenerationParticipationAgreement()
          .call();
        setTerms(termsCall);
      })();
    }, []);

    const agreedAll =
      agreements.reduce((acc, agre) => {
        if (agre) acc++;
        return acc;
      }, 0) === 3;

    return (
      <>
        <TextField multiline rows={8} value={terms} />
        <div style={{ width: '90%', margin: 'auto', paddingTop: '2rem' }} className="checkboxes">
          <Fieldset label="Liquidity Event Terms">
            <Checkbox
              name="allToppings"
              label="Agree to all terms"
              indeterminate={false}
              checked={agreedAll}
              onClick={() =>
                setAgreements(
                  agreedAll ? agreements.map(agreement => 0) : agreements.map(agreement => 1)
                )
              }
            />
            <div style={{ paddingLeft: '1.5rem' }}>
              <Checkbox
                label="I agree to terms of service in the smart contract (outlined above)"
                name="TOS"
                checked={agreements[0]}
                onClick={() => {
                  const oldAgremenets = [...agreements];
                  oldAgremenets[0] = oldAgremenets[0] === 0 ? 1 : 0;
                  setAgreements(oldAgremenets);
                }}
              />

              <br />
              <Checkbox
                label="I understand that LP tokens are not-withdrawable on Uniswap."
                name="ingredients"
                checked={agreements[1]}
                onClick={() => {
                  const oldAgremenets = [...agreements];
                  oldAgremenets[1] = oldAgremenets[1] === 0 ? 1 : 0;
                  setAgreements(oldAgremenets);
                }}
              />
              <br />
              <Checkbox
                label="I understand that this a decentralized smart contract."
                name="ingredients"
                checked={agreements[2]}
                onClick={() => {
                  const oldAgremenets = [...agreements];
                  oldAgremenets[2] = oldAgremenets[2] === 0 ? 1 : 0;
                  setAgreements(oldAgremenets);
                }}
              />
            </div>
          </Fieldset>
          <Checkbox
            name="shipping"
            value="shipping"
            label={`I'm a cool cat`}
            defaultChecked
            disabled
            style={{ marginTop: '1rem' }}
          />
        </div>

        <LinkButton
          fullWidth
          disabled={!agreedAll}
          style={{ marginRight: 8, marginTop: '1rem', marginBottom: '0.5rem' }}
          onClick={() => {
            setFSM(3);
          }}
          size="lg"
        >
          <img alt="checkmark" src={checkmarkIMG} width={24} style={{ paddingRight: '0.5rem' }} />
          Add Liquidity
        </LinkButton>
      </>
    );
  };

  const TransactionStatus = () => {
    const [additonalText, setAdditionalText] = React.useState('');

    const [transactionStatus, setTransactionStatus] = React.useState('waiting for click');

    React.useEffect(() => {
      if (transactionStatus === 'waiting for click') {
        (async () => {
          let tx;
          try {
            setTransactionStatus('sent');
            tx = await yam.contracts.core.methods
              .addLiquidity(true)
              .send({ from: wallet.account, value: deposit });
          } catch (e) {
            setTransactionStatus('error');
            setAdditionalText(e.message);
          } finally {
            if (tx?.transactionHash) {
              setSuccess(true);

              setTxHash(tx.transactionHash);
            }
          }
        })();
      }
    }, [transactionStatus]);

    return (
      <>
        {transactionStatus === 'sent' && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
              }}
            >
              <h1>Waiting for blockchain confirmation...</h1>
              <Hourglass size={64} style={{ padding: '1rem 0', margin: 'auto' }} />
              Adding liquidity for {parseFloat(deposit / 1e18).toFixed(4) + ' ETH'} <br />
              by interacting with CORE smart contract
              <Anchor
                href={`https://etherscan.io/address/${yam.contracts.core._address}`}
                target="_blank"
              >
                {yam.contracts.core._address}
              </Anchor>{' '}
              <br />
              <br /> Liquidity will be credited to{' '}
              <Anchor href={`https://etherscan.io/address/${wallet.account}`} target="_blank">
                {wallet.account}
              </Anchor>
            </div>
          </>
        )}

        {transactionStatus === 'error' && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
              }}
            >
              <img alt="error" src={errorIMG} width={64} style={{ padding: '1rem 0', margin: 'auto' }} />
              <h1>Transaction error...</h1>
              <br />
              {additonalText}
            </div>
            <LinkButton
              fullWidth
              style={{
                marginRight: 8,
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
              onClick={() => {
                setTransactionStatus('waiting for click');
              }}
              size="lg"
            >
              Try again
            </LinkButton>
          </>
        )}
      </>
    );
  };

  const Success = () => {
    const [confetti, setConfetti] = React.useState(false);
    React.useEffect(() => {
      setConfetti(true);
    }, []);
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <Confetti active={confetti} config={config} />
          <h1>Success!</h1>
          <br />
          Congratulations! <br />
          Deposit of {parseFloat(deposit / 1e18).toFixed(4)} ETH was confirmed! <br />
          <Anchor href={`https://etherscan.io/address/${txHash}`} target="_blank">
            View transaction on etherscan.
          </Anchor>
        </div>

        <LinkButton
          fullWidth
          style={{ marginRight: 8, marginTop: '1rem', marginBottom: '0.5rem' }}
          onClick={() => {
            setFSM(1);
            setSuccess(false);
          }}
          size="lg"
        >
          Go again
        </LinkButton>
      </>
    );
  };

  const PickValue = ({ setFSM, setDeposit }) => {
    const [sliderPercent, setSliderPercent] = React.useState(70);

    return (
      <div style={{ padding: '1rem' }}>
        <h1>Adding Liquidity...</h1>

        <div style={{ display: 'flex', paddingTop: '1rem', margin: 'auto' }}>
          <img alt="info" src={infoIMG} height="60" style={{ marginRight: '1.5rem' }} />
          <span style={{ maxWidth: '40ch' }}>
            All of CORE tokens will be paired with ETH contributed to kickstart initial liquidity.
            Essentially giving a 50% discount on LP tokens.
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ width: '80%', paddingTop: '3rem', margin: 'auto' }}>How much ETH?</h1>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Slider
              size="80%"
              min={0.01}
              max={((wallet.balance - estimatedGas) / 1e18).toFixed(2)}
              step={0.01}
              defaultValue={(((wallet.balance - estimatedGas) / 1e18) * 0.7).toFixed(2)}
              onChange={e => {
                const percent = e.target.style.left.split('%')[0];
                if (percent !== '') setSliderPercent(percent);
              }}
              onClick={e => {
                const percent = e.target.style.left.split('%')[0];
                if (percent !== '') setSliderPercent(percent);
              }}
              marks={[
                { value: 0.01, label: '0.01' },
                {
                  value: ((wallet.balance - estimatedGas) / 1e18).toFixed(2),
                  label: `Max ${((wallet.balance - estimatedGas) / 1e18).toFixed(2)}`,
                },
              ]}
            />
          </div>
        </div>

        <div style={{ margin: 'auto', width: '80%', paddingTop: '2rem' }}>
          <h1>Total</h1>
          {((wallet.balance * sliderPercent) / 100 / 1e18).toFixed(4)} ETH <br />
          +<br />
          Estimated gas {(estimatedGas / 1e18).toFixed(4)} ETH <br />
          = <br />
          {(((wallet.balance * sliderPercent) / 100 + estimatedGas) / 1e18).toFixed(4)}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '1.5rem',
          }}
        >
          {((wallet.balance * sliderPercent) / 100 / 1e18).toFixed(4) <= 0 &&
            'Value needs to be bigger than 0'}
          <LinkButton
            fullWidth
            disabled={((wallet.balance * sliderPercent) / 100 / 1e18).toFixed(4) <= 0}
            style={{
              marginRight: 8,
              marginTop: '1rem',
              marginBottom: '0.5rem',
            }}
            onClick={() => {
              setFSM(2);
              setDeposit((wallet.balance * sliderPercent) / 100);
            }}
            size="lg"
          >
            <img alt="checkmark" src={checkmarkIMG} width={24} style={{ paddingRight: '0.5rem' }} />
            Add {((wallet.balance * sliderPercent) / 100 / 1e18).toFixed(4)} ETH in Liquidity
          </LinkButton>
        </div>
      </div>
    );
  };

  return (
      <CoreWindow
        {...props}
        windowTitle='Liquidity.exe'
        width='500px'
      >
        {success && <Success />}
        {fsm === 1 && !success && <PickValue setFSM={setFSM} setDeposit={setDeposit} />}
        {fsm === 2 && !success && <AcceptTerms />}
        {fsm === 3 && !success && <TransactionStatus setSuccess={setSuccess} />}
      </CoreWindow>
  );
};

export default Deposit;
