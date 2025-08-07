import {ethers} from 'hardhat'

async function main() {
    const VotingPlatform = await ethers.getContractFactory('VotingPlatform')
    const votingPlatform = await VotingPlatform.deploy()

    await votingPlatform.deployed()

    console.log(
        `VotingPlatform implantado no endereço: ${votingPlatform.address}`
    )
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
