// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "remix_tests.sol";
import "../contracts/Voting.sol";

contract VotingPlatformTest {
    VotingPlatform votingPlatform;

    address creator = address(this);
    address voter1 = address(0x1);
    address voter2 = address(0x2);

    function beforeEach() public {
        votingPlatform = new VotingPlatform();
    }

    /// Testa a criacao de uma votacao
    function testCreatePoll() public {
        votingPlatform.createPoll("Quem deve vencer o concurso?");
        (
            uint256 id,
            ,
            string memory title,
            ,
            uint256 candidateCount
        ) = votingPlatform.polls(1);

        Assert.equal(id, 1, "ID da votacao deve ser 1");
        Assert.equal(
            title,
            "Quem deve vencer o concurso?",
            "Titulo da votacao incorreto"
        );
        Assert.equal(
            candidateCount,
            0,
            "Votacao recem criada deve ter 0 candidatos"
        );
    }

    /// Testa a adicao de candidatos
    function testAddCandidate() public {
        votingPlatform.createPoll("Qual modelo?");
        votingPlatform.addCandidate(1, "Modelo A");
        votingPlatform.addCandidate(1, "Modelo B");

        (, string memory name1, uint256 votes1) = votingPlatform.candidates(
            1,
            1
        );
        (, string memory name2, uint256 votes2) = votingPlatform.candidates(
            1,
            2
        );

        Assert.equal(name1, "Modelo A", "Nome do candidato 1 incorreto");
        Assert.equal(name2, "Modelo B", "Nome do candidato 2 incorreto");
        Assert.equal(votes1, 0, "Candidato 1 deve iniciar com 0 votos");
        Assert.equal(votes2, 0, "Candidato 2 deve iniciar com 0 votos");
    }

    /// Testa que a votacao so pode comecar com candidatos
    function testCannotStartWithoutCandidates() public {
        votingPlatform.createPoll("Sem candidatos");
        try votingPlatform.startVoting(1) {
            Assert.ok(false, "Votacao nao deveria iniciar sem candidatos");
        } catch {}
    }

    /// Testa o fluxo completo de votação
    function testVotingFlow() public {
        votingPlatform.createPoll("Votacao");
        votingPlatform.addCandidate(1, "A");
        votingPlatform.addCandidate(1, "B");
        votingPlatform.startVoting(1);

        // Simula o voto do contrato atual
        votingPlatform.vote(1, 1);
        (, , uint256 voteCount) = votingPlatform.candidates(1, 1);
        Assert.equal(voteCount, 1, "Candidato 1 deve ter 1 voto");

        // Simula outro usuario votando via call
        (bool success, ) = address(votingPlatform).call(
            abi.encodeWithSignature("vote(uint256,uint256)", 1, 2)
        );
        Assert.ok(success, "Outro usuario deve conseguir votar");

        (, , uint256 voteCount2) = votingPlatform.candidates(1, 2);
        Assert.equal(voteCount2, 1, "Candidato 2 deve ter 1 voto");
    }

    /// Testa que o mesmo usuario nao pode votar duas vezes
    function testCannotVoteTwice() public {
        votingPlatform.createPoll("Duplicado");
        votingPlatform.addCandidate(1, "A");
        votingPlatform.startVoting(1);

        votingPlatform.vote(1, 1);

        try votingPlatform.vote(1, 1) {
            Assert.ok(false, "Usuario nao pode votar duas vezes");
        } catch {}
    }

    /// Testa encerramento da votacao
    function testEndVoting() public {
        votingPlatform.createPoll("Finalizar");
        votingPlatform.addCandidate(1, "A");
        votingPlatform.startVoting(1);
        votingPlatform.endVoting(1);
        (, , , VotingPlatform.VotingState state, ) = votingPlatform.polls(1);
        Assert.equal(
            uint256(state),
            uint256(VotingPlatform.VotingState.Closed),
            "Votacao deveria estar encerrada"
        );
    }
}
