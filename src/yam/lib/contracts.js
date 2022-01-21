import BigNumber from 'bignumber.js/bignumber';
import * as Types from './types.js';
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import ERC20Json from '../clean_build/contracts/IERC20.json';
import YAMv2Json from '../clean_build/contracts_old/YAMv2.json';
import YAMJson from '../clean_build/contracts_old/YAMDelegator.json';
import WETHJson from './weth.json';
import UNIFactJson from './unifact2.json';
import UNIPairJson from './uni2.json';
import UNIRouterJson from './uniR.json';
import CORE from '../clean_build/contracts/CORE.json';
import FANNY from '../clean_build/contracts/FANNY.json';
import FannyRouter from '../clean_build/contracts/FannyRouter.json';
import COREVAULT from '../clean_build/contracts/CoreVault.json';
import FANNYVAULT from '../clean_build/contracts/FannyVault.json';
import COREROUTER from '../clean_build/contracts/COREv1Router.json';
import LGE2ABI from '../clean_build/contracts/cLGE.json';
import LGE3ABI from '../clean_build/contracts/CORE_LGE_3.json';

import WBTC from '../clean_build/contracts/WBTC.json';
import CBTC from '../clean_build/contracts/cBTC.json';
import cDAI from '../clean_build/contracts/cDAI.json';
import DAI from '../clean_build/contracts/DAI.json';
import CoreDAOTreasury from '../clean_build/contracts/CoreDAOTreasury.json';
import wCORE from '../clean_build/contracts/wCORE.json';
import FlashArbitrageController from '../clean_build/contracts/FlashArbitrageController.json';
import COREForkMigrator from '../clean_build/contracts/COREForkMigrator.json';
import TransferChecker from '../clean_build/contracts/TransferChecker.json';
import CoreDaoLpJson from '../clean_build/contracts/coreDaoLp.json';

const DEFAULT_CONFIRMATIONS = 1;
const DEFAULT_GAS = '6000000';
const DEFAULT_GAS_PRICE = '1000000000000';

export class Contracts {
  constructor(web3, options) {
    options = options || {};

    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations || DEFAULT_CONFIRMATIONS;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas || DEFAULT_GAS;
    this.defaultGasPrice = options.defaultGasPrice || DEFAULT_GAS_PRICE;

    // core vault
    this.COREVAULT = new this.web3.eth.Contract(COREVAULT.abi);

    // Fanny vault
    this.FANNYVAULT = new this.web3.eth.Contract(FANNYVAULT.abi);

    // Router
    this.COREROUTER = new this.web3.eth.Contract(COREROUTER.abi);
    this.FannyRouter = new this.web3.eth.Contract(FannyRouter.abi);

    //LGE2
    this.LGE2 = new this.web3.eth.Contract(LGE2ABI.abi);
    this.LGE3 = new this.web3.eth.Contract(LGE3ABI.abi);

    //Executor flash arb
    this.ARBITRAGECONTROLLER = new this.web3.eth.Contract(FlashArbitrageController.abi);
    this.COREFORKMIGRATOR = new this.web3.eth.Contract(COREForkMigrator.abi);

    this.TRANSFERCHECKER = new this.web3.eth.Contract(TransferChecker.abi);

    this.CoreDAOTreasury = new this.web3.eth.Contract(CoreDAOTreasury);

    // Uniswap stuff
    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);

    /// Liquidity tokens
    this.UNIUSDT = new this.web3.eth.Contract(UNIPairJson);
    this.WBTCxWETH = new this.web3.eth.Contract(UNIPairJson);
    this.genericUNIPair = new this.web3.eth.Contract(UNIPairJson);
    this.encoreLP = new this.web3.eth.Contract(UNIPairJson);
    this.unicoreLP = new this.web3.eth.Contract(UNIPairJson);
    this.tensLP = new this.web3.eth.Contract(UNIPairJson);
    this.coreDaoLp1 = new this.web3.eth.Contract(CoreDaoLpJson);
    this.coreDaoLp2 = new this.web3.eth.Contract(CoreDaoLpJson);
    this.coreDaoLp3 = new this.web3.eth.Contract(CoreDaoLpJson);

    // Core tokens
    this.core = new this.web3.eth.Contract(CORE.abi);
    this.wCORE = new this.web3.eth.Contract(wCORE.abi);
    this.fanny = new this.web3.eth.Contract(FANNY.abi);
    this.cDAI = new this.web3.eth.Contract(cDAI.abi);
    this.DAI = new this.web3.eth.Contract(DAI.abi);
    this.CBTC = new this.web3.eth.Contract(CBTC.abi);

    // Core Pairs
    this.CORExWETH = new this.web3.eth.Contract(UNIPairJson);
    this.CORExcBTC = new this.web3.eth.Contract(UNIPairJson);
    this.FANNYxCORE = new this.web3.eth.Contract(UNIPairJson);
    this.cDAIxwCORE = new this.web3.eth.Contract(UNIPairJson);
  
    // Main token
    this.yam = new this.web3.eth.Contract(YAMJson.abi);
    this.yamV2 = new this.web3.eth.Contract(YAMv2Json.abi);

    //ERC95
    this.WBTC = new this.web3.eth.Contract(WBTC.abi);

