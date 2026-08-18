import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, User, CheckCircle, Search,
  Filter, Eye, ChevronDown, X, Plus, Calendar
} from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { Incident, IncidentStatus, Severity } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const severityColor: Record<string, string> = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const statusConfig: Record<IncidentStatus, { bg: string; text: string; dot: string }> = {
  Open: { bg: 'rgba(255,51,102,0.12)', text: '#FF3366', dot: '#FF3366' },
  Investigating: { bg: 'rgba(255,213,0,0.12)', text: '#FFD500', dot: '#FFD500' },
  Mitigated: { bg: 'rgba(51,119,255,0.12)', text: '#3377FF', dot: '#3377FF' },
  Closed: { bg: 'rgba(0,255,163,0.12)', text: '#00FFA3', dot: '#00FFA3' },
};

// ─── Incident Card ─────────────────────────────────────────
const IncidentCard = ({ incident, onClick }: { incident: Incident; onClick: () => void }) => {
  const sc = statusConfig[incident.status];
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      onClick={onClick}
      className="glass-card p-5 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-cyan)' }}>
            {incident.id}
          </span>
          <span className={severityColor[incident.severity]}>{incident.severity}</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ background: sc.bg, color: sc.text }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
          {incident.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-white mb-2 line-clamp-2 leading-snug">{incident.title}</h3>
      <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>{incident.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <User size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{incident.analyst_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDistanceToNow(new Date(incident.opened_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Incident Detail Modal ─────────────────────────────────
const IncidentModal = ({ incident, onClose }: { incident: Incident; onClose: () => void }) => {
  const sc = statusConfig[incident.status];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-cyan)' }}>{incident.id}</span>
              <span className={severityColor[incident.severity]}>{incident.severity}</span>
            </div>
            <h2 className="font-bold text-white text-base leading-snug">{incident.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ background: sc.bg, color: sc.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
            {incident.status}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Assigned: <span className="text-white font-medium">{incident.analyst_name}</span>
          </span>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Description', val: incident.description },
            { label: 'Evidence', val: incident.evidence },
            ...(incident.resolution ? [{ label: 'Resolution', val: incident.resolution }] : []),
          ].map(section => (
            <div key={section.label}>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>{section.label}</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{section.val}</p>
            </div>
          ))}

          {/* Timeline */}
          <div>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Timeline
            </div>
            <div className="space-y-3">
              {[
                { label: 'Incident Opened', time: incident.opened_at, color: '#FF3366' },
                { label: 'Analyst Assigned', time: new Date(new Date(incident.opened_at).getTime() + 300000).toISOString(), color: '#FFD500' },
                { label: 'Investigation Started', time: new Date(new Date(incident.opened_at).getTime() + 900000).toISOString(), color: '#3377FF' },
                ...(incident.closed_at ? [{ label: 'Incident Closed', time: incident.closed_at, color: '#00FFA3' }] : []),
              ].map(ev => (
                <div key={ev.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                  <div className="flex-1 text-xs text-white">{ev.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(ev.time), 'MMM dd, HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {incident.status !== 'Closed' && (
            <>
              <button className="btn-primary flex-1 text-sm py-2.5"
                onClick={() => { toast.success('Incident resolved!'); onClose(); }}>
                <CheckCircle size={14} className="inline mr-1.5" /> Resolve
              </button>
              <button className="btn-ghost flex-1 text-sm py-2.5"
                onClick={() => { toast.success('Incident closed'); onClose(); }}>
                Close
              </button>
            </>
          )}
          {incident.status === 'Closed' && (
            <button className="btn-ghost w-full text-sm py-2.5" onClick={onClose}>Close Modal</button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Incident Center Page ──────────────────────────────────
export default function IncidentCenterPage() {
  const { incidents } = useSecurity();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [selected, setSelected] = useState<Incident | null>(null);

  const filtered = incidents.filter(inc => {
    if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) &&
        !inc.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && inc.status !== statusFilter) return false;
    if (severityFilter && inc.severity !== severityFilter) return false;
    return true;
  });

  const statusCounts = {
    Open: incidents.filter(i => i.status === 'Open').length,
    Investigating: incidents.filter(i => i.status === 'Investigating').length,
    Mitigated: incidents.filter(i => i.status === 'Mitigated').length,
    Closed: incidents.filter(i => i.status === 'Closed').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} incidents · {statusCounts.Open} open · {statusCounts.Investigating} investigating
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
          onClick={() => toast.success('New incident form coming soon!')}>
          <Plus size={14} /> Create Incident
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(statusCounts) as [IncidentStatus, number][]).map(([status, count]) => {
          const sc = statusConfig[status];
          return (
            <button key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className="glass-card p-4 text-left transition-all"
              style={{
                borderColor: statusFilter === status ? sc.dot : undefined,
                boxShadow: statusFilter === status ? `0 0 0 1px ${sc.dot}` : undefined,
              }}>
              <div className="text-2xl font-bold font-mono" style={{ color: sc.dot }}>{count}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{status}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search incidents..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as IncidentStatus | '')}
              className="input-field py-2 text-sm appearance-none">
              <option value="">All Statuses</option>
              {(['Open', 'Investigating', 'Mitigated', 'Closed'] as IncidentStatus[]).map(s =>
                <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          <div className="relative">
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as Severity | '')}
              className="input-field py-2 text-sm appearance-none">
              <option value="">All Severities</option>
              {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map(s =>
                <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Incident Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(inc => (
            <motion.div
              key={inc.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <IncidentCard incident={inc} onClick={() => setSelected(inc)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center glass-card">
          <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--accent-green)' }} />
          <p className="text-white font-semibold">No incidents found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Great news — your network looks clean!</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && <IncidentModal incident={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
