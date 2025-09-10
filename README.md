# Emergency Data Access Vault (EDAV)

A blockchain-based emergency medical data access system with multi-signature approval.

## Architecture

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + Firebase
- **Blockchain**: Solidity + Polygon Mumbai
- **Storage**: IPFS (Web3.Storage)
- **Auth**: Firebase Authentication + OTP

## Setup Instructions

### 1. Smart Contract Deployment

```bash
cd smart-contracts
npm install
# Configure .env with your private key and RPC URL
npm run deploy
```

### 2. Backend Setup

```bash
cd backend
npm install
# Configure .env file
npm start
```

### 3. Frontend Setup

```bash
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_server_private_key
WEB3_STORAGE_TOKEN=your_web3_storage_token
FIREBASE_PROJECT_ID=edav-login
```

### Smart Contracts (.env)
```
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_deployment_private_key
```

## Usage Flow

1. **Patient Registration**: Creates wallet, uploads encrypted records to IPFS
2. **Guardian Setup**: Adds family members as guardians
3. **QR Generation**: Creates emergency QR code with wallet address
4. **Hospital Access**: Scans QR, requests emergency access
5. **Guardian Approval**: Guardians approve via OTP
6. **Record Access**: Hospital downloads decrypted medical records

## Key Features

- No MetaMask required (server-managed wallets)
- Multi-signature guardian approval
- Encrypted IPFS storage
- Firebase OTP authentication
- Emergency QR codes
- Audit trail on blockchain

## Security Notes

- Encryption keys managed server-side
- Multi-sig approval prevents unauthorized access
- All transactions logged on blockchain
- Firebase handles user authentication