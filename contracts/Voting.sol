// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract VotingPlatform {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    enum VotingState { NotStarted, Open, Closed }

    struct Poll {
        uint id;
        address creator;
        string title;
        VotingState state;
        uint candidateCount;
    }

    mapping(uint => Poll) public polls;
    uint public pollCount;

    mapping(uint => mapping(uint => Candidate)) public candidates;
    mapping(uint => mapping(address => bool)) public voters;

    event PollCreated(uint indexed pollId, address indexed creator, string title);
    event Voted(uint indexed pollId, uint indexed candidateId, address indexed voter);
    event VotingStateChanged(uint indexed pollId, VotingState newState);

    modifier onlyPollCreator(uint _pollId) {
        require(polls[_pollId].creator == msg.sender, "Apenas o criador da votacao pode chamar esta funcao.");
        _;
    }

    modifier pollExists(uint _pollId) {
        require(_pollId > 0 && _pollId <= pollCount, "Votacao inexistente.");
        _;
    }

    function createPoll(string memory _title) public {
        pollCount++;
        polls[pollCount] = Poll({
            id: pollCount,
            creator: msg.sender,
            title: _title,
            state: VotingState.NotStarted,
            candidateCount: 0
        });
        emit PollCreated(pollCount, msg.sender, _title);
    }

    function addCandidate(uint _pollId, string memory _name) public pollExists(_pollId) onlyPollCreator(_pollId) {
        Poll storage currentPoll = polls[_pollId];
        require(currentPoll.state == VotingState.NotStarted, "A votacao ja comecou ou terminou.");
        
        currentPoll.candidateCount++;
        uint newCandidateId = currentPoll.candidateCount;
        candidates[_pollId][newCandidateId] = Candidate(newCandidateId, _name, 0);
    }

    function startVoting(uint _pollId) public pollExists(_pollId) onlyPollCreator(_pollId) {
        Poll storage currentPoll = polls[_pollId];
        require(currentPoll.state == VotingState.NotStarted, "A votacao ja foi iniciada.");
        require(currentPoll.candidateCount > 0, "A votacao deve ter ao menos um candidato.");
        
        currentPoll.state = VotingState.Open;
        emit VotingStateChanged(_pollId, VotingState.Open);
    }

    function endVoting(uint _pollId) public pollExists(_pollId) onlyPollCreator(_pollId) {
        Poll storage currentPoll = polls[_pollId];
        require(currentPoll.state == VotingState.Open, "A votacao nao esta aberta para ser encerrada.");
        
        currentPoll.state = VotingState.Closed;
        emit VotingStateChanged(_pollId, VotingState.Closed);
    }

    function vote(uint _pollId, uint _candidateId) public pollExists(_pollId) {
        Poll storage currentPoll = polls[_pollId];

        require(currentPoll.state == VotingState.Open, "Esta votacao nao esta aberta.");
        require(!voters[_pollId][msg.sender], "Voce ja votou nesta votacao.");
        require(_candidateId > 0 && _candidateId <= currentPoll.candidateCount, "Candidato invalido.");

        candidates[_pollId][_candidateId].voteCount++;
        voters[_pollId][msg.sender] = true;

        emit Voted(_pollId, _candidateId, msg.sender);
    }

    function getAllCandidates(uint _pollId) public view pollExists(_pollId) returns (Candidate[] memory) {
        uint count = polls[_pollId].candidateCount;
        Candidate[] memory allCandidates = new Candidate[](count);
        for (uint i = 1; i <= count; i++) {
            allCandidates[i - 1] = candidates[_pollId][i];
        }
        return allCandidates;
    }

    function getVoterStatus(uint _pollId, address _voter) public view pollExists(_pollId) returns (bool) {
        return voters[_pollId][_voter];
    }
}
