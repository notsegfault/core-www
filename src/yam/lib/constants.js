import BigNumber from 'bignumber.js/bignumber';

export const CHAIN_ID = 1;
export const SUBTRACT_GAS_LIMIT = 100000;
export const APP_VERSION = "2.3.2";

const ONE_MINUTE_IN_SECONDS = new BigNumber(60);
const ONE_HOUR_IN_SECONDS = ONE_MINUTE_IN_SECONDS.times(60);
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS.times(24);
const ONE_YEAR_IN_SECONDS = ONE_DAY_IN_SECONDS.times(365);

export const CoreBurnedDuneAnalytics = "https://dune.xyz/embeds/377149/718378/0f6b7a2a-c1d3-42c5-94ab-cc466f9f2ffc";

export const DATA_UNAVAILABLE = '--';

export const INTEGERS = {
  ONE_MINUTE_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  ZERO: new BigNumber(0),
  ONE: new BigNumber(1),
  ONES_31: new BigNumber('4294967295'), // 2**32-1
  ONES_127: new BigNumber('340282366920938463463374607431768211455'), // 2**128-1
  ONES_255: new BigNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  ), // 2**256-1
  INTEREST_RATE_BASE: new BigNumber('1e18'),
};

export const web3Url = "https://cloudflare-eth.com/";

export const addressMap = {
  // uni shit
  uniswapFactory: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  UNIRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',

  // Core pairs
  CORExcBTC: '0x6fad7d44640c5cd0120deec0301e8cf850becb68',
  CORExWETH: '0x32ce7e48debdccbfe0cd037cc89526e4382cb81b',
  cDAIxwCORE: '0x01AC08E821185b6d87E68c67F9dc79A8988688EB',
  FANNYxCORE: '0x85d9DCCe9Ea06C2621795889Be650A8c3Ad844BB',

  // LGEs
  LGE2: '0xf7ca8f55c54cbb6d0965bc6d65c43adc500bc591',
  LGE3: '0xaac50b95fbb13956d7c45511f24c3bf9e2a4a76b',

  // Vaults
  COREVAULT: '0xC5cacb708425961594B63eC171f4df27a9c0d8c9',
  FANNYVAULT: '0xbb791Bc6106e4D949863E2aB76fc01AC0A9D7816',

  // Routers
  COREROUTER: '0x48ad04e9302e79dd5760eaf3eaec5335b8abd0fd',
  FannyRouter: '0xe3AD8863dd3229C5662FeE9175656990caE5Cb37',

  ARBITRAGECONTROLLER: "0x220564c9bd38aa1240c3507007970d9e30c0657d",
  COREFORKMIGRATOR: "0x5dca4093bfe88d6fd5511fb78f6a777d47314d35",
  TRANSFERCHECKER: "0x2e2A33CECA9aeF101d679ed058368ac994118E7a",

  // fork lp
  encoreLP: "0x2e0721E6C951710725997928DcAAa05DaaFa031B",
  unicoreLP: "0xd5058BDc884e2F63607Ef71ADaBf1a00269ee325",
  tensLP: "0xB1b537B7272BA1EDa0086e2f480AdCA72c0B511C",

  // Liquidity tokens
  UNIUSDT: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852',
  WBTCxWETH: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',

  // Single tokens
  core: '0x62359ed7505efc61ff1d56fef82158ccaffa23d7',
  wCORE: '0x17b8c1a92b66b1cf3092c5d223cb3a129023b669',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  CBTC: '0x7b5982dcAB054C377517759d0D2a3a5D02615AB8',
  fanny: '0x8ad66F7E0E3e3dC331D3dbF2C662d7aE293C1Fe0',
  cDAI:  '0x00a66189143279b6db9b77294688f47959f37642',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',


  // CoreDAO Voucher Lps
  coreDaoLp1: '0xF6Dd68031a22c8A3F1e7a424cE8F43a1e1A3be3E',
  coreDaoLp2: '0xb8ee07b5ed2ff9dae6c504c9dee84151f844a591',
  coreDaoLp3: '0xcA00F8eef4cE1F9183E06fA25fE7872fEDcf7456',
  coreDAO: '0xf66Cd2f8755a21d3c8683a10269F795c0532Dd58',

  coredaoTreasury: '0xe508a37101FCe81AB412626eE5F1A648244380de',

  // fork tokens
  encore: '0xe0E4839E0c7b2773c58764F9Ec3B9622d01A0428'
};

