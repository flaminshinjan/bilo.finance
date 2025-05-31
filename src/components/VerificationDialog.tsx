import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export function VerificationDialog({ email }: { email: string }) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResend = async () => {
    setResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;
      setResendStatus('success');
    } catch (error) {
      console.error('Error resending verification:', error);
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Image
              src="/logo.png"
              alt="Bilo Logo"
              fill
              className="object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <span className="font-medium text-gray-900">{email}</span>. 
            Please check your inbox and click the link to verify your account.
          </p>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full bg-primary text-black px-6 py-3 rounded-full font-medium hover:bg-primary/80 transition-colors text-center"
            >
              Go to Login
            </Link>
            
            <div className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={handleResend}
                disabled={resending}
                className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Resending...' : 'resend verification email'}
              </button>
            </div>

            {resendStatus === 'success' && (
              <div className="text-sm text-green-600">
                Verification email has been resent successfully!
              </div>
            )}

            {resendStatus === 'error' && (
              <div className="text-sm text-red-600">
                Failed to resend verification email. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 