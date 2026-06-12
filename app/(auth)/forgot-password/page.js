'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // The endpoint is generic by design; only a network/server error lands here.
      toast.error(err?.response?.data?.message || 'Could not send reset email. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-sail-primary rounded-lg flex items-center justify-center p-1.5">
            <Image src="/sail-logo-white.png" alt="SAIL-MIOM" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sail-text-primary">SAIL-MIOM</h1>
            <p className="text-xs text-sail-text-muted">Electrical Admin</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <MailCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-sail-text-primary mb-2">Check your email</h2>
            <p className="text-sail-text-secondary text-sm mb-6">
              If an account exists for <strong>{email.trim()}</strong>, a password reset link has been sent.
              The link expires in 30 minutes.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-sail-primary hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sail-text-primary mb-1">Forgot password?</h2>
            <p className="text-sail-text-secondary text-sm mb-8">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-sail-border bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors"
                  placeholder="you@miom.sail.in"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sail-primary hover:bg-sail-secondary text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send reset link'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-sail-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
