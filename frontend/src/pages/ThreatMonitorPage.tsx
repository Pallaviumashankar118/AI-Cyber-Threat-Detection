import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, AlertTriangle, Eye, Lock,
  RefreshCw, ChevronDown, X, Globe, Layers
} from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { Threat, Severity, AttackType } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const severityColor: Record<string, string> = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const STATUS_COLORS: Record<string, { bg: string, text: string }> = {
  Detected: { bg: 'rgba(255,51,102,0.12)', text: '#FF3366' },
  Blocked: { bg: 'rgba(0,255,163,0.12)', text: '#00FFA3' },
  Investigating: { bg: 'rgba(255,213,0,0.12)', text: '#FFD500' },
  Resolved: { bg: 'rgba(0,255,163,0.12)', text: '#00FFA3' }
};

const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
const ATTACK_TYPES: AttackType[] = ['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan', 'Malware', 'Ransomware', 'Botnet'];
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP', 'DNS', 'FTP', 'SSH'];

// ─── Threat Detail Panel ───────────────────────────────────
const ThreatPanel = ({ threat, onClose }: { threat: Threat; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50 }}
    className="fixed right-0 top-0 h-full w-80 z-50 overflow-y-auto"
    style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid rgba(0,240,255,0.15)' }}
  >
    <div className="p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white text-sm">Threat Details</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'var(--accent-red)' }} />
            <span className="font-bold text-sm text-white">{threat.attack_type}</span>
          </div>
          <span className={severityColor[threat.severity]}>{threat.severity}</span>
        </div>

        {[
          { label: 'Source IP', val: threat.source_ip, mono: true },
          { label: 'Destination', val: threat.destination_ip, mono: true },
          { label: 'Country', val: `${threat.country} (${threat.country_code})` },
          { label: 'Protocol', val: threat.protocol },
          { label: 'Port', val: String(threat.port), mono: true },
          { label: 'Packet Size', val: `${threat.packet_size} bytes` },
          { label: 'Packets/sec', val: threat.packets_per_second.toLocaleString() },
          { label: 'Confidence', val: `${threat.confidence}%` },
          { label: 'Risk Score', val: String(threat.risk_score) },
          { label: 'Status', val: threat.status },
          { label: 'Timestamp', val: format(new Date(threat.timestamp), 'MMM dd, HH:mm:ss') },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b"
            style={{ borderColor: 'rgba(0,240,255,0.06)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
            <span className={`text-xs font-medium ${row.mono ? 'font-mono' : ''}`}
              style={{ color: 'var(--text-primary)' }}>{row.val}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <button className="btn-danger w-full text-sm py-2.5"
          onClick={() => { toast.error(`IP ${threat.source_ip} blocked!`); onClose(); }}>
          Block IP
        </button>
        <button className="btn-ghost w-full text-sm py-2.5"
          onClick={() => { toast.success('Incident created'); onClose(); }}>
          Create Incident
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Threat Monitor Page ───────────────────────────────────
export default function ThreatMonitorPage() {
  const { threats: allThreats } = useSecurity();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [attackFilter, setAttackFilter] = useState<AttackType | ''>('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [selected, setSelected] = useState<Threat | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = useMemo(() => {
    return allThreats.filter(t => {
      const q = search.toLowerCase();
      if (search && !t.source_ip.includes(q) && !t.attack_type.toLowerCase().includes(q) &&
          !t.country.toLowerCase().includes(q)) return false;
      if (severityFilter && t.severity !== severityFilter) return false;
      if (attackFilter && t.attack_type !== attackFilter) return false;
      if (protocolFilter && t.protocol !== protocolFilter) return false;
      return true;
    });
  }, [allThreats, search, severityFilter, attackFilter, protocolFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const clearFilters = () => {
    setSearch(''); setSeverityFilter(''); setAttackFilter(''); setProtocolFilter(''); setPage(1);
  };

  const hasFilters = search || severityFilter || attackFilter || protocolFilter;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Threat Monitor</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Live network traffic analysis — {filtered.length} threats detected
          </p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm py-2 px-4"
          onClick={() => toast.success('Traffic data refreshed')}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
          { label: 'Critical', count: allThreats.filter(t => t.severity === 'Critical').length, color: '#FF3366' },
          { label: 'High', count: allThreats.filter(t => t.severity === 'High').length, color: '#FF9632' },
          { label: 'Medium', count: allThreats.filter(t => t.severity === 'Medium').length, color: '#FFD500' },
          { label: 'Low', count: allThreats.filter(t => t.severity === 'Low').length, color: '#00FFA3' },
          { label: 'Blocked', count: allThreats.filter(t => t.status === 'Blocked').length, color: '#00F0FF' },
          ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card"
            style={{ border: `1px solid ${stat.color}25` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
            <span className="text-xs font-medium text-white">{stat.count}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search IP, attack, country..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9 py-2 text-sm" />
          </div>

          {/* Severity */}
          <div className="relative">
            <AlertTriangle size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value as Severity | ''); setPage(1); }}
              className="input-field pl-9 py-2 text-sm appearance-none">
              <option value="">All Severities</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Attack Type */}
          <div className="relative">
            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <select value={attackFilter} onChange={e => { setAttackFilter(e.target.value as AttackType | ''); setPage(1); }}
              className="input-field pl-9 py-2 text-sm appearance-none">
              <option value="">All Attacks</option>
              {ATTACK_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Protocol */}
          <div className="relative">
            <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <select value={protocolFilter} onChange={e => { setProtocolFilter(e.target.value); setPage(1); }}
              className="input-field pl-9 py-2 text-sm appearance-none">
              <option value="">All Protocols</option>
              {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost py-2 text-sm flex items-center justify-center gap-2">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Threats Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source IP</th>
                <th>Destination</th>
                <th>Country</th>
                <th>Protocol</th>
                <th>Attack Type</th>
                <th>Risk</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paged.map(t => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="cursor-pointer"
                    onClick={() => setSelected(t)}
                  >
                    <td className="font-mono text-xs" style={{ color: '#00F0FF' }}>{t.source_ip}</td>
                    <td className="font-mono text-xs">{t.destination_ip}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Globe size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs">{t.country}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded text-[10px] font-bold"
                        style={{ background: 'rgba(51,119,255,0.1)', color: '#00FFA37FF' }}>
                        {t.protocol}
                      </span>
                    </td>
                    <td className="text-xs font-medium text-white">{t.attack_type}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-12">
                          <div className="h-full rounded-full" style={{
                            width: `${t.risk_score}%`,
                            background: t.risk_score > 75 ? '#FF3366' : t.risk_score > 50 ? '#FFD500' : '#00FFA3'
                          }} />
                        </div>
                        <span className="text-xs font-mono">{t.risk_score}</span>
                      </div>
                    </td>
                    <td className="text-xs font-mono" style={{ color: 'var(--accent-cyan)' }}>{t.confidence}%</td>
                    <td><span className={severityColor[t.severity]}>{t.severity}</span></td>
                    <td>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: STATUS_COLORS[t.status]?.bg, color: STATUS_COLORS[t.status]?.text }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(t.timestamp), 'HH:mm')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={() => setSelected(t)}
                          title="View details">
                          <Eye size={13} />
                        </button>
                        <button className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--accent-red)' }}
                          onClick={() => toast.error(`IP ${t.source_ip} blocked!`)}
                          title="Block IP">
                          <Lock size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Shield size={40} className="mx-auto mb-3" style={{ color: 'var(--accent-green)' }} />
              <p className="text-white font-semibold">Your network is secure.</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No threats match your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)' }}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="px-3 py-1 text-xs rounded-lg transition-all"
                  style={{
                    background: page === p ? 'var(--accent-cyan)' : 'rgba(0,240,255,0.1)',
                    color: page === p ? '#08111F' : 'var(--accent-cyan)',
                    fontWeight: page === p ? 700 : 400,
                  }}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)' }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && <ThreatPanel threat={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
