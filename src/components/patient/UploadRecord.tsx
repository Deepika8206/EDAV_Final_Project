import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { supabase } from '../../supabase';



export const UploadRecord: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };

  const generateEncryptionKey = () => {
    const newKey = CryptoJS.lib.WordArray.random(256 / 8).toString();
    setEncryptionKey(newKey);
    alert("Generated Encryption Key (Store This Safely!): " + newKey); // REMOVE IN PRODUCTION
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadToIPFS = async (file: File, key: string) => {
    if (!user || !user.id) {
      setUploadError("User not logged in.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const response = await patientAPI.uploadRecord(file, user.id);
      
      if (response.success) {


        await supabase.from('health_records').insert({
          patient_id: user.id,
          name: response.fileName,
          type: file.type,
          upload_date: new Date().toISOString(),
          ipfs_cid: response.ipfsHash,
          is_encrypted: true,
          size: `${(response.size / (1024 * 1024)).toFixed(2)} MB`,
        });
        setSelectedFile(null);
        setEncryptionKey('');
        onUploadSuccess();
      } else {
        setUploadError(response.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload New Health Record</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            disabled={uploading}
          >
            <Upload className="w-5 h-5" />
            <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
          </button>
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Key (Temporary Example)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter encryption key or generate"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={generateEncryptionKey}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={uploading}
            >
              Generate Key
            </button>
          </div>
          <p className="text-xs text-red-500 mt-1">
            WARNING: In a real system, securely manage this key. Do NOT store it in plain text in Firestore!
          </p>
        </div>

        {uploadError && (
          <div className="text-red-500 text-sm mt-3">{uploadError}</div>
        )}

        <button
          type="button"
          onClick={() => selectedFile && encryptionKey && uploadToIPFS(selectedFile, encryptionKey)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled={!selectedFile || !encryptionKey || uploading}
        >
          {uploading ? 'Uploading...' : 'Encrypt & Upload to IPFS'}
        </button>
      </div>
    </div>
  );
};