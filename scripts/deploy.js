const { ethers } = require("hardhat");

async function main() {
    const { ethers } = require("hardhat");

    const VotingPlatform = await ethers.getContractFactory('VotingPlatform');
    console.log("Fazendo deploy do contrato...");
    
    const votingPlatform = await VotingPlatform.deploy();

    // Esta é a forma correta de aguardar o deploy ser finalizado
    await votingPlatform.waitForDeployment();

    console.log(
        `VotingPlatform implantado no endereço: ${await votingPlatform.getAddress()}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
