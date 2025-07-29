import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientLogin } from './components/patient/PatientLogin';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { HospitalLogin } from './components/hospital/HospitalLogin';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { Shield, Hospital, User } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Health Records
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Decentralized emergency access to encrypted health records using blockchain smart contracts and IPFS storage. 
            Be prepared for any medical emergency with instant, secure access to critical health information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Portal</h2>
              <p className="text-gray-600 mb-8">
                Manage your health records, generate emergency QR codes, and control family access to your medical information.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Encrypted record storage</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Emergency QR code generation</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Family guardian management</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Access audit trail</span>
                </div>
              </div>
              <a
                href="/patient"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                Access Patient Portal
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
                <Hospital className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hospital Portal</h2>
              <p className="text-gray-600 mb-8">
                Emergency access to patient records through blockchain verification and guardian approval system.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>QR code scanning</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Blockchain verification</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Guardian approval system</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span>Secure record viewing</span>
                </div>
              </div>
              <a
                href="/hospital"
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-block"
              >
                Access Hospital Portal
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload & Encrypt</h4>
                <p className="text-sm text-gray-600">Patients upload health records, which are encrypted and stored on IPFS</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-emerald-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Emergency Access</h4>
                <p className="text-sm text-gray-600">Hospitals scan QR codes to request emergency access via blockchain</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Guardian Approval</h4>
                <p className="text-sm text-gray-600">Trusted guardians approve access, unlocking encrypted medical records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/patient" 
        element={
          isAuthenticated && userType === 'patient' ? 
            <PatientDashboard /> : 
            <PatientLogin />
        } 
      />
      <Route 
        path="/hospital" 
        element={
          isAuthenticated && userType === 'hospital' ? 
            <HospitalDashboard /> : 
            <HospitalLogin />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;