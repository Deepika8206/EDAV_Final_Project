import React, { useState } from 'react';
import { Header } from '../common/Header';
import { Navigation } from '../common/Navigation';
import { QrCode, Upload, Users, FileText, Activity, Shield, Plus, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';

export const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  const mockGuardians = [
    { id: '1', name: 'Jane Doe', walletAddress: '0x123...abc', relationship: 'Spouse', contact: '+1234567890', isActive: true },
    { id: '2', name: 'Dr. Smith', walletAddress: '0x456...def', relationship: 'Doctor', contact: '+0987654321', isActive: true },
  ];

  const mockRecords = [
    { id: '1', name: 'Blood Test Report.pdf', type: 'Lab Report', uploadDate: '2024-01-15', ipfsHash: 'Qm...abc123', isEncrypted: true, size: '2.3 MB' },
    { id: '2', name: 'X-Ray Chest.pdf', type: 'Imaging', uploadDate: '2024-01-10', ipfsHash: 'Qm...def456', isEncrypted: true, size: '5.1 MB' },
  ];

  const mockAccessLogs = [
    { id: '1', patientId: user?.id || '', patientName: user?.name || '', hospitalId: 'h1', hospitalName: 'City Hospital', requestedBy: 'Dr. Johnson', timestamp: '2024-01-20 14:30', status: 'approved' as const, guardianApprovals: [] },
    { id: '2', patientId: user?.id || '', patientName: user?.name || '', hospitalId: 'h2', hospitalName: 'Emergency Care', requestedBy: 'Dr. Wilson', timestamp: '2024-01-18 09:15', status: 'pending' as const, guardianApprovals: [] },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{mockRecords.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Health Records</h3>
          <p className="text-sm text-gray-600">Encrypted & Secure</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{mockGuardians.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Guardians</h3>
          <p className="text-sm text-gray-600">Trusted Family</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{mockAccessLogs.length}</span>
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
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-xl mb-4">
              <QRCode 
                value={`emergency:${user?.walletAddress}:${user?.qrCode}`}
                size={160}
                level="M"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code for emergency access to your health records
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Download QR Code
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
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
        {mockGuardians.map((guardian) => (
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
        ))}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Health Records</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Your Documents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockRecords.map((record) => (
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
                      <span>{record.uploadDate}</span>
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
          ))}
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
          {mockAccessLogs.map((log) => (
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
          ))}
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
                value={user?.name}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={user?.bloodGroup}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <input
                  type="text"
                  value={user?.gender}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={user?.mobile}
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
                value={user?.walletAddress}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency QR ID</label>
              <input
                type="text"
                value={user?.qrCode}
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

  if (!user) return null;

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