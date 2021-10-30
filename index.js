const dotenv = require('dotenv');
const ethers = require('ethers');
const config = require('./config.json');
const { BigNumber } = require('@ethersproject/bignumber');

dotenv.config();

const numsWallet = config.numsWallet;
const privateKeys = [];

for (let i = 1; i <= numsWallet; i++) {
    if (process.env[`PRIVATE_KEY_${i}`]) {
        privateKeys.push(process.env[`PRIVATE_KEY_${i}`]);
    }
}

const provider = new ethers.providers.JsonRpcProvider(config.providerUrl);

const walletsWithProvider = privateKeys.map(privateKey => new ethers.Wallet(privateKey, provider));
const contract = new ethers.Contract(config.contractAddress, config.abi, provider);

const contractsWithSigner = walletsWithProvider.map(wallet => contract.connect(wallet));

function calculateGasMargin(value) {
    return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

async function doAction(contract) {
    try {
        const gasLimit = calculateGasMargin(
            await contract.estimateGas.buy('250000000')
        );

        const result = await contract.buy(
            '250000000',
            {
                gasLimit,
                gasPrice: config.gasPrices[config.gasPrice]
            }
        );

        console.log(`result`, result);
    } catch (error) {
        console.log(`error`, error);
    }
}

(async () => {
    for (const contract of contractsWithSigner) {
        doAction(contract);
    }
})();
