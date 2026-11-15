import React, { useState } from 'react';
import { X, ShieldCheck, Music, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'analyst' | 'user'>('analyst');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (authModalMode === 'login') {
      await login(email, password);
    } else {
      await register(name, email, password, role);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-dark-secondary border border-dark-border rounded-2xl p-6 md:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary-light text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <Music className="w-3.5 h-3.5 text-primary" />
            <span>CHILLMODE SECURE GATEWAY</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {authModalMode === 'login' ? 'Access Investigation Hub' : 'Create CHILLMODE Identity'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Seamlessly toggle between cyber OSINT reconnaissance and legal music streaming
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mb-6 p-3 rounded-xl bg-dark-card border border-primary/20 flex flex-col gap-2">
          <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Instant Demo Access (No password required)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsDemo('analyst')}
              className="py-1.5 px-3 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-xs font-semibold text-primary-light transition-all text-center"
            >
              Demo Analyst
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo('user')}
              className="py-1.5 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 text-xs font-semibold text-accent-light transition-all text-center"
            >
              Demo Listener
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center mb-5">
          <div className="flex-grow border-t border-dark-border"></div>
          <span className="flex-shrink mx-3 text-xs text-gray-500 uppercase font-mono">Or Continue With Email</span>
          <div className="flex-grow border-t border-dark-border"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="listener@chillmode.io"
                className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Primary Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('analyst')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    role === 'analyst'
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-dark-border bg-dark-bg text-gray-400 hover:text-white'
                  }`}
                >
                  Cyber Analyst
                </button>
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    role === 'user'
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-dark-border bg-dark-bg text-gray-400 hover:text-white'
                  }`}
                >
                  Standard User
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-sm text-white transition-opacity shadow-glow-primary disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-5 text-xs text-gray-400">
          {authModalMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-primary-light hover:underline font-medium"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-primary-light hover:underline font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

