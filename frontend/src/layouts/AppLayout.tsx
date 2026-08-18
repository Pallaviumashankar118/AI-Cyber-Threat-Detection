import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shield, Radar, BrainCircuit,
  FileText, Settings, LogOut, Bell, Search, ChevronLeft,
  ChevronRight, AlertTriangle, Activity, Menu, MessageSquare, X, Send,
  Cpu, Database, Cloud, Wifi, Key, HelpCircle, Keyboard, Play, Landmark, Users, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { generateNotifications } from '../utils/mockData';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/threats', icon: Shield, label: 'Threat Monitor' },
  { path: '/attack-lab', icon: Radar, label: 'Attack Simulation Center' },
  { path: '/ai-analytics', icon: BrainCircuit, label: 'AI Analytics' },
  { path: '/incidents', icon: AlertTriangle, label: 'Incident Center' },
  { path: '/prediction-history', icon: History, label: 'Prediction History' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const notifications = generateNotifications();

const ORGS = ['Acme Corp', 'Finance Group', 'Healthcare Demo', 'Government Demo'];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { chatMessages, sendChatMessage, notifications: liveNotifications, markNotificationRead, clearAllNotifications } = useSecurity();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !localStorage.getItem('aegissoc_onboarded'));

  // Multi-Organization Switching
  const [activeOrg, setActiveOrg] = useState(() => localStorage.getItem('aegissoc_org') || 'Acme Corp');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Chat window state (AI Copilot)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Shortcuts overlay state
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Live Real-Time SOC Clock
  const [socTime, setSocTime] = useState(new Date());

  const searchInputRef = useRef<HTMLInputElement>(null);



  const unread = liveNotifications.filter((n: any) => !n.is_read).length;

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setSocTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts Mappings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/dashboard');
        toast.success('Navigated to Dashboard');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/attack-lab');
        toast.success('Navigated to Attack Lab');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate('/reports');
        toast.success('Navigated to Reports');
      }
      if (e.key === 'Escape') {
        setShowNotifs(false);
        setChatOpen(false);
        setShortcutsOpen(false);
        setSearchVal('');
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const triggerCopilotAction = (actionText: string) => {
    sendChatMessage(actionText);
    toast.success(`Copilot: processing "${actionText}"`);
  };

  const closeOnboarding = () => {
    localStorage.setItem('aegissoc_onboarded', 'true');
    setOnboardingOpen(false);
    toast.success('Welcome to AegisSOC!');
  };

  const handleSelectOrg = (org: string) => {
    localStorage.setItem('aegissoc_org', org);
    setActiveOrg(org);
    setOrgDropdownOpen(false);
    toast.success(`Switched organization context to: ${org}`);
    window.dispatchEvent(new Event('storage'));
  };

  const sidebarW = collapsed ? 72 : 240;

  return (
    <div className="flex h-screen overflow-hidden flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Main Workspace Row ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="cyber-grid" />

        {/* ── Mobile Overlay ────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar ───────────────────────────────────── */}
        <motion.aside
          animate={{ width: sidebarW }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={`
            fixed lg:relative z-50 flex flex-col h-full border-r border-[rgba(0,240,255,0.1)]
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform lg:transition-none
          `}
          style={{ background: 'var(--sidebar)', minWidth: sidebarW, maxWidth: sidebarW }}
        >
          {/* Logo / Multi-Org Selector */}
          <div className="px-4 py-5 border-b border-[rgba(0,240,255,0.1)] relative">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00F0FF] to-[#4DA6FF]">
                  <Shield size={18} className="text-[#08111F]" />
                </div>
                {!collapsed && (
                  <div>
                    <div className="font-bold text-white text-sm leading-tight font-mono truncate max-w-[120px]">{activeOrg}</div>
                    <div className="text-[9px] font-mono text-slate-500">Click to switch org</div>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronRight size={14} className="text-slate-500 transform rotate-90" />}
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {orgDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-4 right-4 top-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 z-55 shadow-2xl font-mono text-[10px]"
                >
                  {ORGS.map(o => (
                    <button
                      key={o}
                      onClick={() => handleSelectOrg(o)}
                      className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-950 text-white ${
                        activeOrg === o ? 'text-[#00F0FF] font-bold bg-slate-950/50' : ''
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-[rgba(0,240,255,0.1)]">
            {!collapsed && (
              <div className="flex items-center gap-3 p-2 mb-2 rounded-xl" style={{ background: 'rgba(0,240,255,0.05)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00F0FF, #4DA6FF)', color: '#08111F' }}>
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--accent-cyan)' }}>{user?.role}</div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="nav-item w-full text-left" title={collapsed ? 'Logout' : undefined}>
              <LogOut size={18} className="flex-shrink-0" style={{ color: 'var(--accent-red)' }} />
              {!collapsed && <span className="text-sm font-medium" style={{ color: 'var(--accent-red)' }}>Logout</span>}
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center border transition-all"
            style={{ background: 'var(--sidebar)', borderColor: 'rgba(0,240,255,0.3)', color: 'var(--accent-cyan)' }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </motion.aside>

        {/* ── Main Content Area ─────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="flex items-center gap-4 px-6 py-4 border-b border-[rgba(0,240,255,0.08)] z-30"
            style={{ background: 'rgba(11,23,40,0.8)', backdropFilter: 'blur(20px)' }}>
            
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-400">
              <Menu size={20} />
            </button>

            {/* Smart Search Input with hotkey badge & helper list */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search threats, incidents, assets... (Ctrl+K)"
                value={searchVal}
                onFocus={() => setSearchFocused(true)}
                onChange={e => setSearchVal(e.target.value)}
                className="input-field pl-9 pr-16 py-2 text-sm w-full font-mono"
                style={{ background: 'rgba(8,17,31,0.6)' }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded pointer-events-none">
                Ctrl+K
              </span>

              {/* Search Suggestions Panel */}
              <AnimatePresence>
                {searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-11 bg-slate-900 border border-slate-800 rounded-xl p-3 z-50 shadow-2xl space-y-3 font-mono text-[9px]"
                  >
                    <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase font-bold">
                      <span>Smart Suggestions</span>
                      <button onClick={() => setSearchFocused(false)} className="hover:text-white">Close</button>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-slate-500 uppercase text-[7px] font-bold">Saved Filters</div>
                      <button onClick={() => { setSearchVal('severity:Critical'); setSearchFocused(false); }} className="block text-slate-300 hover:text-[#00F0FF]">• Critical Incidents Only</button>
                      <button onClick={() => { setSearchVal('status:Blocked'); setSearchFocused(false); }} className="block text-slate-300 hover:text-[#00F0FF]">• WAF Edge Blocks</button>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-slate-500 uppercase text-[7px] font-bold">Bookmarks</div>
                      <button onClick={() => { navigate('/reports'); setSearchFocused(false); }} className="block text-slate-300 hover:text-[#00F0FF]">• Weekly Risk Report Assessment</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Clock & Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden md:flex flex-col items-end text-[10px] font-mono text-slate-400">
                <span>SOC CLOCK: {socTime.toLocaleTimeString()}</span>
                <span className="text-[8px] text-[#00F0FF]">ZONE: UTC+05:30 (SYNCED)</span>
              </div>

              {/* Shortcuts trigger */}
              <button
                onClick={() => setShortcutsOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white"
                title="Keyboard Shortcuts Map (Ctrl+/)"
              >
                <Keyboard size={16} />
              </button>

              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative w-9 h-9 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center transition-all"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-red-500 text-white">
                      {unread}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 w-80 glass-card z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-850 bg-slate-950/90 font-mono text-xs font-bold text-white flex justify-between items-center">
                        <span>Incident Notifications</span>
                        <div className="flex gap-2">
                          <span className="text-red-400 font-bold">{unread} Active</span>
                          <button onClick={clearAllNotifications} className="text-slate-500 hover:text-white text-[10px] underline ml-2">Clear All</button>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto font-mono text-[10px]">
                        {liveNotifications.slice(0, 10).map((n: any) => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 border-b border-slate-900 cursor-pointer ${!n.is_read ? 'bg-slate-800/30' : 'hover:bg-slate-900/10'}`}
                            style={{ borderLeft: `3px solid ${n.severity === 'Critical' ? '#FF5B6B' : n.severity === 'Medium' ? '#FFC857' : '#00F0FF'}` }}
                          >
                            <span className="text-white block font-bold">{n.title}</span>
                            <span className="text-slate-400 block mt-0.5">{n.message}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          {/* Floating AI Copilot Assistant */}
          <div className="fixed bottom-10 right-5 z-50">
            <AnimatePresence>
              {chatOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="w-80 h-96 glass-card border border-[#00F0FF]/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="p-3 border-b border-[#00F0FF]/20 flex justify-between items-center bg-[#08111F]/90 font-mono">
                    <span className="text-xs font-bold text-white uppercase">AegisSOC Enterprise Copilot</span>
                    <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-[10px]">
                    {chatMessages.map((msg, midx) => (
                      <div key={midx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user' ? 'bg-[#00F0FF] text-[#08111F] font-bold' : 'bg-slate-900 border border-slate-800 text-slate-200'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pre-populated Copilot Actions Grid */}
                  <div className="p-2 border-t border-slate-900 bg-slate-950/40 grid grid-cols-2 gap-1 font-mono text-[8px]">
                    <button
                      onClick={() => triggerCopilotAction("Explain MITRE mapping for active attack")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 text-[#00F0FF] rounded hover:bg-slate-850"
                    >
                      Explain MITRE
                    </button>
                    <button
                      onClick={() => triggerCopilotAction("Generate compliance summary for ISO 27001")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 text-[#00F0FF] rounded hover:bg-slate-850"
                    >
                      ISO Compliance
                    </button>
                    <button
                      onClick={() => triggerCopilotAction("Recommend WAF perimeter rules")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 text-[#00F0FF] rounded hover:bg-slate-850"
                    >
                      Recommend WAF
                    </button>
                    <button
                      onClick={() => triggerCopilotAction("Summarize last incident audit details")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 text-[#00F0FF] rounded hover:bg-slate-850"
                    >
                      Summarize Incident
                    </button>
                  </div>

                  <form onSubmit={handleSendChat} className="p-2 border-t border-slate-900 bg-slate-950 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask Copilot..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 text-xs border border-slate-800 rounded px-2 py-1.5 focus:border-[#00F0FF] focus:outline-none font-mono text-white"
                    />
                    <button type="submit" className="px-3 bg-[#00F0FF] text-[#08111F] rounded font-bold">
                      Send
                    </button>
                  </form>
                </motion.div>
              ) : (
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#00F0FF] text-[#08111F] flex items-center justify-center shadow-[0_4px_20px_rgba(0,240,255,0.3)] border border-[#00F0FF]/30"
                  aria-label="Open AI Copilot Chat"
                >
                  <MessageSquare size={20} />
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR (REALISM UPGRADE) ──────── */}
      <footer className="h-8 bg-slate-950 border-t border-slate-900 px-6 flex items-center justify-between text-[9px] font-mono text-slate-500 z-40 select-none">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DE37C] animate-pulse" /> WAF FIREWALL: ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DE37C]" /> DATABASE: CONNECTED
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DE37C]" /> CLOUD REPO: SECURE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DE37C]" /> VPN TUNNEL: MONITORING
          </span>
        </div>
        <div className="flex gap-4">
          <span>AI ACCURACY: 99.4%</span>
          <span>THREAT INTEL: ONLINE</span>
        </div>
      </footer>

      {/* Shortcuts Help Modal overlay */}
      <AnimatePresence>
        {shortcutsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-xl text-xs text-slate-300 font-mono space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-white font-bold uppercase">Keyboard Shortcut Keys</span>
                <button onClick={() => setShortcutsOpen(false)} className="text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-950 pb-1">
                  <span>Global Search</span>
                  <span className="text-[#00F0FF] font-bold">Ctrl + K</span>
                </div>
                <div className="flex justify-between border-b border-slate-950 pb-1">
                  <span>Show Shortcuts Guide</span>
                  <span className="text-[#00F0FF] font-bold">Ctrl + /</span>
                </div>
                <div className="flex justify-between border-b border-slate-950 pb-1">
                  <span>Go to Dashboard</span>
                  <span className="text-[#00F0FF] font-bold">Ctrl + Shift + D</span>
                </div>
                <div className="flex justify-between border-b border-slate-950 pb-1">
                  <span>Go to Attack Lab</span>
                  <span className="text-[#00F0FF] font-bold">Ctrl + Shift + A</span>
                </div>
                <div className="flex justify-between border-b border-slate-950 pb-1">
                  <span>Go to Reports</span>
                  <span className="text-[#00F0FF] font-bold">Ctrl + Shift + R</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Close dialog panels</span>
                  <span className="text-slate-500 font-bold">Esc</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding welcome overlay */}
      <AnimatePresence>
        {onboardingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 border border-[#00F0FF]/30 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)] text-center space-y-4"
            >
              <div className="w-12 h-12 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Shield size={22} />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono">AegisSOC Enterprise Platform</h2>
              <p className="text-xs text-slate-355 leading-relaxed font-mono">
                Transforming AegisSOC into a production-quality enterprise security control plane. 
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-left space-y-2 text-[10px] font-mono text-slate-400">
                <p>💡 Click tabs to toggle between Dashboard, Threats, and Cyber range portals.</p>
                <p>💡 Use **Ctrl+K** to search workspace indexes at any time.</p>
                <p>💡 Use **Ctrl+/** to view the global shortcut mappings.</p>
              </div>
              <button
                onClick={closeOnboarding}
                className="w-full py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#08111F] font-bold rounded-xl text-xs uppercase transition-all"
              >
                Enter Workspace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showNotifs && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
      )}
    </div>
  );
};
