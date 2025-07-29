export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  walletAddress: string;
  emergencyContact?: string;
  qrCode?: string;
}

export interface Guardian {
  id: string;
  name: string;
  walletAddress: string;
  relationship: string;
  contact: string;
  isActive: boolean;
}

export interface HealthRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  ipfsHash: string;
  isEncrypted: boolean;
  size: string;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  requestedBy: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  ipfsHash?: string;
  guardianApprovals: GuardianApproval[];
  blockchainTxHash?: string;
}

export interface GuardianApproval {
  guardianId: string;
  guardianName: string;
  walletAddress: string;
  approved: boolean;
  timestamp: string;
}

export interface Hospital {
  id: string;
  name: string;
  email: string;
  registrationId: string;
  role: 'doctor' | 'admin' | 'nurse';
}