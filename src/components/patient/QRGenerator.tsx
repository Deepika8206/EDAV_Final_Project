import React, { useState, useEffect } from 'react';
import { QrCode, Download } from 'lucide-react';
import { patientAPI } from '../../services/api';

interface QRGeneratorProps {
  patientAddress: string;
  ipfsHash: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ patientAddress, ipfsHash }) => {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateQR();
  }, [patientAddress, ipfsHash]);

  const generateQR = async () => {
    if (!patientAddress || !ipfsHash) return;
    
    setLoading(true);
    try {
      const response = await patientAPI.generateQR(patientAddress, ipfsHash);
      if (response.success) {
        setQrData(response.qrData);
      }
    } catch (error) {
      console.error('QR generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = 'black';
    ctx.font = '12px monospace';
    ctx.fillText('EDAV Emergency QR', 10, 20);
    
    const link = document.createElement('a');
    link.download = 'emergency-qr.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Emergency QR Code</h3>
        <button
          onClick={downloadQR}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>

      <div className="text-center">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : qrData ? (
          <div className="inline-block p-4 bg-gray-100 rounded-lg">
            <QrCode className="w-32 h-32 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-500 mt-2">Emergency Access QR</p>
          </div>
        ) : (
          <div className="text-gray-500">No QR data available</div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>This QR code contains your emergency medical access information.</p>
        <p>Keep it accessible for emergency situations.</p>
      </div>
    </div>
  );
};