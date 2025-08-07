// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract VotingPlatform {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    enum VotingState {
        NotStarted,
        Open,
        Closed
    }

    struct Poll {
        uint256 id;
        address creator;
        string title;
        VotingState state;
        uint256 candidateCount;
    }

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;

    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => bool)) public voters;

    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string title
    );
    event Voted(
        uint256 indexed pollId,
        uint256 indexed candidateId,
        address indexed voter
    );
    event VotingStateChanged(uint256 indexed pollId, VotingState newState);

    modifier onlyPollCreator(uint256 _pollId) {
        require(
            polls[_pollId].creator == msg.sender,
            "Apenas o criador da votacao pode chamar esta funcao."
        );
        _;
    }

    modifier pollExists(uint256 _pollId) {
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

    function addCandidate(uint256 _pollId, string memory _name)
        public
        pollExists(_pollId)
        onlyPollCreator(_pollId)
    {
        Poll storage currentPoll = polls[_pollId];
        require(
            currentPoll.state == VotingState.NotStarted,
            "A votacao ja comecou ou terminou."
        );

        currentPoll.candidateCount++;
        uint256 newCandidateId = currentPoll.candidateCount;
        candidates[_pollId][newCandidateId] = Candidate(
            newCandidateId,
            _name,
            0
        );
    }

    function startVoting(uint256 _pollId)
        public
        pollExists(_pollId)
        onlyPollCreator(_pollId)
    {
        Poll storage currentPoll = polls[_pollId];
        require(
            currentPoll.state == VotingState.NotStarted,
            "A votacao ja foi iniciada."
        );
        require(
            currentPoll.candidateCount > 0,
            "A votacao deve ter ao menos um candidato."
        );

        currentPoll.state = VotingState.Open;
        emit VotingStateChanged(_pollId, VotingState.Open);
    }

    function endVoting(uint256 _pollId)
        public
        pollExists(_pollId)
        onlyPollCreator(_pollId)
    {
        Poll storage currentPoll = polls[_pollId];
        require(
            currentPoll.state == VotingState.Open,
            "A votacao nao esta aberta para ser encerrada."
        );

        currentPoll.state = VotingState.Closed;
        emit VotingStateChanged(_pollId, VotingState.Closed);
    }

    function vote(uint256 _pollId, uint256 _candidateId)
        public
        pollExists(_pollId)
    {
        Poll storage currentPoll = polls[_pollId];

        require(
            currentPoll.state == VotingState.Open,
            "Esta votacao nao esta aberta."
        );
        require(!voters[_pollId][msg.sender], "Voce ja votou nesta votacao.");
        require(
            _candidateId > 0 && _candidateId <= currentPoll.candidateCount,
            "Candidato invalido."
        );

        candidates[_pollId][_candidateId].voteCount++;
        voters[_pollId][msg.sender] = true;

        emit Voted(_pollId, _candidateId, msg.sender);
    }

    function getAllCandidates(uint256 _pollId)
        public
        view
        pollExists(_pollId)
        returns (Candidate[] memory)
    {
        uint256 count = polls[_pollId].candidateCount;
        Candidate[] memory allCandidates = new Candidate[](count);
        for (uint256 i = 1; i <= count; i++) {
            allCandidates[i - 1] = candidates[_pollId][i];
        }
        return allCandidates;
    }

    function getVoterStatus(uint256 _pollId, address _voter)
        public
        view
        pollExists(_pollId)
        returns (bool)
    {
        return voters[_pollId][_voter];
    }
}
