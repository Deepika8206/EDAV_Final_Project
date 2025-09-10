// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EDAVAccess {
    struct Patient {
        address wallet;
        string ipfsHash;
        address[] guardians;
        bool isActive;
    }
    
    struct AccessRequest {
        uint256 id;
        address patient;
        address hospital;
        string ipfsHash;
        uint256 timestamp;
        uint256 approvals;
        bool executed;
        mapping(address => bool) hasApproved;
    }
    
    mapping(address => Patient) public patients;
    mapping(uint256 => AccessRequest) public accessRequests;
    mapping(address => bool) public authorizedHospitals;
    
    uint256 public requestCounter;
    uint256 public constant REQUIRED_APPROVALS = 2;
    
    event PatientRegistered(address indexed patient, string ipfsHash);
    event AccessRequested(uint256 indexed requestId, address indexed patient, address indexed hospital);
    event AccessApproved(uint256 indexed requestId, address indexed guardian);
    event AccessGranted(uint256 indexed requestId, string ipfsHash);
    
    modifier onlyAuthorizedHospital() {
        require(authorizedHospitals[msg.sender], "Not authorized hospital");
        _;
    }
    
    function registerPatient(address _patient, string memory _ipfsHash, address[] memory _guardians) external {
        require(_guardians.length >= REQUIRED_APPROVALS, "Insufficient guardians");
        
        patients[_patient] = Patient({
            wallet: _patient,
            ipfsHash: _ipfsHash,
            guardians: _guardians,
            isActive: true
        });
        
        emit PatientRegistered(_patient, _ipfsHash);
    }
    
    function authorizeHospital(address _hospital) external {
        authorizedHospitals[_hospital] = true;
    }
    
    function requestAccess(address _patient) external onlyAuthorizedHospital returns (uint256) {
        require(patients[_patient].isActive, "Patient not registered");
        
        uint256 requestId = ++requestCounter;
        AccessRequest storage request = accessRequests[requestId];
        request.id = requestId;
        request.patient = _patient;
        request.hospital = msg.sender;
        request.ipfsHash = patients[_patient].ipfsHash;
        request.timestamp = block.timestamp;
        
        emit AccessRequested(requestId, _patient, msg.sender);
        return requestId;
    }
    
    function approveAccess(uint256 _requestId) external {
        AccessRequest storage request = accessRequests[_requestId];
        require(request.id != 0, "Request not found");
        require(!request.executed, "Already executed");
        require(!request.hasApproved[msg.sender], "Already approved");
        
        // Check if sender is guardian
        bool isGuardian = false;
        address[] memory guardians = patients[request.patient].guardians;
        for (uint i = 0; i < guardians.length; i++) {
            if (guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a guardian");
        
        request.hasApproved[msg.sender] = true;
        request.approvals++;
        
        emit AccessApproved(_requestId, msg.sender);
        
        if (request.approvals >= REQUIRED_APPROVALS) {
            request.executed = true;
            emit AccessGranted(_requestId, request.ipfsHash);
        }
    }
    
    function getPatientGuardians(address _patient) external view returns (address[] memory) {
        return patients[_patient].guardians;
    }
}