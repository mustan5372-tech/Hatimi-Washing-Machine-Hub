import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertTriangle, X, UserCheck } from 'lucide-react';
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
  const users = getUsers();
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(users[0]?.email || 'admin@hatimiwmh.com');
  const [customEmail, setCustomEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'quick' | 'email'>('quick');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailToVerify = loginMode === 'quick' ? selectedUserEmail : customEmail.trim().toLowerCase();

    if (!emailToVerify) {
      setError('Please enter a valid email address.');
      return;
    }

    // Check against Whitelist of authorized staff accounts
    const foundUser = users.find(u => u.email.toLowerCase() === emailToVerify && u.active !== false);

    if (!foundUser) {
      setError(`Access Denied: Email "${emailToVerify}" is not authorized. Only approved staff accounts can access internal store data.`);
      return;
    }

    // Login successful
    saveCurrentUser(foundUser);
    onLoginSuccess(foundUser);
    onClose();
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3 border border-teal-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-wide text-white uppercase font-mono">
            Hatimi Staff Login
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authorized store owner and staff portal access
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setLoginMode('quick'); setError(null); }}
            className={`py-1.5 rounded-lg transition-colors ${loginMode === 'quick' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Authorized Accounts
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('email'); setError(null); }}
            className={`py-1.5 rounded-lg transition-colors ${loginMode === 'email' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Email Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMode === 'quick' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Select Authorized Account
              </label>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserEmail(u.email)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedUserEmail === u.email
                        ? 'bg-teal-950/50 border-teal-500/80 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-800/60 text-teal-300 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{u.name}</p>
                        <span className="text-[10px] text-slate-400 capitalize">{u.role} • {u.email}</span>
                      </div>
                    </div>
                    {selectedUserEmail === u.email && (
                      <UserCheck className="w-4 h-4 text-teal-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="admin@hatimiwmh.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Passcode / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default PIN for staff demo: enter any PIN or leave blank</p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-colors shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In to Store Dashboard
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Protected Store Portal • Hatimi Washing Machine Hub © 2026
          </p>
        </div>
      </div>
    </div>
  );
};
