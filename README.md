# 🗳️ VotingChain: Sistema de Votação Descentralizado

Uma aplicação descentralizada (DApp) interativa que permite **criar e gerenciar votações seguras e transparentes** na blockchain.

Desenvolvido com **Solidity** para o smart contract e **Ethers.js** para a interação no front-end, o sistema garante que cada voto seja imutável e publicamente verificável, eliminando a necessidade de intermediários e aumentando a confiança no processo eleitoral.

---

## 📌 FUNCIONALIDADES

- **Criação de Votações**: Administradores podem iniciar novas votações com um título específico.
- **Gerenciamento de Candidatos**: Adicione candidatos a uma votação antes que ela comece.
- **Controle do Período de Votação**: O criador da votação tem controle total para iniciar e encerrar o período de votação.
- **Integração com MetaMask**: Usuários podem conectar suas carteiras MetaMask para participar da votação de forma segura.
- **Voto Único por Carteira**: O sistema garante que cada endereço de carteira possa votar apenas uma vez por votação, prevenindo fraudes.
- **Visualização em Tempo Real**: Acompanhe a contagem de votos de cada candidato diretamente na interface.
- **Apuração Transparente**: Verifique o vencedor da votação assim que ela for encerrada pelo administrador.

---

## 🧠 VISÃO GERAL TÉCNICA

### Fluxo de Funcionamento:

1.  **Criação e Configuração**: O administrador cria uma nova votação e adiciona os candidatos através da interface.
2.  **Início da Votação**: O administrador inicia o período de votação, permitindo que os usuários participem.
3.  **Conexão do Usuário**: O eleitor conecta sua carteira MetaMask à aplicação.
4.  **Voto**: O usuário seleciona um candidato e submete seu voto, que é registrado como uma transação na blockchain.
5.  **Encerramento**: Após o término do período, o administrador encerra a votação.
6.  **Verificação**: Qualquer pessoa pode verificar o vencedor e o resultado final, que é permanentemente armazenado no smart contract.

---

## 📁 ESTRUTURA DO CÓDIGO

| Arquivo/Diretório | Descrição |
| :--- | :--- |
| `contracts/Voting.sol` | Smart contract principal escrito em Solidity que contém toda a lógica da votação. |
| `scripts/deploy.js` | Script para fazer o deploy do smart contract em uma rede blockchain. |
| `hardhat.config.js` | Arquivo de configuração do ambiente de desenvolvimento Hardhat. |
| `front-end/` | Contém todos os arquivos da interface do usuário (HTML, CSS, JS). |
| `front-end/main.js` | Lógica principal do front-end, responsável pela interação com a MetaMask e o smart contract. |
| `tests/Voting.t.sol` | Testes em Solidity para garantir o funcionamento correto do smart contract. |

---

## 🛠️ TECNOLOGIAS UTILIZADAS

| Tecnologia | Finalidade |
| :--- | :--- |
| **Solidity** | Linguagem para escrever o smart contract. |
| **Hardhat** | Ambiente de desenvolvimento para compilação, teste e deploy de smart contracts. |
| **Ethers.js** | Biblioteca para interagir com a blockchain Ethereum a partir do front-end. |
| **Vite** | Ferramenta de build e servidor de desenvolvimento para o front-end. |
| **MetaMask** | Carteira de criptomoedas usada para interagir com a DApp. |
| **JavaScript, HTML, CSS** | Tecnologias padrão para a construção da interface web. |

---

## 📦 COMO EXECUTAR LOCALMENTE

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 20.x ou superior)
-   [MetaMask](https://metamask.io/) (extensão para navegador)

### 1. Clone o Repositório

```bash
git clone https://github.com/CarlosCESS23/VotingChain.git
cd VotingChain
```

### 2. Instale as Dependências

Instale as dependências tanto para o ambiente Hardhat quanto para o front-end:

```bash
# Instalar dependências da raiz (Hardhat)
npm install
npm install --save-dev @nomicfoundation/hardhat-toolbox
npx hardhat
npx hardhat run scripts/deploy.js --network localhost

# Instalar dependências do front-end
cd front-end
npm install
cd ..
```

### 3. Inicie um Nó Local

Em um terminal, inicie um nó local do Hardhat para simular a blockchain:

```bash
npx hardhat node
```
Isso irá gerar várias contas de teste com ether de teste.

### 4. Faça o Deploy do Smart Contract

Em um segundo terminal, execute o script de deploy para publicar o contrato na sua rede local:

```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copie o endereço do contrato (`VotingPlatform implantado no endereço: ...`) que aparecerá no terminal.

### 5. Configure o Endereço do Contrato

Abra o arquivo `front-end/main.js` e substitua o valor da constante `contractAddress` pelo endereço que você copiou no passo anterior.

```javascript
// front-end/main.js
const contractAddress = "ENDEREÇO_DO_SEU_CONTRATO_AQUI";
```

### 6. Execute a Aplicação Front-end

Volte para o terminal onde você fez o deploy e execute o servidor de desenvolvimento:

```bash
cd front-end
npm run dev
```
Acesse a aplicação no seu navegador através do endereço fornecido (geralmente `http://localhost:5173`).

### 7. Configure a MetaMask

-   Abra a MetaMask e adicione uma nova rede com os seguintes dados:
    -   **Nome da Rede**: Hardhat Local
    -   **URL do RPC**: `http://127.0.0.1:8545`
    -   **ID da Cadeia**: `31337`
-   Importe uma das contas de teste fornecidas pelo comando `npx hardhat node` usando a chave privada correspondente.

---
