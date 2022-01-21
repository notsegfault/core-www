import React from 'react';
import useETHPrice from "../../../hooks/useETHPrice";
import useTotalLPTokens from '../../../hooks/useTotalLPTokens';
import useUniswapPairBalances from "../../../hooks/useUniswapPairBalances";
import useValuePerLPToken from '../../../hooks/useValuePerLPToken';
import { Fieldset } from 'react95';
import useWBTCPrice from '../../../hooks/useWBTCPrice';
import useVaultRewardStats from '../../../hooks/useVaultRewardStats';
import { pairInfoMap } from '../../../yam/lib/constants';
import Label from '../../../components/Label';
import SubInfo from '../../../components/Text/SubInfo';

const PairInfo = ({ pairName, friendlyPairName, tokenName, friendlyTokenName, tokenPrice }) => {
  const { balanceCore, balanceToken } = useUniswapPairBalances(pairName);
  const valuePerLP = useValuePerLPToken(pairName);
  const totalLP = useTotalLPTokens(pairName);
  const vaultRewardStats = useVaultRewardStats(pairName);
  const pairInfo = pairInfoMap[pairName];

  const renderPairInformation = () => {
    const balanceCoreAsInt = parseInt(balanceCore);
    const balanceTokenAsInt = parseInt(balanceToken);
    const corePriceInToken = parseFloat(balanceToken / balanceCore).toFixed(4);
    const corePriceInUsd = parseFloat(tokenPrice * parseFloat(balanceToken / balanceCore)).toLocaleString('en');

    return <>
        <Label>Balance CORE</Label> {balanceCoreAsInt} <br />
        <Label>Balance {tokenName}</Label> {balanceTokenAsInt} <br />
        <Label>CORE Price</Label> {corePriceInToken} {friendlyTokenName} <SubInfo>( ${corePriceInUsd} )</SubInfo>
    </>
  };

  const renderTokenInformation = () => {
    const scaledValuePerLPToken = valuePerLP / pairInfo.supplyScale;
    const scaledTotalLp = totalLP  * pairInfo.supplyScale;
    const scaledCorePerDayPerLp = vaultRewardStats.corePerDayPerLP / pairInfo.supplyScale;
    
    const lpValueInToken = parseFloat(scaledValuePerLPToken).toFixed(2);
    const lpValueInUsd = parseFloat(scaledValuePerLPToken * tokenPrice).toLocaleString('en');
    const totalSupplyInFriendlyRepr = parseFloat(scaledTotalLp).toFixed(2);
    const valueInLpInToken = parseInt(totalLP * valuePerLP);
    const valueInLpInUsd = parseFloat(totalLP * valuePerLP * tokenPrice).toLocaleString('en');
    const corePerDayPerLp = scaledCorePerDayPerLp.toFixed(4);
    const corePerDayPerLpInUsd = (tokenPrice * (balanceToken / balanceCore) * corePerDayPerLp).toLocaleString('en');
    
    return <>
      <Label>Value</Label> {lpValueInToken} {friendlyTokenName} <SubInfo>( ${lpValueInUsd} )</SubInfo><br />
      <Label>Total Supply</Label> {totalSupplyInFriendlyRepr} {friendlyPairName} <SubInfo>UNIv2 {pairInfo.unit}</SubInfo> <br />
      <Label>Value In LP tokens</Label> {valueInLpInToken} {friendlyTokenName} <SubInfo>( ${valueInLpInUsd} )</SubInfo><br />
      <hr/>
      At current <b>{vaultRewardStats.apy}%</b> APY, 1 staked {pairInfo.unit} token generates <b>{corePerDayPerLp}</b> CORE
      <div>per day ( ${corePerDayPerLpInUsd}** )</div>
    </>
  }

  return <>
    <Fieldset label="Pair Information">
      {renderPairInformation()}
    </Fieldset>
    <br/>
    <Fieldset label="LP Token Information">
      {renderTokenInformation()}
    </Fieldset>
  </>
};

const UniswapInfo = ({
  pairName
}) => {
  const ethPrice = useETHPrice();
  const wbtcPrice = useWBTCPrice();

  const pairInfo = pairInfoMap[pairName]; 

  const getTokenPrice = () => {
    switch(pairInfo.name) {
      case pairInfoMap['coreDaoLp1'].name:
        return ethPrice;
      case pairInfoMap['coreDaoLp2'].name:
        return wbtcPrice;;
      case pairInfoMap['coreDaoLp3'].name:
        return 1;
    }
  };

  return (
    <div>
      <PairInfo pairName={pairName}
                friendlyPairName={pairInfo.name}
                tokenName={pairInfo.tokenName}
                friendlyTokenName={pairInfo.friendlyTokenName}
                tokenPrice={getTokenPrice()} />

      <div style={{ marginTop: '1em', textAlign: 'justify' }}>
        ** APY numbers are variable, and depend on CORE transfer volume, Ethereum, Bitcoin and CORE
        prices. CORE is an experiment in decentralized finance economics - absolutely no returns
        are guaranteed.
        </div>
      <br />
    </div>
  );
};

export default UniswapInfo;
