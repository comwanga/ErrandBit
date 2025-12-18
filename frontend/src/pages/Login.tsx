/**
 * Login Page
 * OTP-based phone authentication with improved structure
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { validatePhone, validateOTP } from '../utils/validation';

type AuthStep = 'phone' | 'otp';

interface LoginFormData {
  phone: string;
  otp: string;
  sessionId: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<AuthStep>('phone');
  const [formData, setFormData] = useState<LoginFormData>({
    phone: '',
    otp: '',
    sessionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle phone submission and OTP request
   */
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone
    const validation = validatePhone(formData.phone);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.requestOTP(formData.phone);
      setFormData((prev) => ({ ...prev, sessionId: response.sessionId }));
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP verification
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate OTP
    const validation = validateOTP(formData.otp);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid OTP');
      return;
    }

    setLoading(true);

    try {
      await login(formData.sessionId, formData.otp);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Development bypass - skip authentication for testing
   */
  const handleDevBypass = () => {
    const mockToken = 'dev-bypass-token-' + Date.now();
    const mockUser = {
      id: 'dev-user-' + Date.now(),
      phone: formData.phone || '+1234567890',
      display_name: 'Dev User',
    };

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    window.location.href = '/';
  };

  /**
   * Reset to phone step
   */
  const handleBackToPhone = () => {
    setStep('phone');
    setFormData((prev) => ({ ...prev, otp: '' }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to ErrandBit
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">Non-KYC Lightning marketplace</p>
        <p className="mt-1 text-center text-xs text-purple-600 font-medium">
          No ID required • Fully pseudonymous • Privacy-first
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <PhoneForm
              phone={formData.phone}
              onPhoneChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
              onSubmit={handleRequestOTP}
              onDevBypass={handleDevBypass}
              loading={loading}
              error={error}
            />
          ) : (
            <OTPForm
              phone={formData.phone}
              otp={formData.otp}
              onOTPChange={(otp) => setFormData((prev) => ({ ...prev, otp }))}
              onSubmit={handleVerifyOTP}
              onBack={handleBackToPhone}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Phone input form component
 */
interface PhoneFormProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDevBypass: () => void;
  loading: boolean;
  error: string;
}

const PhoneForm: React.FC<PhoneFormProps> = ({
  phone,
  onPhoneChange,
  onSubmit,
  onDevBypass,
  loading,
  error,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number (Optional, Unverified)
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+1234567890 (no verification required)"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          <strong>Privacy Note:</strong> Phone is optional and never verified. We don't link it to your
          identity.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>

        <button
          type="button"
          onClick={onDevBypass}
          className="w-full flex justify-center py-2 px-4 border-2 border-yellow-400 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          Skip Login (Dev Mode)
        </button>
        <p className="text-xs text-center text-gray-500">Development bypass - skip authentication for testing</p>
      </div>
    </form>
  );
};

/**
 * OTP verification form component
 */
interface OTPFormProps {
  phone: string;
  otp: string;
  onOTPChange: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

const OTPForm: React.FC<OTPFormProps> = ({ phone, otp, onOTPChange, onSubmit, onBack, loading, error }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
        <div className="mt-1">
          <input
            id="otp"
            name="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => onOTPChange(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl tracking-widest"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Enter the 6-digit code sent to {phone}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Change Phone Number
        </button>
      </div>
    </form>
  );
};
