const TRUSTWALL_REPOSITORY_ASSETS_BASE_DIR = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets'
const WBTC_LOGO_URL = 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744';
const WBTC_CHECKSUM_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const getTokenLogo = (web3, address) => {
  const checksumAddress = web3.utils.toChecksumAddress(address);

  switch(checksumAddress) {
    case WBTC_CHECKSUM_ADDRESS:
      return WBTC_LOGO_URL;
    default:
      return `${TRUSTWALL_REPOSITORY_ASSETS_BASE_DIR}/${checksumAddress}/logo.png`;
  }
};

export default {
  get: getTokenLogo
}