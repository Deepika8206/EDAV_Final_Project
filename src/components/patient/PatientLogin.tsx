import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Fingerprint, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase'; // ✅ import Firebase instance
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export const PatientLogin: React.FC<{}> = (): JSX.Element => {
const [isLogin, setIsLogin] = useState(true);
const [step, setStep] = useState(1);
const [confirmationResult, setConfirmationResult] = useState<any>(null);
const [otpSent, setOtpSent] = useState(false);
const [formData, setFormData] = useState({
mobile: '',
email: '',
otp: '',
name: '',
dateOfBirth: '',
gender: '',
bloodGroup: '',
emergencyContact: '',
walletAddress: '',
});
const { login } = useAuth();

useEffect(() => {
if (!(window as any).recaptchaVerifier) {
(window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
size: 'invisible',
callback: () => {},
});
}
}, []);

const sendOtp = async () => {
try {
const appVerifier = (window as any).recaptchaVerifier;
const result = await signInWithPhoneNumber(auth, `+91${formData.mobile}`, appVerifier);
setConfirmationResult(result);
setOtpSent(true);
} catch (error) {
console.error('OTP send error:', error);
}
};

const verifyOtp = async () => {
try {
const result = await confirmationResult.confirm(formData.otp);
const firebaseUser = result.user;

  // Replace mockUser with real data if needed
  const mockUser = {
    id: firebaseUser.uid,
    name: 'John Doe',
    email: formData.email,
    mobile: formData.mobile,
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    bloodGroup: 'O+',
    walletAddress: '0x742d35Cc6634C0532925a3b8D03A6f2dc4f2e222',
    qrCode: 'patient-emergency-qr-123',
  };
  login(mockUser, 'patient');
} catch (error) {
  console.error('OTP verification failed', error);
}
};

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

if (isLogin) {
  if (!otpSent) {
    sendOtp();
  } else {
    verifyOtp();
  }
} else {
  if (step < 3) {
    setStep(step + 1);
  } else {
    // Mock registration
    const newUser = {
      id: 'user-new',
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      walletAddress: formData.walletAddress || '0x' + Math.random().toString(16).substr(2, 40),
      emergencyContact: formData.emergencyContact,
      qrCode: 'patient-emergency-qr-' + Math.random().toString(36).substr(2, 9),
    };
    login(newUser, 'patient');
  }
}
};

const renderLoginForm = () => (
<div className="space-y-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Mobile Number
</label>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center">
<Smartphone className="h-5 w-5 text-gray-400" />
</div>
<input
type="tel"
value={formData.mobile}
onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
placeholder="Enter mobile number"
/>
</div>
</div>

php-template
Copy
Edit
  {otpSent && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
      <input
        type="text"
        value={formData.otp}
        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter OTP"
      />
    </div>
  )}

  <div id="recaptcha-container"></div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
  >
    <span>{otpSent ? 'Verify OTP' : 'Send OTP'}</span>
  </button>

  <div className="flex items-center justify-center space-x-4 pt-4">
    <button
      type="button"
      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Fingerprint className="w-4 h-4" />
      <span>Biometric Login</span>
    </button>
  </div>
</div>
);};
