import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Server, Shield, Save, Eye, EyeOff,
  Moon, Key, Mail, Phone, Camera, Check, type LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, color, children }: {
  title: string;
  icon: LucideIcon;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6"
  >
    <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <h2 className="font-bold text-white text-sm">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Toggle = ({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(0,240,255,0.06)' }}>
    <div>
      <div className="text-sm font-medium text-white">{label}</div>
      {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full transition-all relative"
      style={{ background: checked ? 'var(--accent-cyan)' : 'rgba(0,240,255,0.15)' }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  </div>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'darker'>('dark');

  const [notifs, setNotifs] = useState({
    criticalThreats: true,
    newIncidents: true,
    weeklyReports: true,
    aiAlerts: true,
    blockActions: false,
    emailAlerts: true,
    systemUpdates: false,
  });

  const [system, setSystem] = useState({
    autoBlock: true,
    autoIncident: true,
    aiExplainability: true,
    realTimeMonitor: true,
    dataRetention: '90',
    updateInterval: '5',
  });

  const handleSave = async () => {
    toast.loading('Saving changes...', { id: 'save' });
    await new Promise(r => setTimeout(r, 900));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success('Settings saved successfully!', { id: 'save' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage your profile, security, notifications, and system preferences
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User} color="#00F0FF">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #00F0FF, #3377FF)', color: '#030712' }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.3)' }}
              onClick={() => toast.success('Avatar upload coming soon!')}>
              <Camera size={10} style={{ color: 'var(--accent-cyan)' }} />
            </button>
          </div>
          <div>
            <div className="font-bold text-white">{user?.name}</div>
            <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.role}</div>
            <div className="text-xs mt-2 px-2 py-0.5 rounded-full inline-block"
              style={{ background: 'rgba(0,255,163,0.1)', color: '#00FFA3' }}>
              Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', val: name, set: setName, icon: User },
            { label: 'Email Address', val: email, set: setEmail, icon: Mail },
            { label: 'Phone Number', val: phone, set: setPhone, icon: Phone },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              <div className="relative">
                <f.icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={f.val} onChange={e => f.set(e.target.value)}
                  className="input-field pl-9 py-2.5 text-sm" />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Role</label>
            <div className="input-field py-2.5 text-sm flex items-center gap-2"
              style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}>
              <Shield size={13} style={{ color: 'var(--accent-cyan)' }} />
              {user?.role} (managed by admin)
            </div>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock} color="#FF3366">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
            <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)}
              className="input-field py-2.5 text-sm" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                className="input-field py-2.5 text-sm pr-10" placeholder="Enter new password" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {newPass && (
            <div className="space-y-1">
              {[
                { label: '8+ characters', ok: newPass.length >= 8 },
                { label: 'Uppercase letter', ok: /[A-Z]/.test(newPass) },
                { label: 'Number', ok: /[0-9]/.test(newPass) },
                { label: 'Special character', ok: /[^A-Za-z0-9]/.test(newPass) },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2 text-xs"
                  style={{ color: r.ok ? '#00FFA3' : 'var(--text-muted)' }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${r.ok ? 'bg-green-400' : 'bg-gray-600'}`} />
                  {r.label}
                </div>
              ))}
            </div>
          )}
          <button className="btn-danger text-sm py-2.5 px-5"
            onClick={() => toast.success('Password changed successfully!')}>
            Change Password
          </button>
        </div>

        <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)' }}>
          <div className="text-xs font-semibold text-white mb-3">Active Sessions</div>
          {[
            { browser: 'Chrome 121 · Windows 11', ip: '192.168.1.5', time: 'Now', current: true },
            { browser: 'Firefox 122 · macOS', ip: '10.0.0.12', time: '2 hours ago', current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs text-white">{s.browser}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.ip} · {s.time}</div>
              </div>
              {s.current ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,163,0.1)', color: '#00FFA3' }}>Current</span>
              ) : (
                <button className="text-[10px]" style={{ color: 'var(--accent-red)' }}
                  onClick={() => toast.success('Session terminated')}>Revoke</button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} color="#FFD500">
        <div className="space-y-0">
          {[
            { key: 'criticalThreats', label: 'Critical Threat Alerts', desc: 'Immediate alerts for critical threats' },
            { key: 'newIncidents', label: 'New Incident Notifications', desc: 'Notify when new incidents are created' },
            { key: 'weeklyReports', label: 'Weekly Report Delivery', desc: 'Email weekly summaries every Monday' },
            { key: 'aiAlerts', label: 'AI Detection Alerts', desc: 'Alerts from the AI engine' },
            { key: 'blockActions', label: 'Block Action Confirmations', desc: 'Notify when IPs are blocked' },
            { key: 'emailAlerts', label: 'Email Notifications', desc: 'Send alerts to registered email' },
            { key: 'systemUpdates', label: 'System Updates', desc: 'Model retraining and updates' },
          ].map(n => (
            <Toggle key={n.key} label={n.label} desc={n.desc}
              checked={notifs[n.key as keyof typeof notifs]}
              onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
          ))}
        </div>
      </Section>

      {/* Theme */}
      <Section title="Appearance" icon={Palette} color="#B042FF">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark Navy', bg: '#030712', accent: '#00F0FF' },
            { id: 'darker', label: 'Deep Black', bg: '#000000', accent: '#00F0FF' },
            { id: 'midnight', label: 'Midnight Blue', bg: '#060D1A', accent: '#3377FF' },
          ].map(t => (
            <button key={t.id}
              onClick={() => { setTheme(t.id as 'dark' | 'darker'); toast.success(`Theme: ${t.label}`); }}
              className="p-4 rounded-xl border transition-all text-left"
              style={{
                background: t.bg,
                borderColor: theme === t.id ? t.accent : 'rgba(0,240,255,0.1)',
                boxShadow: theme === t.id ? `0 0 0 1px ${t.accent}` : undefined,
              }}>
              <div className="w-6 h-6 rounded-full mb-2" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}60` }} />
              <div className="text-xs font-medium text-white">{t.label}</div>
              {theme === t.id && <div className="text-[9px] mt-0.5" style={{ color: t.accent }}>Active</div>}
            </button>
          ))}
        </div>
      </Section>

      {/* System */}
      <Section title="System Configuration" icon={Server} color="#3377FF">
        <div className="space-y-0 mb-4">
          {[
            { key: 'autoBlock', label: 'Auto-Block Critical Threats', desc: 'Automatically block IPs with risk score >90' },
            { key: 'autoIncident', label: 'Auto-Create Incidents', desc: 'Create incidents automatically for High+ severity' },
            { key: 'aiExplainability', label: 'AI Explainability (XAI)', desc: 'Show SHAP values for all predictions' },
            { key: 'realTimeMonitor', label: 'Real-Time Monitoring', desc: 'Enable live WebSocket traffic feed' },
          ].map(s => (
            <Toggle key={s.key} label={s.label} desc={s.desc}
              checked={system[s.key as keyof typeof system] as boolean}
              onChange={v => setSystem(prev => ({ ...prev, [s.key]: v }))} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Data Retention (days)</label>
            <input type="number" value={system.dataRetention}
              onChange={e => setSystem(prev => ({ ...prev, dataRetention: e.target.value }))}
              className="input-field py-2.5 text-sm" min="30" max="365" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Dashboard Update Interval (sec)</label>
            <input type="number" value={system.updateInterval}
              onChange={e => setSystem(prev => ({ ...prev, updateInterval: e.target.value }))}
              className="input-field py-2.5 text-sm" min="1" max="60" />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(51,119,255,0.06)', border: '1px solid rgba(51,119,255,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Key size={13} style={{ color: '#3377FF' }} />
            <span className="text-xs font-semibold text-white">API Key</span>
          </div>
          <div className="flex items-center gap-3">
            <input type="password" value="sk-aegissoc-••••••••••••••••" readOnly
              className="input-field text-sm py-2 flex-1 font-mono" />
            <button className="btn-ghost text-xs py-2 px-3"
              onClick={() => toast.success('API key copied to clipboard!')}>Copy</button>
            <button className="btn-ghost text-xs py-2 px-3"
              onClick={() => toast.success('New API key generated!')}>Regenerate</button>
          </div>
        </div>
      </Section>
    </div>
  );
}
