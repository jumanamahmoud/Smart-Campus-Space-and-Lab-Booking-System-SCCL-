"use client";

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student', // Tracks 'student' or 'admin'
    adminCode: '',   // Tracks the secret security pass
    staffId: ''      // Unique field specifically for Admin forms
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Tracks whether password text is visible
  
  // Track both the message text and the specific field to highlight
  const [errorStatus, setErrorStatus] = useState<{ field: string; text: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Secret passcode configuration
  const SECRET_ADMIN_PASSCODE = "UTM-MJIIT-2026";

  // Strong password rule: Min 8 chars, 1 upper, 1 lower, 1 number, 1 special character
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*~])(?=.{8,})/;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors dynamically when the user starts re-typing in the faulty field
    if (errorStatus && errorStatus.field === name) {
      setErrorStatus(null);
    }
  };

  const handleRoleChange = (selectedRole: 'student' | 'admin') => {
    setFormData((prev) => ({ 
      ...prev, 
      role: selectedRole,
      adminCode: '',
      staffId: '',
      email: '',
      password: ''
    }));
    setShowPassword(false); // Reset password visibility context on tab switch
    setErrorStatus(null); 
    setSuccessMessage(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    setSuccessMessage(null);

    // 1. Password Complexity Enforcement
    if (!PASSWORD_REGEX.test(formData.password)) {
      setLoading(false);
      setErrorStatus({
        field: 'password',
        text: 'Password weak: Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (!@#$%).',
      });
      return;
    }

    // 2. STUDENT EMAIL DOMAIN VALIDATION
    if (formData.role === 'student' && !formData.email.endsWith('@graduate.utm.my')) {
      setLoading(false);
      setErrorStatus({
        field: 'email',
        text: 'Invalid Email Address.',
      });
      return;
    }

    // 3. ADMIN/TEACHER EMAIL DOMAIN VALIDATION
    if (formData.role === 'admin' && !formData.email.endsWith('@utm.my')) {
      setLoading(false);
      setErrorStatus({
        field: 'email',
        text: 'Invalid Email Address.',
      });
      return;
    }

    // 4. ADMIN SECURITY GUARD: Validate Admin Secret Code Key
    if (formData.role === 'admin' && formData.adminCode !== SECRET_ADMIN_PASSCODE) {
      setLoading(false);
      setErrorStatus({
        field: 'adminCode',
        text: 'Invalid Administrative Verification Passcode.',
      });
      return;
    }

    // 5. ADMIN SECURITY GUARD: Enforce Admin Staff ID Prefix
    if (formData.role === 'admin' && !formData.staffId.startsWith("UTM")) {
      setLoading(false);
      setErrorStatus({
        field: 'staffId',
        text: 'Invalid Staff ID.',
      });
      return;
    }

    // 6. DATABASE SUBMISSION
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorStatus({
          field: result.field || 'generic',
          text: result.text || 'An unexpected error occurred during database registration.'
        });
      } else {
        setSuccessMessage(`Account setup complete! Welcome aboard, ${formData.username}.`);
      }
    } catch (err) {
      setErrorStatus({ 
        field: 'generic', 
        text: 'Network error: Failed to connect to the authentication server.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-8">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">SCCL Portal</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formData.role === 'admin' ? '🔑 Admin Registration Workspace' : '🎓 Student Registration Workspace'}
          </p>
        </div>

        {/* Global Success Alert Box */}
        {successMessage && (
          <div className="p-4 mb-4 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
            {successMessage}
          </div>
        )}

        {/* Global Error Alert Box */}
        {errorStatus && (
          <div className="p-4 mb-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100">
            {errorStatus.text}
          </div>
        )}

        {/* Role Toggle Tabs */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-gray-700">Register As</label>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => handleRoleChange('student')}
              className={`cursor-pointer text-center py-2.5 px-4 rounded-lg border font-semibold transition-all duration-150 ${
                formData.role === 'student'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎓 Student
            </div>

            <div 
              onClick={() => handleRoleChange('admin')}
              className={`cursor-pointer text-center py-2.5 px-4 rounded-lg border font-semibold transition-all duration-150 ${
                formData.role === 'admin'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛠️ Admin
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Universal Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="e.g. user123"
              className={`w-full px-3.5 py-2 border rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                errorStatus?.field === 'username' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
              }`}
            />
          </div>

          {/* STUDENT ONLY FORM WRAPPER */}
          {formData.role === 'student' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="username@graduate.utm.my"
                  className={`w-full px-3.5 py-2 border rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                    errorStatus?.field === 'email' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* ADMIN ONLY FORM WRAPPER */}
          {formData.role === 'admin' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official Faculty Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@utm.my"
                  className={`w-full px-3.5 py-2 border rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                    errorStatus?.field === 'email' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID Card Number</label>
                <input
                  type="text"
                  name="staffId"
                  required
                  value={formData.staffId}
                  onChange={handleInputChange}
                  placeholder="e.g. UTM-STAFF-984"
                  className={`w-full px-3.5 py-2 border rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors ${
                    errorStatus?.field === 'staffId' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <label className="block text-sm font-semibold text-amber-800">
                  🔒 Faculty Admin Verification Key
                </label>
                <input
                  type="password"
                  name="adminCode"
                  required={formData.role === 'admin'}
                  value={formData.adminCode}
                  onChange={handleInputChange}
                  placeholder="Enter admin authorization token"
                  className={`w-full px-3.5 py-2 border rounded-lg bg-white shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors ${
                    errorStatus?.field === 'adminCode' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-amber-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Universal Password Field with Show/Hide Inline Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'} // Switches input masking dynamically
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full pl-3.5 pr-12 py-2 border rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 transition-colors ${
                  formData.role === 'admin' 
                    ? 'focus:ring-amber-500/20 focus:border-amber-500' 
                    : 'focus:ring-blue-500/20 focus:border-blue-500'
                } ${
                  errorStatus?.field === 'password' ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                }`}
              />
              <button
                type="button" // Prevents default form submit interception
                onClick={togglePasswordVisibility}
                className={`absolute right-3 text-sm font-medium focus:outline-none select-none transition-colors ${
                  formData.role === 'admin' ? 'text-amber-600 hover:text-amber-800' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 mt-2 focus:outline-none focus:ring-2 ${
              formData.role === 'admin' 
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/50' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50'
            }`}
          >
            {loading ? 'Processing Registration...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
}