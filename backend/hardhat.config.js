require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require('hardhat-contract-sizer')

const RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL || "https://eth-rinkeby/example"
const OWNER_KEY = process.env.OWNER_KEY || "0xkey"
const CAFE_OWNER_KEY = process.env.CAFE_OWNER_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API = process.env.COINMARKETCAP_API || "key"

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
        ],
    },
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [OWNER_KEY, CAFE_OWNER_KEY],
            chainId: 4,
            blockConfirmation: 10,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API,
    },
}
