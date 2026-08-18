import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import {
  Shield, AlertTriangle, Activity, Cpu, Database, Wifi,
  TrendingUp, Eye, Lock, Globe, Clock, Zap, Server, Terminal,
  Play, FileText, Settings, Key, User, Landmark, HardDrive, Users, CheckSquare, MessageSquare, ArrowRight, ShieldAlert, Cpu as EdrIcon
} from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { downloadExecutiveReport } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

// ─── Stat Card ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, accent, delay = 0 }: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  accent: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`glass-card p-5 stat-card-${color} hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}15` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <span className="text-[10px] font-medium px-2 py-1 rounded-full font-mono"
        style={{ background: `${accent}15`, color: accent }}>
        Live
      </span>
    </div>
    <div className="font-bold text-2xl text-white mb-1 font-mono">{value}</div>
    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    {sub && <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
  </motion.div>
);

// ─── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ border: '1px solid rgba(0,240,255,0.2)', minWidth: 120 }}>
      <div className="font-medium text-white mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}: </span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── World Map Component ───────────────────────────────────
const WorldThreatMap = () => {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

  useEffect(() => {
    const threatDots = [
      { id: 1, x: 78, y: 35, color: '#FF3366', size: 8 },  // China
      { id: 2, x: 62, y: 28, color: '#FF3366', size: 7 },  // Russia
      { id: 3, x: 22, y: 38, color: '#FFD500', size: 6 },  // US
      { id: 4, x: 75, y: 58, color: '#FF9632', size: 5 },  // India
      { id: 5, x: 48, y: 32, color: '#FFD500', size: 5 },  // Germany
      { id: 6, x: 35, y: 62, color: '#3377FF', size: 6 },  // Brazil
      { id: 7, x: 54, y: 30, color: '#FF3366', size: 5 },  // Ukraine
      { id: 8, x: 80, y: 42, color: '#00FFA3', size: 4 },  // Our server
      { id: 9, x: 66, y: 48, color: '#FFD500', size: 5 },  // Iran
    ];
    setDots(threatDots);
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ background: 'rgba(8,17,31,0.5)', height: 240 }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="worldGrid" x="0" y="0" width="10%" height="10%" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 0 100% M 0 0 L 100% 0" stroke="rgba(0,240,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#worldGrid)" />
        <ellipse cx="22%" cy="42%" rx="12%" ry="20%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="36%" cy="35%" rx="8%" ry="15%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="52%" cy="32%" rx="10%" ry="12%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="72%" cy="35%" rx="14%" ry="18%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="83%" cy="60%" rx="6%" ry="10%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        <ellipse cx="35%" cy="65%" rx="6%" ry="8%" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.12)" strokeWidth="0.5" />
        
        {dots.filter(d => d.color === '#FF3366' || d.color === '#FFD500').map(d => (
          <line key={d.id}
            x1={`${d.x}%`} y1={`${d.y}%`}
            x2="50%" y2="50%"
            stroke={d.color} strokeWidth="0.5" strokeOpacity="0.3"
            strokeDasharray="4 4"
          />
        ))}

        {dots.map(d => (
          <g key={d.id}>
            <circle cx={`${d.x}%`} cy={`${d.y}%`} r={d.size} fill={d.color} opacity="0.8">
              <animate attributeName="r" values={`${d.size};${d.size + 3};${d.size}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={`${d.x}%`} cy={`${d.y}%`} r={d.size + 4} fill="none" stroke={d.color} strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values={`${d.size + 2};${d.size + 8};${d.size + 2}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};

const severityColor: Record<string, string> = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

// ─── Dashboard Page ────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { threats, incidents, blockedIPs, simState, intelFeed } = useSecurity();
  const [platformTab, setPlatformTab] = useState<'workspace' | 'xdr' | 'soar' | 'edr' | 'cloud' | 'intel' | 'compliance' | 'agents'>('workspace');
  const [activeOrg, setActiveOrg] = useState(() => localStorage.getItem('aegissoc_org') || 'Acme Corp');

  // Greeting based on hour
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 12 && hr < 17) {
      setGreeting('Good Afternoon');
    } else if (hr >= 17 || hr < 4) {
      setGreeting('Good Evening');
    } else {
      setGreeting('Good Morning');
    }
  }, []);

  // Listen to organization updates
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveOrg(localStorage.getItem('aegissoc_org') || 'Acme Corp');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const criticalThreats = threats.filter(t => t.severity === 'Critical').length;
  const activeThreats = threats.filter(t => t.status === 'Detected').length;
  const totalAttacks = threats.length;
  const blockedIPCount = blockedIPs.length;

  let securityScore = 'A+';
  if (activeThreats > 5) securityScore = 'B+';
  if (activeThreats > 10) securityScore = 'C-';

  // Time series forecast (dotted lines represent predictive models)
  const timeData = Array.from({ length: 12 }, (_, idx) => {
    const hour = (new Date().getHours() - (11 - idx) + 24) % 24;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      threats: Math.floor(Math.random() * 4) + (idx === 11 ? activeThreats : Math.floor(Math.random() * 2)),
      forecast: Math.floor(Math.random() * 3) + 2, // Predictive forecast metrics
      blocked: Math.floor(Math.random() * 3) + (idx === 11 ? blockedIPCount : Math.floor(Math.random() * 2)),
    };
  });

  const statCards = [
    { icon: Shield, label: 'Active Threats', value: activeThreats, sub: 'Requiring attention', color: activeThreats > 0 ? 'red' : 'green', accent: activeThreats > 0 ? '#FF3366' : '#00FFA3' },
    { icon: TrendingUp, label: "Today's Attacks", value: totalAttacks, sub: 'Since session start', color: 'yellow', accent: '#FFD500' },
    { icon: Eye, label: 'Detection Accuracy', value: '99.4%', sub: 'AI engine verification', color: 'cyan', accent: '#00F0FF' },
    { icon: Activity, label: 'System Health', value: activeThreats > 10 ? 'Warning' : 'Healthy', sub: 'All engines operating', color: activeThreats > 10 ? 'yellow' : 'green', accent: activeThreats > 10 ? '#FFD500' : '#00FFA3' },
  ];

  const handleExportPDF = () => {
    toast.success('Compiling Executive PDF Report...');
    const dummyAnalysis = {
      summary: 'AegisSOC Enterprise session incident review.',
      endpoint: '/api/v1/ingress',
      payload: 'Multiple test vectors triggered inside Cyber Range',
      dbAccess: 'None (Prevented)',
      prevention: 'IP Block Rule applied at firewall boundary',
      threatFamily: 'Heuristic Intrusion Drill',
      attackVector: 'Simulated Client Request',
      mitreTechnique: 'T1190 - Web Application Exploit',
      target: 'http://localhost:3000',
      businessImpact: 'LOW (Simulated Drill)',
      firewallRule: 'Perimeter drop active',
      threatIntelMatch: 'Verified signature fit',
      recommendations: ['Maintain strict local lab credentials rules', 'Configure SSL handshakes']
    };
    downloadExecutiveReport('Heuristic Drill' as any, 99.4, 82, 15, [], dummyAnalysis);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Homepage Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider block font-mono">
            {activeOrg} Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5 font-sans">
            {greeting}, Analyst
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Today's Security Summary: Posture Score <span className="text-[#00FFA3] font-mono font-bold">{securityScore}</span> · {blockedIPCount} edge block guards active.
          </p>
        </div>

        {/* View Mode Switching Controls */}
        <div className="flex gap-1.5 rounded-xl bg-slate-950 p-1 border border-slate-900 font-mono text-[10px] flex-wrap">
          {[
            { id: 'workspace', label: 'Workspace' },
            { id: 'xdr', label: 'XDR Center' },
            { id: 'soar', label: 'SOAR Playbooks' },
            { id: 'edr', label: 'EDR / NDR' },
            { id: 'cloud', label: 'Cloud / IAM' },
            { id: 'intel', label: 'Threat Intel' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'agents', label: 'AI Agents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPlatformTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded font-bold uppercase transition-all ${
                platformTab === tab.id ? 'bg-[#00F0FF] text-[#030712]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CENTRALIZED PLATFORM TABS VIEW ── */}

      {/* 1. WORKSPACE HOME TAB */}
      {platformTab === 'workspace' && (
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#00F0FF]" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">COMMAND CENTER QUICK ACTIONS</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <button
                onClick={() => { navigate('/attack-lab'); toast.success('Open Cyber Range'); }}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <Play size={15} className="text-[#00FFA3]" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">Start Demo</div>
              </button>
              <button
                onClick={() => { navigate('/attack-lab'); toast.success('Launch SQL Injection drill context'); }}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <Database size={15} className="text-amber-400" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">SQL Injection</div>
              </button>
              <button
                onClick={() => { navigate('/attack-lab'); toast.success('Launch Brute Force credentials drill'); }}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <Key size={15} className="text-[#00F0FF]" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">Brute Force</div>
              </button>
              <button
                onClick={() => navigate('/incidents')}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <AlertTriangle size={15} className="text-red-400" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">Incident Center</div>
              </button>
              <button
                onClick={handleExportPDF}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <FileText size={15} className="text-emerald-400" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">Exec Report</div>
              </button>
              <button
                onClick={() => toast.success('Keyboard shortcuts dialog: press Ctrl + / at any time')}
                className="p-3 bg-slate-900/50 border border-slate-850 hover:border-[#00F0FF]/30 rounded-xl text-left space-y-1 group transition-all"
              >
                <Settings size={15} className="text-[#B042FF]" />
                <div className="text-[10px] font-bold text-white font-mono uppercase">Shortcuts Map</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 0.08} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 lg:col-span-2">
              <span className="font-bold text-xs text-white font-mono uppercase tracking-wider block mb-3">Threat Trend & AI Predictive Forecast</span>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3366" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF3366" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: '#5A7089', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A7089', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="threats" stroke="#FF3366" fill="url(#gradThreats)" strokeWidth={2} name="Active Threats" />
                  <Area type="monotone" dataKey="forecast" stroke="#00F0FF" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Predictive Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5 flex flex-col justify-between">
              <span className="font-bold text-xs text-white font-mono uppercase block mb-2">Threat Intelligence Feed</span>
              <div className="space-y-2.5 overflow-y-auto max-h-[190px] pr-1 mt-2">
                {intelFeed.map((item, idx) => (
                  <div key={item.id || idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 font-mono text-[10px]">
                    <span className="text-[#00F0FF] block font-bold">[{item.type}]</span>
                    <span className="text-slate-350">{item.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. XDR CORRELATION CENTER TAB */}
      {platformTab === 'xdr' && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-[#FF3366]" />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">XDR CORRELATED INCIDENT TIMELINE</span>
          </div>
          <div className="space-y-3 font-mono text-[10px] text-slate-350">
            {[
              { time: 'T+0s', source: 'Identity Vault', action: 'Failed login brute force attempt from IP 192.168.1.188', risk: 45 },
              { time: 'T+5s', source: 'WAF Firewall', action: 'Rate limit threshold exceeded on /api/v1/auth/login', risk: 78 },
              { time: 'T+11s', source: 'SQL Database Cluster', action: 'SQL injection payload detected: OR 1=1', risk: 95 },
              { time: 'T+13s', source: 'Perimeter Rule Engine', action: 'Auto WAF blockade rule deployed. Source quarantined.', risk: 99 }
            ].map((evt, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-red-400 font-bold mr-2">[{evt.time}]</span>
                  <span className="text-white font-bold">{evt.source}: </span>
                  <span>{evt.action}</span>
                </div>
                <span className="font-bold text-[#FF3366] bg-red-950/20 px-2 py-0.5 rounded">Risk: {evt.risk}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SOAR PLAYBOOKS TAB */}
      {platformTab === 'soar' && (
        <div className="glass-card p-5 space-y-4">
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">Visual Playbook Workflow Designer</span>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center font-mono text-[10px] text-slate-400 p-6 bg-slate-950 rounded-xl border border-slate-900">
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 font-bold">TRIGGER: SQLi Payload</div>
            <ArrowRight className="hidden md:block text-slate-500" />
            <div className="p-3 bg-slate-900 border border-slate-800 rounded">CONDITION: Risk &gt;80%</div>
            <ArrowRight className="hidden md:block text-slate-500" />
            <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-bold">ACTION: Block IP Rule</div>
            <ArrowRight className="hidden md:block text-slate-500" />
            <div className="p-3 bg-slate-900 border border-slate-800 rounded">NOTIFICATION: Slack Alert</div>
          </div>
        </div>
      )}

      {/* 4. EDR / NDR TAB */}
      {platformTab === 'edr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EDR Endpoints */}
          <div className="glass-card p-5 space-y-3">
            <span className="text-xs font-bold text-white font-mono block uppercase">EDR Host agent telemetry</span>
            <div className="space-y-2 font-mono text-[9px] text-slate-350">
              {[
                { host: 'HQ-AppServer-01', cpu: '24%', ram: '58%', status: 'Secure' },
                { host: 'HQ-DBServer-02', cpu: '48%', ram: '88%', status: 'Investigating' },
                { host: 'HQ-VPN-Gateway', cpu: '12%', ram: '42%', status: 'Secure' }
              ].map((h, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-900 flex justify-between">
                  <span className="text-white font-bold">{h.host}</span>
                  <span>CPU: {h.cpu} · RAM: {h.ram} · Status: {h.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NDR Network */}
          <div className="glass-card p-5 space-y-3">
            <span className="text-xs font-bold text-white font-mono block uppercase">NDR Network Gateway connections</span>
            <div className="space-y-2 font-mono text-[9px] text-slate-350">
              {[
                { conn: 'Port 443 HTTPS', packets: '4,215 pps', state: 'Normal' },
                { conn: 'Port 1433 MSSQL', packets: '88 pps', state: 'Anomalous Ingress' },
                { conn: 'Port 22 SSH', packets: '0 pps', state: 'Closed' }
              ].map((c, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-900 flex justify-between">
                  <span className="text-white font-bold">{c.conn}</span>
                  <span>Throughput: {c.packets} · Traffic: {c.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. CLOUD / IAM TAB */}
      {platformTab === 'cloud' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-[10px]">
          {/* Cloud Clusters */}
          <div className="glass-card p-5 space-y-3">
            <span className="text-xs font-bold text-white block uppercase">Cloud Container Vulnerability Scanner</span>
            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Google Kubernetes Engine nodes</span>
                <span className="text-[#00FFA3] font-bold">12 Active (Healthy)</span>
              </div>
              <div className="flex justify-between">
                <span>Amazon AWS EC2 instances</span>
                <span className="text-[#00FFA3] font-bold">8 Active (Healthy)</span>
              </div>
            </div>
          </div>

          {/* IAM Center */}
          <div className="glass-card p-5 space-y-3">
            <span className="text-xs font-bold text-white block uppercase">IAM Privilege Sessions Audit</span>
            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Compromised employee credentials</span>
                <span className="text-[#00FFA3] font-bold">0 Active cases</span>
              </div>
              <div className="flex justify-between">
                <span>MFA Enforcement coverage ratio</span>
                <span className="text-[#00F0FF] font-bold">100% compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. THREAT INTEL TAB */}
      {platformTab === 'intel' && (
        <div className="glass-card p-5 space-y-4 font-mono text-[9px] text-slate-350">
          <span className="text-xs font-bold text-[#00F0FF] uppercase block">ACTIVE CVE & MALWARE DATA INDEX</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
              <span className="text-red-400 font-bold">CVE-2026-8088</span>
              <p>SQL Injection vulnerabilities on parameters checks.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
              <span className="text-amber-400 font-bold">APT-41 (BRONZE KEY)</span>
              <p>Dynamic brute forcing campaign targeting SSO servers.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[#00F0FF] font-bold">SHA-256 HASH VERDICT</span>
              <p>Malicious upload executable matching known ransomware signatures.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. COMPLIANCE TAB */}
      {platformTab === 'compliance' && (
        <div className="glass-card p-5 space-y-4">
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">COMPLIANCE STANDARDS VERIFICATION</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[9px] text-center uppercase">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-white block font-bold">ISO 27001</span>
              <span className="text-emerald-400 font-bold block mt-1">94% Compliant</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-white block font-bold">SOC 2 Type II</span>
              <span className="text-emerald-400 font-bold block mt-1">100% Compliant</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-white block font-bold">NIST SP 800-53</span>
              <span className="text-emerald-400 font-bold block mt-1">88% Compliant</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-white block font-bold">PCI DSS v4.0</span>
              <span className="text-emerald-400 font-bold block mt-1">90% Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. AI AGENTS TAB */}
      {platformTab === 'agents' && (
        <div className="glass-card p-5 space-y-4 font-mono text-[10px]">
          <span className="text-xs font-bold text-white block">AI Multi-Agent Collaboration Workspace</span>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-3">
            <div className="flex gap-2">
              <span className="text-[#00F0FF] font-bold shrink-0">[Threat Hunter Agent]:</span>
              <p className="text-slate-350">Flagging SQL Injection indicators on database console `/api/v1/auth/login`.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400 font-bold shrink-0">[Incident Responder Agent]:</span>
              <p className="text-slate-350">Deploying IP containment rules at WAF Firewall boundary autonomously.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[#00FFA3] font-bold shrink-0">[Compliance Officer Agent]:</span>
              <p className="text-slate-350">Confirming containment maps perfectly to ISO 27001 control requirement mapping.</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Threat Log Table */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="font-semibold text-sm text-white">Active Intrusion and Threats Logs</span>
          </div>
          <a href="/threats" className="text-xs text-[#00F0FF] hover:underline">Go to Threat Monitor →</a>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="font-mono text-xs">
                <th>Source IP</th>
                <th>Protocol/Port</th>
                <th>Attack Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Mitigation Status</th>
              </tr>
            </thead>
            <tbody>
              {threats.slice(0, 5).map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-xs text-white">{t.source_ip}</td>
                  <td className="text-xs text-slate-400">{t.protocol} / {t.port}</td>
                  <td className="text-xs text-slate-350 font-semibold">{t.attack_type}</td>
                  <td>
                    <span className={severityColor[t.severity]}>{t.severity}</span>
                  </td>
                  <td className="font-mono text-xs text-slate-300">{t.confidence}%</td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'Blocked' ? 'bg-emerald-500/10 text-[#00FFA3]' : 'bg-red-500/10 text-[#FF3366]'
                    }`}>
                      {t.status === 'Blocked' ? 'Threat Prevented' : t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {threats.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">[No threats logged]</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
