import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cloud,
  Database,
  UserPlus,
  Users,
  Building,
  Save,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Key,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { BusinessSettings, UserProfile } from '../../types';
import { updateSettings, getUsers, saveUser, deleteUser } from '../../services/store';
import { initFirebase } from '../../services/firebase';

interface SettingsViewProps {
  settings: BusinessSettings;
  currentUser: UserProfile;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  currentUser,
  onUpdateSettings
}) => {
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [users, setUsers] = useState<UserProfile[]>(getUsers());
  const [activeSubTab, setActiveSubTab] = useState<'firebase' | 'accounts' | 'business'>('firebase');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Firebase Form State
  const [fbConfig, setFbConfig] = useState({
    apiKey: settings.firebaseApiKey || '',
    authDomain: settings.firebaseAuthDomain || '',
    projectId: settings.firebaseProjectId || '',
    storageBucket: settings.firebaseStorageBucket || '',
    messagingSenderId: settings.firebaseMessagingSenderId || '',
    appId: settings.firebaseAppId || ''
  });
  // New Account Form State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    role: 'staff' as 'admin' | 'staff'
  });

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Business Settings Save
  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateSettings(settings);
    onUpdateSettings(updated);
    showNotification('Shop business settings saved successfully!');
  };

  // Handle Firebase Credentials Save & Test Connection
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();

    const success = initFirebase({
      apiKey: fbConfig.apiKey,
      authDomain: fbConfig.authDomain,
      projectId: fbConfig.projectId,
      storageBucket: fbConfig.storageBucket,
      messagingSenderId: fbConfig.messagingSenderId,
      appId: fbConfig.appId
    });

    const isConnected = Boolean(success && fbConfig.apiKey && fbConfig.projectId);

    const updated = updateSettings({
      firebaseConfigured: isConnected,
      firebaseApiKey: fbConfig.apiKey,
      firebaseAuthDomain: fbConfig.authDomain,
      firebaseProjectId: fbConfig.projectId,
      firebaseStorageBucket: fbConfig.storageBucket,
      firebaseMessagingSenderId: fbConfig.messagingSenderId,
      firebaseAppId: fbConfig.appId
    });

    onUpdateSettings(updated);

    if (isConnected) {
      showNotification('Firebase Console connected & real-time sync active!');
    } else {
      showNotification('Firebase configuration saved (offline mode fallback active).');
    }
  };

  // Handle Add New Staff Account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.email) return;

    const emailClean = newAccount.email.trim().toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === emailClean);

    if (exists) {
      alert(`Account with email "${emailClean}" already exists.`);
      return;
    }

    const defaultPin = newAccount.role === 'admin' ? '515253' : '012345';
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: newAccount.name.trim(),
      email: emailClean,
      phone: newAccount.phone.trim() || '+91 98000 00000',
      role: newAccount.role,
      pin: newAccount.pin.trim() || defaultPin,
      active: true
    };

    saveUser(newUser);
    setUsers(getUsers());
    setNewAccount({ name: '', email: '', phone: '', pin: '', role: 'staff' });
    setIsAddAccountOpen(false);
    showNotification(`New authorized ${newAccount.role} account created: ${newUser.name}`);
  };

  // Toggle Account Access
  const handleToggleAccountActive = (user: UserProfile) => {
    if (user.email === currentUser.email) {
      alert("You cannot disable your own active logged-in account.");
      return;
    }
    const updatedUser = { ...user, active: !user.active };
    saveUser(updatedUser);
    setUsers(getUsers());
    showNotification(`Account access ${updatedUser.active ? 'granted' : 'revoked'} for ${user.name}`);
  };

  // Delete Staff Account
  const handleDeleteAccount = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteUser(id);
      setUsers(getUsers());
      showNotification(`Account "${name}" removed from authorized staff list.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-600 text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Shop Settings & Multi-Account Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure Firebase cloud database, grant/revoke staff account access, and update shop details.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('firebase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'firebase'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Firebase Console Setup
        </button>

        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'accounts'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Authorized Staff Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('business')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'business'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          Business Info & Invoicing
        </button>
      </div>

      {/* TAB 1: FIREBASE CONSOLE CLOUD SETUP */}
      {activeSubTab === 'firebase' && (
        <div className="space-y-6">
          {/* Cloud Status Card */}
          <div className="card-panel p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                settings.firebaseConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Cloud Database Status:
                  {settings.firebaseConfigured ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-extrabold border border-emerald-800">
                      🟢 Connected to Firebase Firestore
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-extrabold border border-amber-800">
                      🟡 Local Storage Ready (Cloud Standby)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connecting to Firebase Firestore syncs your inventory stock, sales invoices, and staff accounts across multiple mobile devices.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <HelpCircle className="w-4 h-4 text-teal-400" />
              {showGuide ? 'Hide Setup Instructions' : 'How to Create Firebase Console'}
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Step-by-Step Guide Accordion */}
          {showGuide && (
            <div className="card-panel p-5 bg-teal-950/30 border border-teal-800/60 rounded-2xl space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Step-by-Step Firebase Console Setup Guide:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-teal-400 font-bold underline">console.firebase.google.com</a> and sign in with your Google account.
                </li>
                <li>
                  Click <strong>"Add Project"</strong> and name your project <code>Hatimi-Washing-Machine-Hub</code>.
                </li>
                <li>
                  In your new Firebase project, click the <strong>Web Icon (<code>&lt;/&gt;</code>)</strong> to register a Web App.
                </li>
                <li>
                  Copy the <code>firebaseConfig</code> object values (apiKey, projectId, appId, etc.) and paste them into the form below.
                </li>
                <li>
                  Navigate to <strong>Build → Firestore Database</strong>, click <em>Create Database</em> (Start in Production mode).
                </li>
                <li>
                  Click <strong>Save & Test Firebase Connection</strong> below to activate real-time cloud sync!
                </li>
              </ol>
            </div>
          )}

          {/* Firebase Form */}
          <form onSubmit={handleSaveFirebaseConfig} className="card-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Firebase App Configuration Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">API Key</label>
                <input
                  type="text"
                  value={fbConfig.apiKey}
                  onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project ID</label>
                <input
                  type="text"
                  value={fbConfig.projectId}
                  onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                  placeholder="hatimi-washing-machine-hub"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={fbConfig.authDomain}
                  onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                  placeholder="hatimi-washing-machine-hub.firebaseapp.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={fbConfig.storageBucket}
                  onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                  placeholder="hatimi-washing-machine-hub.appspot.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Messaging Sender ID</label>
                <input
                  type="text"
                  value={fbConfig.messagingSenderId}
                  onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                  placeholder="123456789012"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">App ID</label>
                <input
                  type="text"
                  value={fbConfig.appId}
                  onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                  placeholder="1:123456789012:web:abc123def456"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Save & Test Firebase Connection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: AUTHORIZED STAFF ACCOUNTS MANAGER */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Staff Access Rights & Roles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Only accounts listed here can log into the store dashboard. Revoke access at any time to block entry.
              </p>
            </div>

            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Add Authorized Account
            </button>
          </div>

          {/* Add Account Modal */}
          {isAddAccountOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Grant New Authorized Account Access
                </h3>

                <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="e.g. Ali Asghar"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Authorized Email Address</label>
                    <input
                      type="email"
                      required
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                      placeholder="aliasghar@hatimiwmh.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newAccount.phone}
                      onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                      placeholder="+91 98200 00000"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Login PIN (6 digits)</label>
                    <input
                      type="password"
                      value={newAccount.pin}
                      onChange={(e) => setNewAccount({ ...newAccount, pin: e.target.value })}
                      placeholder="Leave blank for default PIN"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Default: Admin=515253, Staff=012345</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Role</label>
                    <select
                      value={newAccount.role}
                      onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-semibold"
                    >
                      <option value="staff">Staff (Sales, Buy & Stock Entry)</option>
                      <option value="admin">Admin (Full Access & Store Settings)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAccountOpen(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md"
                    >
                      Grant Access
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User Accounts Table */}
          <div className="card-panel overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name & Email</th>
                  <th>Role</th>
                  <th>Contact Phone</th>
                  <th>Access Permission Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {u.phone || 'N/A'}
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleAccountActive(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-colors ${
                          u.active !== false
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 hover:bg-red-200'
                        }`}
                      >
                        {u.active !== false ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-red-500" />}
                        {u.active !== false ? 'Active Access' : 'Revoked / Disabled'}
                      </button>
                    </td>

                    <td className="text-right">
                      {u.email !== currentUser.email && (
                        <button
                          onClick={() => handleDeleteAccount(u.id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          title="Remove Account Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHOP BUSINESS INFO */}
      {activeSubTab === 'business' && (
        <form onSubmit={handleSaveBusinessSettings} className="card-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Store Contact Details & Billing Defaults
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Name</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">UPI ID for Payment QR</label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Business Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
