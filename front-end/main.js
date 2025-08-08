import { ethers } from "ethers";
// Importa o ABI do arquivo JSON que você colocará na mesma pasta.
import VotingArtifact from '../artifacts/contracts/Voting.sol/VotingPlatform.json';

// ----- CONSTANTES GLOBAIS -----
const contractAddress = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";

// ----- ELEMENTOS DA PÁGINA -----
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');
const candidatesList = document.getElementById('candidates-list');
const feedback = document.getElementById('feedback');

// ----- VARIÁVEIS GLOBAIS -----
let provider;
let signer;
let contract;

// ----- FUNÇÕES -----

// Função principal que inicializa a aplicação
function init() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detectado!');
        provider = new ethers.BrowserProvider(window.ethereum);
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        provider.listAccounts().then(accounts => {
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            }
        });
    } else {
        connectButton.disabled = true;
        walletStatus.textContent = "MetaMask não detectado. Por favor, instale a extensão.";
    }
}

// Lida com a mudança de contas na MetaMask
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        walletStatus.textContent = "Sua carteira não está conectada.";
        candidatesList.innerHTML = "<p>Conecte sua carteira para ver os candidatos.</p>";
        signer = null;
        contract = null;
    } else {
        await connectWallet();
    }
}

// Conecta a carteira do usuário
async function connectWallet() {
    try {
        signer = await provider.getSigner();
        const walletAddress = await signer.getAddress();
        walletStatus.innerHTML = `Conectado com a carteira: <br><strong>${walletAddress}</strong>`;
        
        // Cria a instância do contrato usando o ABI importado do arquivo JSON
        contract = new ethers.Contract(contractAddress, VotingArtifact.abi, signer);
        
        await loadCandidates();
    } catch (err) {
        console.error("Erro ao conectar a carteira:", err);
        walletStatus.textContent = `Erro ao conectar: ${err.message}`;
    }
}

// Carrega e exibe os candidatos do contrato
async function loadCandidates() {
    if (!contract) return;
    feedback.textContent = "Carregando candidatos...";
    candidatesList.innerHTML = ""; 

    try {
        // Assumindo que queremos sempre a votação de ID 1
        const allCandidates = await contract.getAllCandidates(1);
        
        allCandidates.forEach(candidate => {
            const candidateDiv = document.createElement('div');
            candidateDiv.className = 'candidate';
            candidateDiv.innerHTML = `
                <span>${candidate.name} (Votos: ${candidate.voteCount.toString()})</span>
                <button data-id="${candidate.id.toString()}">Votar</button>
            `;
            candidatesList.appendChild(candidateDiv);
        });
        feedback.textContent = "";
    } catch (err) {
        console.error("Erro ao carregar candidatos:", err);
        feedback.textContent = `Não foi possível carregar os candidatos. Verifique se a votação de ID 1 existe.`;
    }
}

// Função para votar em um candidato
async function vote(candidateId) {
    if (!contract) return;
    feedback.textContent = `Processando seu voto para o candidato ${candidateId}...`;
    try {
        // Assumindo que estamos votando na votação de ID 1
        const tx = await contract.vote(1, candidateId); 
        await tx.wait(); 
        feedback.textContent = `Voto para o candidato ${candidateId} computado com sucesso!`;
        await loadCandidates();
    } catch (err) {
        console.error("Erro ao votar:", err);
        const errorMessage = err.reason || err.message;
        feedback.textContent = `Erro: ${errorMessage}`;
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

// Inicia a aplicação quando a página carrega
init();