import React, { useState, useEffect, useRef } from 'react';
import { Shield, Smartphone, Mail, Lock, Fingerprint, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { User } from '../../types';
import { patientAPI } from '../../services/api';

export const PatientLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // To disable buttons during auth calls

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    walletAddress: '',
    mobile: '', // Added mobile to formData state if it wasn't explicitly there
  });

  // Rename the login function from useAuth to avoid conflict with local handleLogin
  const { login: authContextLogin } = useAuth();

  // Clean up useEffect for reCAPTCHA, it's no longer needed for email/password auth
  useEffect(() => {
    // No Firebase phone auth related reCAPTCHA setup needed here
    return () => {
      // Any cleanup for non-Firebase specific things if they were here.
    };
  }, [isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (patientData) {
        authContextLogin(data.user.id, patientData as User, 'patient');
      } else {
        const minimalUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'Patient User',
          mobile: '',
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          emergencyContact: '',
          walletAddress: '',
          qrCode: '',
        };
        authContextLogin(data.user.id, minimalUser, 'patient');
        setError('Your full profile could not be loaded. Please update your profile information in the dashboard.');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation for current step before proceeding
    if (step === 1) {
      // Correctly check formData for mobile
      if (!formData.name || !formData.dateOfBirth || !formData.gender || !formData.bloodGroup || !formData.mobile) {
        setError('Please fill in all personal information fields, including Mobile Number.');
        return;
      }
      setStep(step + 1); // Proceed to next step if validation passes
      return; // Important: return here to prevent immediate submission if not on final step
    }

    if (step < 3) {
      setStep(step + 1); // Proceed to next step (step 2 to step 3)
      return; // Important: return here to prevent immediate submission if not on final step
    }
    
    // --- FINAL STEP: Register user with email/password and save full profile to Firestore ---
    setLoading(true);
    try {
      if (!formData.email || !formData.password) {
        setError('Email and password are required for registration.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Registration failed');

      const walletResponse = await patientAPI.generateWallet();
      if (!walletResponse.success) {
        throw new Error('Failed to generate wallet');
      }

      const patientDataToSave: User = {
        id: data.user.id,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        walletAddress: walletResponse.wallet.address,
        emergencyContact: formData.emergencyContact,
        qrCode: 'patient-emergency-qr-' + Math.random().toString(36).substr(2, 9),
      };

      await supabase.from('patients').insert(patientDataToSave);
      authContextLogin(data.user.id, patientDataToSave, 'patient');

    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in or use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Decide which handler to use based on isLogin state
  const handleSubmit = (e: React.FormEvent) => {
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegistration(e);
    }
  };

  const renderLoginForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mt-3">
          {error}
        </div>
      )}

      {/* Biometric Login (Optional, might need more complex integration) */}
      <div className="flex items-center justify-center space-x-4 pt-4">
        <button
          type="button"
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Biometric Login</span>
        </button>
      </div>
    </div>
  );

  const renderRegistrationStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                  required
                  disabled={loading}
                />
              </div>

              {/* Add email and password fields for registration in step 1 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6} // Corrected attribute name
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact & Wallet</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact (Optional)</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter emergency contact"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter wallet address or auto-generate"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, walletAddress: '0x' + Math.random().toString(16).substr(2, 40) })}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    disabled={loading}
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be used for blockchain transactions and emergency access
                </p>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Review & Generate QR</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Registration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">{formData.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium">{formData.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="font-medium text-xs">{formData.walletAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">{formData.emergencyContact || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-lg mb-4">
                <QrCode className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Your emergency QR code will be generated after registration
              </p>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-3">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            Secure your health. Be ready for any emergency.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isLogin ? renderLoginForm() : renderRegistrationStep()}

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled={loading} // Disable button during loading
            >
              {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin
                ? 'Login'
                : step === 3
                  ? 'Register and Generate Emergency QR'
                  : 'Continue'
              )}
            </button>
          </div>

          {!isLogin && step > 1 && (
            <button
              type="button"
              onClick={() => {
                setStep(step - 1);
                setError(null); // Clear errors when going back a step
              }}
              className="w-full mt-3 py-3 px-4 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={loading} // Disable button during loading
            >
              Back
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1); // Always reset to step 1 when toggling
              setError(null); // Clear errors
              setLoading(false); // Reset loading state
              setFormData({ // Clear form data for a fresh start
                email: '',
                password: '',
                name: '',
                dateOfBirth: '',
                gender: '',
                bloodGroup: '',
                emergencyContact: '',
                walletAddress: '',
                mobile: '', // Ensure mobile is cleared
              });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Register" : 'Already registered? Login'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
            Terms & Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};