import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, TrendingUp, Shield, Clock,
  BarChart2, Plus, CheckCircle, RefreshCw
} from 'lucide-react';
import { generateReports } from '../utils/mockData';
import { Report } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const reportConfig: Record<string, { icon: string; description: string; color: string; gradient: string }> = {
  'Daily': { icon: '📋', description: 'Today\'s threat summary, blocked IPs, and detection stats', color: '#00F0FF', gradient: 'from-cyan-500/20 to-blue-500/10' },
  'Weekly': { icon: '📊', description: 'Weekly attack trends, incident summary, and model performance', color: '#3377FF', gradient: 'from-blue-500/20 to-indigo-500/10' },
  'Monthly': { icon: '📈', description: 'Monthly security overview, top threats, and risk evolution', color: '#B042FF', gradient: 'from-purple-500/20 to-pink-500/10' },
  'Executive': { icon: '🏆', description: 'High-level executive summary for leadership and stakeholders', color: '#FFD500', gradient: 'from-yellow-500/20 to-orange-500/10' },
  'Threat Summary': { icon: '🔥', description: 'Detailed threat intelligence report with MITRE ATT&CK mapping', color: '#FF3366', gradient: 'from-red-500/20 to-orange-500/10' },
};

// ─── Report Type Card ──────────────────────────────────────
const ReportCard = ({
  type, onGenerate
}: { type: string; onGenerate: (type: string, isPdf: boolean) => void }) => {
  const cfg = reportConfig[type] || { icon: '📄', description: 'Security report', color: '#00F0FF', gradient: '' };
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (isPdf: boolean) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    onGenerate(type, isPdf);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-card p-5 flex flex-col gap-4"
      style={{ borderTop: `2px solid ${cfg.color}50` }}
    >
      <div className="flex items-start justify-between">
        <div className="text-3xl">{cfg.icon}</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}15`, color: cfg.color }}>
          Auto-generated
        </span>
      </div>

      <div>
        <h3 className="font-bold text-white text-sm">{type} Report</h3>
        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{cfg.description}</p>
      </div>

      <div className="flex gap-2 mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGenerate(true)}
          disabled={generating}
          className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
          style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}aa)` }}
        >
          {generating ? (
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : <Plus size={12} />}
          {generating ? 'Generating...' : 'Generate PDF'}
        </motion.button>
        <button className="btn-ghost text-xs py-2 px-3 flex items-center gap-1"
          onClick={() => handleGenerate(false)}>
          <Download size={12} /> CSV
        </button>
      </div>
    </motion.div>
  );
};

// ─── Reports Page ──────────────────────────────────────────
export default function ReportsPage() {
  const [reports, setReports] = useState(generateReports());
  const [genHistory, setGenHistory] = useState<{ type: string; time: Date; size: string }[]>([]);

  const handleGenerate = (type: string, isPdf = true) => {
    // Simulate real file download
    const content = `Report Type: ${type}\nGenerated: ${new Date().toISOString()}\nStatus: Success\nConfidence: 96%\nThreats Detected: 12\nActions Taken: Quarantined (1), Blocked IP (2)`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_Report_${Date.now()}.${isPdf ? 'pdf' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const entry = {
      type,
      time: new Date(),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    };
    setGenHistory(prev => [entry, ...prev]);
    toast.success(`${type} ${isPdf ? 'PDF' : 'CSV'} generated and downloaded!`, {
      icon: '📄',
      duration: 4000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Generate, download, and schedule security reports
          </p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-4"
          onClick={() => toast.success('Reports scheduled for weekly email delivery!')}>
          <Calendar size={14} /> Schedule Reports
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Reports Generated', val: '147', color: '#00F0FF' },
          { icon: Shield, label: 'Threats Reported', val: '2,840', color: '#FF3366' },
          { icon: TrendingUp, label: 'Avg Detection Rate', val: '97.3%', color: '#00FFA3' },
          { icon: Clock, label: 'Last Report', val: '2h ago', color: '#FFD500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <s.icon size={16} style={{ color: s.color }} className="mb-2" />
            <div className="text-xl font-bold font-mono text-white">{s.val}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.keys(reportConfig).map(type => (
            <ReportCard key={type} type={type} onGenerate={handleGenerate} />
          ))}
        </div>
      </div>

      {/* Recent Generated */}
      <AnimatePresence>
        {genHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
              <span className="font-semibold text-sm text-white">Recently Generated</span>
            </div>
            <div className="space-y-2">
              {genHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(0,240,255,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{reportConfig[item.type]?.icon || '📄'}</div>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.type} Report</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {format(item.time, 'HH:mm:ss')} · {item.size}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
                      onClick={() => toast.success(`Downloading ${item.type} report...`)}>
                      <Download size={11} /> PDF
                    </button>
                    <button className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
                      onClick={() => toast.success(`Downloading CSV...`)}>
                      <Download size={11} /> CSV
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report History */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} style={{ color: 'var(--accent-blue)' }} />
            <span className="font-semibold text-sm text-white">Report History</span>
          </div>
          <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
            onClick={() => { setReports(generateReports()); toast.success('History refreshed'); }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Generated</th>
                <th>Generated By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{reportConfig[r.report_type]?.icon || '📄'}</span>
                      <span className="text-xs font-medium text-white">{r.report_type}</span>
                    </div>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </td>
                  <td className="text-xs">Admin</td>
                  <td>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,163,0.1)', color: '#00FFA3' }}>
                      Ready
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}
                        onClick={() => toast.success(`Downloading ${r.report_type} report...`)}>
                        Download PDF
                      </button>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <button className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}
                        onClick={() => toast.success('CSV downloaded!')}>
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
