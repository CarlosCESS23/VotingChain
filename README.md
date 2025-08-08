# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


Na pasta raiz, inicialize:


npm init -y

O pacote hardhat-toolbox é recomendado porque já inclui tudo o que você precisa (Ethers.js, Chai, etc.)

npm install --save-dev @nomicfoundation/hardhat-toolbox

Com o Hardhat instalado, execute o comando abaixo para que ele crie os arquivos de configuração e as pastas de exemplo (contracts, scripts, test).

npx hardhat

depois dê o npx hardhat run scripts/deploy.js --network localhost
