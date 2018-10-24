# STEPS TO RUN GETH AND CONNECT

## Install gETH

### Run locally
Download gETH from https://geth.ethereum.org/downloads/

Run gETH with command:
```bash
geth --rinkeby --ws --wsport=8546 --wsorigins="*" --datadir=$HOME/.rinkeby --cache=512 --rpc --rpcapi="personal,eth,network" --rpcport=8545 --fast --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303
```
Source: https://ethereum.stackexchange.com/questions/25451/infura-web3-provider-for-events-get-watch

### Run in a Docker container
```bash
docker run -d --name ethereum-node -v /root/docker/geth:/rinkeby -p 8545:8545 -p 8546:8546 -p 30303:30303 ethereum/client-go --rinkeby --ws --wsaddr="0.0.0.0" --wsport=8546 --wsorigins="*" --datadir=/rinkeby --cache=512 --rpc --rpcaddr="0.0.0.0" --rpcapi="personal,eth,network" --rpcport=8545 --syncmode "fast"
```

## Import account
```bash
geth account import --password <FILE_WITH_PASSWORD> <FILE_WITH_PRIVATE_KEY.txt>
```
Source: https://github.com/ethereum/go-ethereum/wiki/Managing-your-accounts

### Alternative method to import account
```bash
# attach to geth
geth attach

# Unlock account
personal.importRawKey("<PRIVATE_KEY>", "<DEFINE_PASSWORD>")
```

## Unlock account
In another terminal, run the following commands:
```bash
# attach to geth
geth attach

# Unlock account
personal.unlockAccount(eth.accounts[0], "<DEFINE_PASSWORD>")
```

### Programmatically
```js
web3.eth.personal.unlockAccount("<ACCOUNT_ADDRESS>", "<DEFINE_PASSWORD_1>")
.then(result => {
console.log('its ok ', result)
})
```


## Other stuff
Source: https://ethereum.stackexchange.com/questions/6903/unlocking-accounts-and-making-transactions-in-web3-js/12188?noredirect=1#comment13537_12188
