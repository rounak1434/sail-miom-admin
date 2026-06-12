'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing or invalid reset link.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'This reset link is invalid or has expired.');
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

        {done ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-sail-text-primary mb-2">Password updated</h2>
            <p className="text-sail-text-secondary text-sm mb-6">
              Your password has been reset. Redirecting you to sign in…
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-sail-primary hover:underline">
              <ArrowLeft className="w-4 h-4" /> Go to sign in
            </Link>
          </div>
        ) : !token ? (
          <div className="text-center">
            <h2 className="text-xl font-bold text-sail-text-primary mb-2">Invalid reset link</h2>
            <p className="text-sail-text-secondary text-sm mb-6">
              This link is missing its token. Request a new password reset email.
            </p>
            <Link href="/forgot-password" className="text-sm text-sail-primary hover:underline">
              Request a new link
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sail-text-primary mb-1">Set a new password</h2>
            <p className="text-sail-text-secondary text-sm mb-8">Choose a strong password of at least 8 characters.</p>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">New password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-sail-border bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors"
                    placeholder="Enter a new password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Confirm password</label>
                <input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-sail-border bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors"
                  placeholder="Re-enter the new password"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sail-primary hover:bg-sail-secondary text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sail-text-secondary text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
