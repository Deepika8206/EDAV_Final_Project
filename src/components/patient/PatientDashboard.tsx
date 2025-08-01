import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { Navigation } from '../common/Navigation';
import { QrCode, Upload, Users, FileText, Activity, Shield, Plus, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
// Make sure this path is correct for your firebase instance
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// THIS IS THE ONLY ONE YOU SHOULD KEEP



// Define interfaces for your data structures (important for type safety)
interface Guardian {
  id: string;
  name: string;
  walletAddress: string;
  relationship: string;
  contact: string;
  isActive: boolean;
  patientId: string; // Crucial for queries
}

interface HealthRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  ipfsCid: string; // Changed from ipfsHash to ipfsCid as per UploadRecord component
  isEncrypted: boolean;
  size: string;
  patientId: string; // Crucial for queries
  // encryptionKeyId: string; // You might need this if you implement a key management system
}

interface AccessLog {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  requestedBy: string;
  timestamp: string;
  status: 'approved' | 'pending' | 'rejected';
  guardianApprovals: string[]; // Array of guardian UIDs who approved
}

export const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading: authLoading } = useAuth();

  // State for actual data, initialized to empty arrays
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // New state for controlling the visibility of the UploadRecord modal
  const [showUploadModal, setShowUploadModal] = useState(false);

  // --- Data Fetching Logic (Refactored to be callable) ---
  const fetchPatientData = async () => {
    if (!user?.id) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setFetchError(null);

    try {
      // --- Fetch Guardians ---
      const guardiansRef = collection(db, 'guardians');
      const qGuardians = query(guardiansRef, where('patientId', '==', user.id));
      const querySnapshotGuardians = await getDocs(qGuardians);
      const fetchedGuardians: Guardian[] = [];
      querySnapshotGuardians.forEach((doc) => {
        fetchedGuardians.push({ id: doc.id, ...doc.data() } as Guardian);
      });
      setGuardians(fetchedGuardians);

      // --- Fetch Health Records ---
      const recordsRef = collection(db, 'healthRecords');
      const qRecords = query(recordsRef, where('patientId', '==', user.id));
      const querySnapshotRecords = await getDocs(qRecords);
      const fetchedRecords: HealthRecord[] = [];
      querySnapshotRecords.forEach((doc) => {
        // Ensure uploadDate is formatted if it's a Firestore Timestamp or Date object
        const recordData = doc.data();
        fetchedRecords.push({
            id: doc.id,
            name: recordData.name,
            type: recordData.type,
            // Convert Firestore Timestamp to ISO string if applicable
            // Example: recordData.uploadDate?.toDate().toISOString() || ''
            uploadDate: recordData.uploadDate, // Assuming it's already a string or handled in UploadRecord
            ipfsCid: recordData.ipfsCid,
            isEncrypted: recordData.isEncrypted,
            size: recordData.size,
            patientId: recordData.patientId,
        } as HealthRecord);
      });
      setRecords(fetchedRecords);

      // --- Fetch Access Logs ---
      const accessLogsRef = collection(db, 'accessLogs');
      const qAccessLogs = query(accessLogsRef, where('patientId', '==', user.id));
      const querySnapshotAccessLogs = await getDocs(qAccessLogs);
      const fetchedAccessLogs: AccessLog[] = [];
      querySnapshotAccessLogs.forEach((doc) => {
        fetchedAccessLogs.push({ id: doc.id, ...doc.data() } as AccessLog);
      });
      setAccessLogs(fetchedAccessLogs);

    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      setFetchError(`Failed to load data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingData(false);
    }
  };

  // Effect to call the data fetching function
  useEffect(() => {
    if (!authLoading && user?.id) { // Only fetch when auth is done and user is available
      fetchPatientData();
    }
  }, [user, authLoading]); // Depend on user and authLoading

  // Callback for when UploadRecord successfully finishes
  const handleUploadSuccess = () => {
    setShowUploadModal(false); // Close the modal
    fetchPatientData(); // Re-fetch all data to refresh the records list
  };

  // --- Render Loading/Error States before main layout ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Authenticating user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500">You are not logged in. Please log in to access the dashboard.</p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading your health data...</p>
      </div>
    );
  }

  // If there was a fetch error after initial load, display it.
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Patient Portal" />
        <div className="flex">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="patient" />
          <main className="flex-1 p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{fetchError}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setFetchError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.414l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.303 9.757 5.652 7.106a1.2 1.2 0 0 1 1.697-1.697L10 8.061l2.651-2.651a1.2 1.2 0 0 1 1.697 1.697L11.697 9.757l2.651 2.651a1.2 1.2 0 0 1 0 1.697z"/></svg>
              </span>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>
    );
  }


  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{records.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Health Records</h3>
          <p className="text-sm text-gray-600">Encrypted & Secure</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{guardians.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Guardians</h3>
          <p className="text-sm text-gray-600">Trusted Family</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{accessLogs.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Access Requests</h3>
          <p className="text-sm text-gray-600">Recent Activity</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">Active</span>
          </div>
          <h3 className="font-semibold text-gray-900">Security Status</h3>
          <p className="text-sm text-gray-600">All Systems Secure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency QR Code</h3>
          <div className="text-center">
            {user?.walletAddress && user?.qrCode ? (
              <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-xl mb-4">
                <QRCode
                  value={`emergency:${user.walletAddress}:${user.qrCode}`}
                  size={160}
                  level="M"
                />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl mb-4 text-gray-600">
                No QR code available. Please ensure your profile is complete.
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code for emergency access to your health records
            </p>
            {user?.walletAddress && user?.qrCode && (
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Download QR Code
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              className="w-full flex items-center space-x-3 p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => setShowUploadModal(true)} // This button will now open the modal
            >
              <Upload className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Upload New Record</div>
                <div className="text-sm text-gray-600">Add encrypted health documents</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-medium text-gray-900">Add Guardian</div>
                <div className="text-sm text-gray-600">Add trusted family member</div>
              </div>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <QrCode className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">Generate New QR</div>
                <div className="text-sm text-gray-600">Create emergency access code</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFamily = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Trusted Guardians</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Guardian</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guardians.length > 0 ? (
          guardians.map((guardian) => (
            <div key={guardian.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{guardian.name}</h3>
                    <p className="text-sm text-gray-600">{guardian.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${guardian.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">{guardian.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Contact:</span>
                  <span className="ml-2 font-medium">{guardian.contact}</span>
                </div>
                <div>
                  <span className="text-gray-600">Wallet:</span>
                  <span className="ml-2 font-mono text-xs">{guardian.walletAddress}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  Edit
                </button>
                <button className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
            No guardians added yet. Click "Add Guardian" to get started.
          </div>
        )}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Health Records</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowUploadModal(true)} // Open the modal
        >
          <Upload className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* --- START: Upload Record Modal Integration --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowUploadModal(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Render the UploadRecord component here, passing the success callback */}
            <UploadRecord onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}
      {/* --- END: Upload Record Modal Integration --- */}


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Your Documents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{record.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{record.type}</span>
                        {/* Ensure uploadDate is displayed correctly; use toLocaleDateString() */}
                        <span>{record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : 'N/A'}</span>
                        <span>{record.size}</span>
                        {record.isEncrypted && (
                          <span className="flex items-center space-x-1 text-emerald-600">
                            <Shield className="w-3 h-3" />
                            <span>Encrypted</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-600">
              No health records uploaded yet. Click "Upload Record" to add your documents.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccessLog = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Access Request Log</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Access Requests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {accessLogs.length > 0 ? (
            accessLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{log.hospitalName}</h4>
                      <p className="text-sm text-gray-600">Requested by {log.requestedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-600">
              No access requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={user?.bloodGroup || ''}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <input
                  type="text"
                  value={user?.gender || ''}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={user?.mobile || ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input
                type="text"
                value={user?.walletAddress || ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency QR ID</label>
              <input
                type="text"
                value={user?.qrCode || ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'family':
        return renderFamily();
      case 'records':
        return renderRecords();
      case 'access-log':
        return renderAccessLog();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Patient Portal" />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="patient" />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};