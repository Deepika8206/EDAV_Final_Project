import React, { useState } from 'react';
import { Header } from '../common/Header';
import { Navigation } from '../common/Navigation';
import { QrCode, Scan, AlertTriangle, Clock, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanInput, setScanInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const { hospital } = useAuth();

  const mockAccessRequests = [
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Doe',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      timestamp: '2024-01-20 14:30',
      status: 'approved',
      ipfsHash: 'Qm...abc123',
      guardianApprovals: [
        { guardianName: 'Jane Doe', approved: true, timestamp: '2024-01-20 14:32' }
      ]
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Alice Smith',
      bloodGroup: 'A+',
      allergies: 'None',
      timestamp: '2024-01-20 09:15',
      status: 'pending',
      guardianApprovals: []
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">3</span>
          </div>
          <h3 className="font-semibold text-gray-900">Pending Requests</h3>
          <p className="text-sm text-gray-600">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <h3 className="font-semibold text-gray-900">Approved Today</h3>
          <p className="text-sm text-gray-600">Emergency access granted</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">1</span>
          </div>
          <h3 className="font-semibold text-gray-900">Rejected</h3>
          <p className="text-sm text-gray-600">Access denied</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Access Requests</h3>
        <div className="space-y-4">
          {mockAccessRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                  <p className="text-sm text-gray-600">{request.timestamp}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmergencyAccess = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Access Request</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan QR Code or Enter Patient ID
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="emergency:0x742d35Cc...QR-123 or Patient ID"
                />
              </div>
              <button
                onClick={() => {
                  // Mock QR scan
                  setScanInput('emergency:0x742d35Cc6634C0532925a3b8D03A6f2dc4f2e222:patient-emergency-qr-123');
                  setSelectedPatient({
                    id: 'p1',
                    name: 'John Doe',
                    bloodGroup: 'O+',
                    allergies: 'Penicillin',
                    walletAddress: '0x742d35Cc6634C0532925a3b8D03A6f2dc4f2e222'
                  });
                }}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Scan className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Patient Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="ml-2 font-medium text-red-600">{selectedPatient.bloodGroup}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Known Allergies:</span>
                  <span className="ml-2 font-medium text-orange-600">{selectedPatient.allergies}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Trigger Emergency Access</span>
                </button>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This will send a blockchain request to patient guardians for approval
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Requests</h3>
        <div className="space-y-4">
          {mockAccessRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                  <p className="text-sm text-gray-600">{request.timestamp}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              
              {request.status === 'approved' && (
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>View Records</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Download Securely
                  </button>
                </div>
              )}
              
              {request.guardianApprovals.length > 0 && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-600">Guardian Approvals:</span>
                  <div className="mt-1 space-y-1">
                    {request.guardianApprovals.map((approval, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{approval.guardianName} - {approval.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Patient Records Viewer</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Selected</h3>
          <p className="text-gray-600 mb-6">
            Request emergency access to view patient records securely
          </p>
          <button
            onClick={() => setActiveTab('emergency')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Emergency Access
          </button>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Access History</h3>
            <div className="flex space-x-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockAccessRequests.map((log) => (
            <div key={log.id} className="px-6 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{log.patientName}</h4>
                  <p className="text-sm text-gray-600">Patient ID: {log.patientId}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Requested by: Dr. {hospital?.name}</div>
                {log.ipfsHash && (
                  <div className="font-mono text-xs">IPFS: {log.ipfsHash}</div>
                )}
                <div>Blockchain TX: 0x{Math.random().toString(16).substr(2, 8)}...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'emergency':
        return renderEmergencyAccess();
      case 'records':
        return renderRecords();
      case 'audit':
        return renderAuditTrail();
      default:
        return renderDashboard();
    }
  };

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Hospital Portal" />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} userType="hospital" />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};