    this.encore = new this.web3.eth.Contract(CORE.abi);
    this.yfi = new this.web3.eth.Contract(ERC20Json.abi);
    this.comp = new this.web3.eth.Contract(ERC20Json.abi);
    this.link = new this.web3.eth.Contract(ERC20Json.abi);
    this.lend = new this.web3.eth.Contract(ERC20Json.abi);
    this.snx = new this.web3.eth.Contract(ERC20Json.abi);
    this.mkr = new this.web3.eth.Contract(ERC20Json.abi);
    this.erc20 = new this.web3.eth.Contract(ERC20Json.abi);
    this.genericERC20 = new this.web3.eth.Contract(CORE.abi); // CORE ABI has decimals ERC20 doesn't...

    this.weth = new this.web3.eth.Contract(WETHJson);
  }

  setProvider(provider, networkId) {
    this.yam.setProvider(provider);
  }

  setContractsProvider(provider, networkId) {
    const contracts = [{ contract: this.yamV2, json: YAMv2Json }];

    contracts.forEach(contract =>
      this.setContractProvider(contract.contract, contract.json, provider, networkId)
    );
    // this.SUSHI.options.address = addressMap["SUSHI"]
    this.yfi.options.address = addressMap['YFI'];
    this.WBTC.options.address = addressMap['WBTC'];

    this.WBTCxWETH.options.address = addressMap['WBTCxWETH'];
    this.uni_fact.options.address = addressMap['uniswapFactoryV2'];
    this.uni_router.options.address = addressMap['UNIRouter'];

    this.ARBITRAGECONTROLLER.options.address = addressMap['ARBITRAGECONTROLLER'];
    this.COREFORKMIGRATOR.options.address = addressMap['COREFORKMIGRATOR'];
    this.TRANSFERCHECKER.options.address = addressMap['TRANSFERCHECKER'];

    this.encoreLP.options.address = addressMap['encoreLP'];
    this.unicoreLP.options.address = addressMap['unicoreLP'];
    this.tensLP.options.address = addressMap['tensLP'];

    this.weth.options.address = addressMap['WETH'];
    this.snx.options.address = addressMap['SNX'];
    this.comp.options.address = addressMap['COMP'];
    this.link.options.address = addressMap['LINK'];
    this.lend.options.address = addressMap['LEND'];
    this.mkr.options.address = addressMap['MKR'];
    this.encore.options.address = addressMap['encore'];
    this.UNIUSDT.options.address = addressMap['UNIUSDT'];
    this.CoreDAOTreasury.options.address = addressMap['coredaoTreasury'];

    // Vaults
    this.COREVAULT.options.address = addressMap['COREVAULT'];
    this.FANNYVAULT.options.address = addressMap['FANNYVAULT'];
  
    // Routers
    this.FannyRouter.options.address = addressMap['FannyRouter'];
    this.COREROUTER.options.address = addressMap['COREROUTER'];

    // LGEs
    this.LGE2.options.address = addressMap['LGE2'];
    this.LGE3.options.address = addressMap['LGE3'];

    // Core tokens
    this.core.options.address = addressMap['core'];
    this.wCORE.options.address = addressMap['wCORE'];
    this.fanny.options.address = addressMap['fanny'];
    this.CBTC.options.address = addressMap['CBTC'];
    this.cDAI.options.address = addressMap['cDAI'];
    this.DAI.options.address = addressMap['DAI'];
  
    // Core pairs
    this.CORExcBTC.options.address = addressMap['CORExcBTC'];
    this.CORExWETH.options.address = addressMap['CORExWETH'];
    this.cDAIxwCORE.options.address = addressMap['cDAIxwCORE'];
    this.FANNYxCORE.options.address = addressMap['FANNYxCORE'];
    
    this.coreDaoLp1.options.address = addressMap['coreDaoLp1'];
    this.coreDaoLp2.options.address = addressMap['coreDaoLp2'];
    this.coreDaoLp3.options.address = addressMap['coreDaoLp3'];

    this.pools = [];
  }

  setDefaultAccount(account) {
    this.yam.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(method, options) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log('estimating gas');
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise((resolve, reject) => {
        promi.on('error', error => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });

        promi.on('transactionHash', txHash => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.RESOLVED;
            resolve(txHash);
            if (t !== Types.ConfirmationType.Both) {
              const anyPromi = promi;
              anyPromi.off();
            }
          }
        });
      });
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise((resolve, reject) => {
        promi.on('error', error => {
          if (
            (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED) &&
            confirmationOutcome === OUTCOMES.INITIAL
          ) {
            confirmationOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });

        const desiredConf = confirmations || this.defaultConfirmations;
        if (desiredConf) {
          promi.on('confirmation', (confNumber, receipt) => {
            if (confNumber >= desiredConf) {
              if (confirmationOutcome === OUTCOMES.INITIAL) {
                confirmationOutcome = OUTCOMES.RESOLVED;
                resolve(receipt);
                const anyPromi = promi;
                anyPromi.off();
              }
            }
          });
        } else {
          promi.on('receipt', receipt => {
            confirmationOutcome = OUTCOMES.RESOLVED;
            resolve(receipt);
            const anyPromi = promi;
            anyPromi.off();
          });
        }
      });
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
        this.notifier.hash(transactionHash);
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
      this.notifier.hash(transactionHash);
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(method, options) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(contract, contractJson, provider, networkId) {
    contract.setProvider(provider);
    try {
      contract.options.address =
        contractJson.networks[networkId] && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
