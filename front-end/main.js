import { ethers } from "ethers";
import VotingArtifact from '../artifacts/contracts/Voting.sol/VotingPlatform.json';

// ----- CONSTANTES GLOBAIS -----
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Lembre-se de colar o endereço do seu contrato

// ----- ELEMENTOS DA PÁGINA -----
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');
const candidatesList = document.getElementById('candidates-list');
const feedback = document.getElementById('feedback');

// --- NOVOS ELEMENTOS ---
const pollTitleInput = document.getElementById('pollTitleInput');
const createPollButton = document.getElementById('createPollButton');
const candidateNameInput = document.getElementById('candidateNameInput');
const addCandidateButton = document.getElementById('addCandidateButton');
const startVotingButton = document.getElementById('startVotingButton');
const endVotingButton = document.getElementById('endVotingButton');
const checkWinnerButton = document.getElementById('checkWinnerButton');


// ----- VARIÁVEIS GLOBAIS -----
let provider;
let signer;
let contract;
const pollId = 1; // Vamos fixar o ID da votação em 1 para simplificar

// ----- FUNÇÕES -----

function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.BrowserProvider(window.ethereum);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        provider.listAccounts().then(accounts => {
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            }
        });
    } else {
        connectButton.disabled = true;
        walletStatus.textContent = "MetaMask não detectado.";
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        walletStatus.textContent = "Sua carteira não está conectada.";
        signer = null;
        contract = null;
    } else {
        await connectWallet();
    }
}

async function connectWallet() {
    try {
        signer = await provider.getSigner();
        const walletAddress = await signer.getAddress();
        walletStatus.innerHTML = `Conectado com: <br><strong>${walletAddress}</strong>`;
        contract = new ethers.Contract(contractAddress, VotingArtifact.abi, signer);
        await loadCandidates();
    } catch (err) {
        console.error("Erro ao conectar:", err);
    }
}

async function loadCandidates() {
    if (!contract) return;
    feedback.textContent = "Carregando candidatos...";
    candidatesList.innerHTML = ""; 

    try {
        const allCandidates = await contract.getAllCandidates(pollId);
        allCandidates.forEach(c => {
            const candidateDiv = document.createElement('div');
            candidateDiv.className = 'candidate';
            candidateDiv.innerHTML = `
                <span>${c.name} (Votos: ${c.voteCount.toString()})</span>
                <button data-id="${c.id.toString()}">Votar</button>
            `;
            candidatesList.appendChild(candidateDiv);
        });
        feedback.textContent = "";
    } catch (err) {
        feedback.textContent = `Ainda não há candidatos para a votação 1. Crie a votação e adicione-os.`;
    }
}

async function vote(candidateId) {
    if (!contract) return;
    feedback.textContent = `Processando seu voto...`;
    try {
        const tx = await contract.vote(pollId, candidateId); 
        await tx.wait(); 
        feedback.textContent = `Voto computado com sucesso!`;
        await loadCandidates();
    } catch (err) {
        console.error("Erro ao votar:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}

// --- NOVAS FUNÇÕES DE GERENCIAMENTO ---

async function createPoll() {
    if (!contract || !pollTitleInput.value) return;
    feedback.textContent = "Criando votação...";
    try {
        const tx = await contract.createPoll(pollTitleInput.value);
        await tx.wait();
        feedback.textContent = `Votação "${pollTitleInput.value}" criada com sucesso! O ID dela é 1.`;
        pollTitleInput.value = "";
    } catch (err) {
        console.error("Erro ao criar votação:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}

async function addCandidate() {
    if (!contract || !candidateNameInput.value) return;
    feedback.textContent = `Adicionando candidato...`;
    try {
        const tx = await contract.addCandidate(pollId, candidateNameInput.value);
        await tx.wait();
        feedback.textContent = `Candidato "${candidateNameInput.value}" adicionado!`;
        candidateNameInput.value = "";
        await loadCandidates(); // Atualiza a lista de candidatos
    } catch (err) {
        console.error("Erro ao adicionar candidato:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}

async function startCurrentVoting() {
    if (!contract) return;
    feedback.textContent = "Iniciando a votação...";
    try {
        const tx = await contract.startVoting(pollId);
        await tx.wait();
        feedback.textContent = "Votação iniciada! Agora já é possível votar.";
    } catch (err) {
        console.error("Erro ao iniciar votação:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}

async function endCurrentVoting() {
    if (!contract) return;
    feedback.textContent = "Encerrando a votação...";
    try {
        const tx = await contract.endVoting(pollId);
        await tx.wait();
        feedback.textContent = "Votação encerrada com sucesso!";
    } catch (err) {
        console.error("Erro ao encerrar votação:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}

async function checkWinner() {
    if (!contract) return;
    feedback.textContent = "Verificando o vencedor...";
    try {
        const currentPoll = await contract.polls(pollId);
        if (currentPoll.state !== 2n) { // O enum Closed é 2. Usamos 2n para BigInt.
            feedback.textContent = "A votação precisa ser encerrada para se verificar o vencedor.";
            return;
        }

        const allCandidates = await contract.getAllCandidates(pollId);
        if (allCandidates.length === 0) {
            feedback.textContent = "Não há candidatos nesta votação.";
            return;
        }

        let winner = allCandidates[0];
        for (let i = 1; i < allCandidates.length; i++) {
            if (allCandidates[i].voteCount > winner.voteCount) {
                winner = allCandidates[i];
            }
        }
        
        const winners = allCandidates.filter(c => c.voteCount === winner.voteCount);

        if (winners.length > 1) {
            feedback.textContent = `Houve um empate entre ${winners.length} candidatos!`;
        } else {
            feedback.textContent = `O vencedor é ${winner.name} com ${winner.voteCount} voto(s)!`;
        }

    } catch (err) {
        console.error("Erro ao verificar vencedor:", err);
        feedback.textContent = `Erro: ${err.reason || err.message}`;
    }
}


// ----- EVENT LISTENERS -----
connectButton.addEventListener('click', connectWallet);

candidatesList.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-id')) {
        const candidateId = event.target.getAttribute('data-id');
        vote(candidateId);
    }
});

// --- NOVOS LISTENERS ---
createPollButton.addEventListener('click', createPoll);
addCandidateButton.addEventListener('click', addCandidate);
startVotingButton.addEventListener('click', startCurrentVoting);
endVotingButton.addEventListener('click', endCurrentVoting);
checkWinnerButton.addEventListener('click', checkWinner);


// Inicia a aplicação quando a página carrega
init();