verifyAddressMap(addressMap);

export const addressDecimalsMap = {};
addressDecimalsMap[addressMap.WETH] = 18;
addressDecimalsMap[addressMap.core] = 18;
addressDecimalsMap[addressMap.wCORE] = 18;
addressDecimalsMap[addressMap.WBTCxWETH] = 18;
addressDecimalsMap[addressMap.WBTC] = 8;
addressDecimalsMap[addressMap.fanny] = 18;
addressDecimalsMap[addressMap.cDAI] = 18;
addressDecimalsMap[addressMap.DAI] = 18;

export const tokenMap = {};
tokenMap[addressMap.WETH] = { name: 'WETH', friendlyName: 'ETH', decimals: addressDecimalsMap[addressMap.WETH] };
tokenMap[addressMap.WBTC] = { name: 'WBTC', friendlyName: 'BTC', decimals: addressDecimalsMap[addressMap.WBTC] };
tokenMap[addressMap.CBTC] = { name: 'CBTC', ...tokenMap[addressMap.WBTC] };
tokenMap[addressMap.cDAI] = { name: 'cDAI', friendlyName: 'DAI', decimals: addressDecimalsMap[addressMap.cDAI] };
tokenMap[addressMap.DAI] = { name: 'DAI', ...tokenMap[addressMap.cDAI] };
tokenMap[addressMap.wCORE] = { name: 'wCORE', friendlyName: 'CORE', decimals: addressDecimalsMap[addressMap.wCORE] };
tokenMap[addressMap.core] = { name: 'CORE', friendlyName: 'CORE', decimals: addressDecimalsMap[addressMap.core] };
tokenMap[addressMap.fanny] = { name: 'FANNY', friendlyName: 'FANNY', decimals: addressDecimalsMap[addressMap.fanny] };
tokenMap[addressMap.WBTCxWETH] = { name: 'WBTC-WETH LP', friendlyName: 'WBTC-WETH LP', decimals: addressDecimalsMap[addressMap.WBTCxWETH] };

export const pairInfoMap = {};
pairInfoMap['coreDaoLp1'] = {
  name: 'CORE/WETH',
  reserve0: tokenMap[addressMap.core],
  reserve1: tokenMap[addressMap.WETH],
  wrappedPairName: 'CORExWETH',
  supplyScale: 1,
  unit: 'LP',
  tokenName: 'WETH',
  friendlyTokenName: 'ETH',
  pid: 0,
  address: addressMap['coreDaoLp1']
};
pairInfoMap['coreDaoLp2'] = {
  name: 'CORE/CBTC',
  reserve0: tokenMap[addressMap.core],
  reserve1: tokenMap[addressMap.CBTC],
  wrappedPairName: 'CORExcBTC',
  supplyScale: 1e5,
  unit: 'cmLP',
  tokenName: 'CBTC',
  friendlyTokenName: 'BTC',
  pid: 1,
  address: addressMap['coreDaoLp2']
};
pairInfoMap['coreDaoLp3'] = {
  name: 'CORE/DAI',
  reserve0: tokenMap[addressMap.cDAI],
  reserve1: tokenMap[addressMap.wCORE],
  wrappedPairName: 'cDAIxwCORE',
  supplyScale: 1,
  unit: 'LP',
  tokenName: 'cDAI',
  friendlyTokenName: 'DAI',
  pid: 2,
  address: addressMap['coreDaoLp3']
};

export const ethereumStats = {};
ethereumStats.approximatedBlockPerDay = 6650;
ethereumStats.approximatedBlockPerYear = ethereumStats.approximatedBlockPerDay * 365;

export const yieldPercentagePerPairs = {
  'CORExWETH': 0.6,
  'CORExcBTC': 0.2,
  'cDAIxwCORE': 0.2,
};

/**
 * Make sure there's no duplicated address in the address map.
 */
function verifyAddressMap() {
  const values = Object.values(addressMap);
  const findDuplicated = values => values.filter((item, index) => values.indexOf(item) != index);
  const duplicatedAddress = findDuplicated(values);

  if (duplicatedAddress.length !== 0) {
    throw new Error(`Duplicates found in the address map: ${duplicatedAddress.join(', ')}`);
  }
};

export const getPairFromWrappedPair = pairName => {
  const keys = Object.keys(pairInfoMap);

  for(const key of keys) {
      const info = pairInfoMap[key];

      if(info.wrappedPairName === pairName) {
          return info;
      }
  }
};
