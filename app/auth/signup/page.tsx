'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { BsEyeFill, BsEye } from 'react-icons/bs'; // Import eye icons
import { useState } from 'react'; // Import useState for managing state

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' }); // Declare formData state
  const [showPassword, setShowPassword] = useState(false); // Declare showPassword state
  const [loading, setLoading] = useState(false); // Declare loading state

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        // Automatically sign in the user after successful signup
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
          callbackUrl: '/auth/onboarding',
        });

        if (signInResult?.error) {
          router.push('/auth/login?message=Account created. Please log in.');
          return;
        }

        if (signInResult?.url) {
          window.location.href = signInResult.url;
          return;
        }

        if (signInResult?.ok) {
          router.push('/auth/onboarding');
          return;
        }

        router.push('/auth/login?message=Account created. Please log in.');
      } else {
        const error = await response.json();
        alert(error.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              L
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LoopBuild</h1>
          </div>
          <p className="text-gray-600">Construction Project Management</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your Account</h2>
            <p className="text-gray-600 mb-4">
              Join LoopBuild to manage your construction projects efficiently.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 text-sm mb-6">Join thousands of construction teams</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <BsEye className="w-5 h-5" /> : <BsEyeFill className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="rounded mt-1" required />
              <span className="text-xs text-gray-600">
                I agree to the{' '}
                <Link href="#" className="text-indigo-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 font-medium transition"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
