'use client';
import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, Shield, FileText, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const features = [
  { icon: Shield, text: 'Centralized complaint management' },
  { icon: FileText, text: '2000+ electrical drawings library' },
  { icon: BarChart3, text: 'Real-time SLA tracking & analytics' },
];

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      // Send the user back to the page that bounced them here (middleware sets ?from=…),
      // falling back to the dashboard. Only allow internal paths to avoid open redirects.
      const from = searchParams.get('from');
      const dest = from && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard';
      router.replace(dest);
    }
    if (searchParams.get('expired') === 'true') toast.error('Your session expired. Please sign in again.');
  }, [isAuthenticated, searchParams, router]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data) => login(data);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-2/5 bg-sail-sidebar hidden lg:flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-64 h-64 bg-sail-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-sail-orange/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-sail-primary rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">SAIL-MIOM</h1>
              <p className="text-slate-400 text-sm">Electrical Department</p>
            </div>
          </div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sail-primary/30 text-sail-secondary rounded-full text-xs font-semibold border border-sail-primary/30 mb-4">
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </span>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Meghahatuburu<br />Iron Ore Mine
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Steel Authority of India Limited — Electrical Department Administration System
            </p>
          </div>
          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sail-primary/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-sail-secondary" />
                </div>
                <p className="text-slate-300 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-slate-500 text-xs">System online · v1.0.0</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-sail-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-sail-text-primary">SAIL-MIOM</h1>
              <p className="text-xs text-sail-text-muted">Electrical Admin</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-sail-text-primary mb-1">Welcome back</h2>
          <p className="text-sail-text-secondary text-sm mb-8">Sign in to your admin account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-sail-text-primary mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-sail-border bg-white'}`}
                placeholder="you@miom.sail.in"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-sail-text-primary">Password</label>
                <button
                  type="button"
                  onClick={() => toast.info('Contact your system administrator to reset your password.')}
                  className="text-xs text-sail-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-sail-border bg-white'}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register('rememberMe')} type="checkbox" id="remember" className="w-4 h-4 rounded border-sail-border" />
              <label htmlFor="remember" className="text-sm text-sail-text-secondary cursor-pointer">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sail-primary hover:bg-sail-secondary text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-sail-text-muted mt-8">
            SAIL-MIOM Electrical Admin · v1.0.0<br />
            <span className="text-slate-400">© {new Date().getFullYear()} Steel Authority of India Limited</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-sail-sidebar">
        <div className="text-white text-sm">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
