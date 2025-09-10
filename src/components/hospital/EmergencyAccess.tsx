import React, { useState } from 'react';
import { QrCode, Search, Download, Clock } from 'lucide-react';
import { hospitalAPI } from '../../services/api';

export const EmergencyAccess: React.FC = () => {
  const [qrData, setQrData] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [requestId, setRequestId] = useState('');
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQRScan = async () => {
    if (!qrData) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await hospitalAPI.parseQR(qrData);
      if (response.success) {
        setPatientAddress(response.patientAddress);
      } else {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAccess = async () => {
    if (!patientAddress) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await hospitalAPI.requestAccess(patientAddress, 'hospital_001');
      if (response.success) {
        setRequestId(response.requestId);
      } else {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!requestId) return;
    
    setLoading(true);
    
    try {
      const response = await hospitalAPI.checkAccessStatus(requestId);
      if (response.success) {
        setAccessStatus(response.request);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecord = async () => {
    if (!requestId || !accessStatus?.executed) return;
    
    setLoading(true);
    
    try {
      const response = await hospitalAPI.downloadRecord(requestId, accessStatus.patient);
      if (response.success) {
        const blob = new Blob([Buffer.from(response.fileData, 'base64')]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medical_record.pdf';
        a.click();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Medical Access</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan QR Code or Enter Patient Address
            </label>
            <div className="space-y-3">
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Paste QR code data or patient wallet address"
                rows={3}
              />
              <button
                onClick={handleQRScan}
                disabled={loading || !qrData}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>Parse QR Data</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Address
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
                readOnly={!!qrData}
              />
              <button
                onClick={requestAccess}
                disabled={loading || !patientAddress}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>Request Emergency Access</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {requestId && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800">Access Request Submitted</h3>
            <p className="text-sm text-yellow-700 mt-1">Request ID: {requestId}</p>
            <button
              onClick={checkStatus}
              className="mt-2 flex items-center space-x-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              <Clock className="w-4 h-4" />
              <span>Check Status</span>
            </button>
          </div>
        )}

        {accessStatus && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-800">Access Status</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Approvals: {accessStatus.approvals}/2</p>
              <p>Status: {accessStatus.executed ? 'Approved' : 'Pending'}</p>
              <p>Patient: {accessStatus.patient}</p>
            </div>
            
            {accessStatus.executed && (
              <button
                onClick={downloadRecord}
                className="mt-3 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Download Medical Record</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};