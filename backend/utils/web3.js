const { ethers } = require('ethers');

let provider, wallet, contract;

// Initialize only if we have valid environment variables
if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_server_private_key') {
  provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractABI = [
    "function registerPatient(address _patient, string memory _ipfsHash, address[] memory _guardians) external",
    "function requestAccess(address _patient) external returns (uint256)",
    "function approveAccess(uint256 _requestId) external",
    "function getPatientGuardians(address _patient) external view returns (address[] memory)",
    "function patients(address) external view returns (address, string, bool)",
    "function accessRequests(uint256) external view returns (uint256, address, address, string, uint256, uint256, bool)",
    "event PatientRegistered(address indexed patient, string ipfsHash)",
    "event AccessRequested(uint256 indexed requestId, address indexed patient, address indexed hospital)",
    "event AccessGranted(uint256 indexed requestId, string ipfsHash)"
  ];
  
  if (process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ADDRESS !== 'your_deployed_contract_address') {
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
  }
}

const generateWallet = () => {
  const newWallet = ethers.Wallet.createRandom();
  return {
    address: newWallet.address,
    privateKey: newWallet.privateKey
  };
};

const registerPatient = async (patientAddress, ipfsHash, guardianAddresses) => {
  if (!contract) {
    throw new Error('Blockchain not configured. Please set PRIVATE_KEY and CONTRACT_ADDRESS in .env');
  }
  try {
    const tx = await contract.registerPatient(patientAddress, ipfsHash, guardianAddresses);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Blockchain registration failed: ${error.message}`);
  }
};

const requestAccess = async (patientAddress) => {
  if (!contract) {
    throw new Error('Blockchain not configured. Please set PRIVATE_KEY and CONTRACT_ADDRESS in .env');
  }
  try {
    const tx = await contract.requestAccess(patientAddress);
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'AccessRequested');
    return event.args.requestId.toString();
  } catch (error) {
    throw new Error(`Access request failed: ${error.message}`);
  }
};

const approveAccess = async (requestId, guardianPrivateKey) => {
  if (!contract || !provider) {
    throw new Error('Blockchain not configured. Please set PRIVATE_KEY and CONTRACT_ADDRESS in .env');
  }
  try {
    const guardianWallet = new ethers.Wallet(guardianPrivateKey, provider);
    const guardianContract = contract.connect(guardianWallet);
    const tx = await guardianContract.approveAccess(requestId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Approval failed: ${error.message}`);
  }
};

module.exports = {
  generateWallet,
  registerPatient,
  requestAccess,
  approveAccess,
  contract
};