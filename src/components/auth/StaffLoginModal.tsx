import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertTriangle, X, Loader2 } from 'lucide-react';
import type { UserProfile } from '../../types';
import { getUsers, setCurrentUser as saveCurrentUser } from '../../services/store';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailClean = email.trim().toLowerCase();
    const pinClean = pin.trim();

    if (!emailClean) {
      setError('Please enter your authorized email address.');
      setIsLoading(false);
      return;
    }

    if (!pinClean) {
      setError('PIN is required. Contact your store admin if you forgot your PIN.');
      setIsLoading(false);
      return;
    }

    // Simulate brief auth delay for UX
    setTimeout(() => {
      const users = getUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === emailClean && u.active !== false);

      if (!foundUser) {
        setError('Access Denied: This email is not registered as an authorized staff account.');
        setIsLoading(false);
        return;
      }

      // Verify PIN
      const expectedPin = foundUser.pin || (foundUser.role === 'admin' ? '515253' : '012345');
      if (pinClean !== expectedPin) {
        setError('Incorrect PIN. Please try again or contact the store admin.');
        setIsLoading(false);
        return;
      }

      // Login successful
      saveCurrentUser(foundUser);
      onLoginSuccess(foundUser);
      setEmail('');
      setPin('');
      setError(null);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black tracking-wide text-white uppercase font-mono">
            Staff Portal Login
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authorized store personnel only. Enter your credentials to access the dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Authorized Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@hatimiwmh.com"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                maxLength={10}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-colors shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Sign In to Store Dashboard
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Protected Store Portal • Unauthorized access is prohibited
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Hatimi Washing Machine Hub © 2026
          </p>
        </div>
      </div>
    </div>
  );
};
