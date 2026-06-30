"use client";

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false); // Tracks whether password is visible
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorStatus) setErrorStatus(null);
  };

  // Toggle the visibility state
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorStatus(result.text || 'An unexpected error occurred during login.');
      } else {
        setSuccessMessage(`Welcome back, ${result.user.username}! Redirecting...`);
        
        localStorage.setItem('user_session', JSON.stringify(result.user));

        if (result.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err) {
      setErrorStatus('Network error: Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-8">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">SCCL Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your spaces and lab bookings</p>
        </div>

        {/* Success Box */}
        {successMessage && (
          <div className="p-4 mb-4 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
            {successMessage}
          </div>
        )}

        {/* Error Box */}
        {errorStatus && (
          <div className="p-4 mb-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100">
            {errorStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <input
              type="text"
              name="identifier"
              required
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter email or username"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password Field with Inline Action Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'} // Dynamically switches input types
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-12 py-2 border border-gray-300 rounded-lg shadow-sm outline-none text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                type="button" // Important so it doesn't accidentally trigger form submission
                onClick={togglePasswordVisibility}
                className="absolute right-3 text-sm font-medium text-gray-500 hover:text-blue-600 focus:outline-none select-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}