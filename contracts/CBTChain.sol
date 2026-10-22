// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CBTChain - CBT audit evidence registry
/// @notice Stores hashes and limited metadata, not exam papers or candidate answers.
contract CBTChain {
    address public owner;
    uint256 public auditCount;

    struct AuditRecord {
        uint256 id;
        string sessionRef;
        string eventType;
        bytes32 fileHash;
        bytes32 previousRecordHash;
        address submittedBy;
        uint256 timestamp;
        bytes32 recordHash;
    }

    mapping(uint256 => AuditRecord) private auditRecords;

    event AuditRegistered(
        uint256 indexed id,
        string sessionRef,
        string eventType,
        bytes32 fileHash,
        bytes32 recordHash,
        address indexed submittedBy,
        uint256 timestamp
    );
    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only administrator");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerAudit(
        string calldata sessionRef,
        string calldata eventType,
        bytes32 fileHash
    ) external onlyOwner returns (uint256 newId) {
        require(bytes(sessionRef).length > 0, "Session reference required");
        require(bytes(sessionRef).length <= 80, "Session reference too long");
        require(bytes(eventType).length > 0, "Event type required");
        require(bytes(eventType).length <= 80, "Event type too long");
        require(fileHash != bytes32(0), "File hash cannot be empty");

        newId = auditCount + 1;
        bytes32 previousHash = newId == 1
            ? bytes32(0)
            : auditRecords[auditCount].recordHash;

        uint256 recordedAt = block.timestamp;
        bytes32 newRecordHash = keccak256(
            abi.encode(
                newId,
                sessionRef,
                eventType,
                fileHash,
                previousHash,
                msg.sender,
                recordedAt
            )
        );

        auditRecords[newId] = AuditRecord({
            id: newId,
            sessionRef: sessionRef,
            eventType: eventType,
            fileHash: fileHash,
            previousRecordHash: previousHash,
            submittedBy: msg.sender,
            timestamp: recordedAt,
            recordHash: newRecordHash
        });

        auditCount = newId;

        emit AuditRegistered(
            newId,
            sessionRef,
            eventType,
            fileHash,
            newRecordHash,
            msg.sender,
            recordedAt
        );
    }

    function getAudit(uint256 id) external view returns (
        uint256 recordId,
        string memory sessionRef,
        string memory eventType,
        bytes32 fileHash,
        bytes32 previousRecordHash,
        address submittedBy,
        uint256 timestamp,
        bytes32 recordHash
    ) {
        require(id > 0 && id <= auditCount, "Audit record does not exist");
        AuditRecord storage r = auditRecords[id];
        return (
            r.id,
            r.sessionRef,
            r.eventType,
            r.fileHash,
            r.previousRecordHash,
            r.submittedBy,
            r.timestamp,
            r.recordHash
        );
    }

    function verifyFileHash(uint256 id, bytes32 candidateHash)
        external
        view
        returns (bool)
    {
        require(id > 0 && id <= auditCount, "Audit record does not exist");
        return auditRecords[id].fileHash == candidateHash;
    }

    function transferOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new administrator");
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
    }
}
