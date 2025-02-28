// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract DisputeResolution {
    struct Dispute {
        address initiator;
        address respondent;
        string reason;
        string resolutionDetails;
        bool resolved;
        uint256 timestamp;
        uint256 votesForInitiator;
        uint256 votesForRespondent;
    }

    Dispute[] public disputes;
    address[] public councilMembers;
    mapping(address => bool) public isCouncilMember;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event DisputeInitiated(
        address indexed initiator,
        address indexed respondent,
        string reason
    );
    event DisputeResolved(uint256 indexed disputeId, string resolutionDetails);
    event CouncilMemberAdded(address indexed member);
    event CouncilMemberRemoved(address indexed member);
    event Voted(
        uint256 indexed disputeId,
        address indexed voter,
        bool votedForInitiator
    );

    modifier onlyCouncil() {
        require(
            isCouncilMember[msg.sender],
            "Only council members can call this"
        );
        _;
    }

    /**
     * @notice Adds a new council member.
     * @param member The address of the new council member.
     */
    function addCouncilMember(address member) external onlyCouncil {
        require(
            !isCouncilMember[member],
            "Address is already a council member"
        );
        councilMembers.push(member);
        isCouncilMember[member] = true;
        emit CouncilMemberAdded(member);
    }

    /**
     * @notice Removes a council member.
     * @param member The address of the council member to remove.
     */
    function removeCouncilMember(address member) external onlyCouncil {
        require(isCouncilMember[member], "Address is not a council member");
        isCouncilMember[member] = false;
        for (uint256 i = 0; i < councilMembers.length; i++) {
            if (councilMembers[i] == member) {
                councilMembers[i] = councilMembers[councilMembers.length - 1];
                councilMembers.pop();
                break;
            }
        }
        emit CouncilMemberRemoved(member);
    }

    /**
     * @notice Initiates a new dispute.
     * @param respondent The address of the party against whom the dispute is raised.
     * @param reason A brief explanation of the dispute.
     */
    function initiateDispute(
        address respondent,
        string memory reason
    ) external {
        disputes.push(
            Dispute({
                initiator: msg.sender,
                respondent: respondent,
                reason: reason,
                resolutionDetails: "",
                resolved: false,
                timestamp: block.timestamp,
                votesForInitiator: 0,
                votesForRespondent: 0
            })
        );

        emit DisputeInitiated(msg.sender, respondent, reason);
    }

    /**
     * @notice Allows council members to vote on a dispute.
     * @param disputeId The ID of the dispute to vote on.
     * @param votedForInitiator True if voting in favor of the initiator, false for the respondent.
     */
    function voteOnDispute(
        uint256 disputeId,
        bool votedForInitiator
    ) external onlyCouncil {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");
        require(
            !hasVoted[disputeId][msg.sender],
            "Council member has already voted"
        );

        if (votedForInitiator) {
            dispute.votesForInitiator++;
        } else {
            dispute.votesForRespondent++;
        }
        hasVoted[disputeId][msg.sender] = true;

        emit Voted(disputeId, msg.sender, votedForInitiator);

        // Automatically resolve the dispute if a majority is reached
        if (dispute.votesForInitiator > councilMembers.length / 2) {
            _resolveDispute(
                disputeId,
                "Resolved in favor of initiator by majority vote."
            );
        } else if (dispute.votesForRespondent > councilMembers.length / 2) {
            _resolveDispute(
                disputeId,
                "Resolved in favor of respondent by majority vote."
            );
        }
    }

    /**
     * @notice Resolves a dispute internally.
     * @param disputeId The ID of the dispute to resolve.
     * @param resolutionDetails Details about how the dispute was resolved.
     */
    function _resolveDispute(
        uint256 disputeId,
        string memory resolutionDetails
    ) internal {
        Dispute storage dispute = disputes[disputeId];
        dispute.resolved = true;
        dispute.resolutionDetails = resolutionDetails;
        emit DisputeResolved(disputeId, resolutionDetails);
    }

    /**
     * @notice Retrieves details of a specific dispute.
     * @param disputeId The ID of the dispute to retrieve.
     * @return initiator The address of the initiator.
     * @return respondent The address of the respondent.
     * @return reason The reason for the dispute.
     * @return resolutionDetails The resolution details.
     * @return resolved Whether the dispute is resolved.
     * @return timestamp The timestamp of the dispute.
     * @return votesForInitiator The number of votes in favor of the initiator.
     * @return votesForRespondent The number of votes in favor of the respondent.
     */
    function getDispute(
        uint256 disputeId
    )
        external
        view
        returns (
            address initiator,
            address respondent,
            string memory reason,
            string memory resolutionDetails,
            bool resolved,
            uint256 timestamp,
            uint256 votesForInitiator,
            uint256 votesForRespondent
        )
    {
        require(disputeId < disputes.length, "Dispute ID does not exist");
        Dispute storage dispute = disputes[disputeId];
        return (
            dispute.initiator,
            dispute.respondent,
            dispute.reason,
            dispute.resolutionDetails,
            dispute.resolved,
            dispute.timestamp,
            dispute.votesForInitiator,
            dispute.votesForRespondent
        );
    }

    /**
     * @notice Retrieves the list of all disputes.
     * @return An array of dispute details.
     */
    function getAllDisputes() external view returns (Dispute[] memory) {
        return disputes;
    }
}
