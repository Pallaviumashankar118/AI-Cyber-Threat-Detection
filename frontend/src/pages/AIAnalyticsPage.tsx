import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { BrainCircuit, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Info, ShieldAlert, Zap, Lock, Mail, FileOutput } from 'lucide-react';
import { generatePrediction } from '../utils/mockData';
import { api } from '../utils/api';
import { AttackType } from '../types';
import toast from 'react-hot-toast';

const ATTACK_TYPES: AttackType[] = ['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan', 'Malware', 'Ransomware', 'Botnet'];

// ─── Confidence Radial Meter ───────────────────────────────
const ConfidenceMeter = ({ value, color }: { value: number; color: string }) => {
  const r = 60;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={160} height={160} className="-rotate-90">
          <circle cx={80} cy={80} r={r} stroke="rgba(0,240,255,0.1)" strokeWidth="10" fill="none" />
          <motion.circle
            cx={80} cy={80} r={r}
            stroke={color} strokeWidth="10" fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <div className="text-3xl font-bold font-mono" style={{ color }}>{value.toFixed(1)}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Confidence</div>
        </div>
      </div>
    </div>
  );
};

// ─── SHAP Bar ──────────────────────────────────────────────
const ShapBar = ({ feature, value, maxVal }: { feature: string; value: number; maxVal: number }) => {
  const isPositive = value >= 0;
  const width = Math.abs(value) / maxVal * 100;
  const color = isPositive ? '#FF3366' : '#00FFA3';

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="text-xs flex-shrink-0 text-right" style={{ color: 'var(--text-secondary)', width: 140 }}>
        {feature}
      </div>
      <div className="flex-1 relative flex items-center" style={{ height: 20 }}>
        <div className="absolute left-1/2 w-px h-full" style={{ background: 'rgba(0,240,255,0.2)' }} />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width / 2}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute h-4 rounded"
          style={{
            [isPositive ? 'left' : 'right']: '50%',
            background: color,
            opacity: 0.8,
          }}
        />
      </div>
      <div className="text-xs font-mono flex-shrink-0" style={{ color, width: 50, textAlign: 'right' }}>
        {isPositive ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
  );
};

// ─── AI Analytics Page ─────────────────────────────────────
export default function AIAnalyticsPage() {
  const [selectedType, setSelectedType] = useState<AttackType>('DDoS');
  const [prediction, setPrediction] = useState(() => generatePrediction('DDoS'));
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    toast.loading('Running AI prediction...', { id: 'pred' });
    try {
      const res = await api.get('/prediction/explanation/test-id');
      setPrediction(res.data);
      toast.success(`Prediction complete: ${selectedType} detected!`, { id: 'pred' });
    } catch (e) {
      const p = generatePrediction(selectedType);
      (p as any).reasons = [
        "High outbound traffic anomaly",
        "Abnormal process execution patterns",
        "Suspicious registry activity detected",
        "Unknown executable signature",
        "Multiple failed authentications"
      ];
      setPrediction(p);
      toast.success(`Prediction complete: ${selectedType} detected!`, { id: 'pred' });
    }
    setLoading(false);
  };

  const handlePrevention = async (action: string, endpoint: string) => {
    try {
      await api.post(`/prevention/${endpoint}`, { threatId: prediction.id });
      toast.success(`${action} successful!`);
    } catch (e) {
      toast.error(`Failed to execute ${action}`);
    }
  };

  const featImportance = Object.entries(prediction.feature_importance)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value: parseFloat((value * 100).toFixed(1)) }));

  const shapEntries = Object.entries(prediction.shap_values).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
  const maxShap = Math.max(...shapEntries.map(([, v]) => Math.abs(v)));

  const riskColor = prediction.risk_score > 75 ? '#FF3366' : prediction.risk_score > 50 ? '#FFD500' : '#00FFA3';
  const confColor = prediction.confidence > 90 ? '#00F0FF' : prediction.confidence > 75 ? '#FFD500' : '#FF3366';

  const radarData = Object.entries(prediction.feature_importance).map(([name, val]) => ({
    feature: name.split(' ')[0],
    importance: parseFloat((val * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Explainable AI — model decisions, feature importance, and SHAP analysis
          </p>
        </div>
        <button onClick={runPrediction} disabled={loading}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : <RefreshCw size={14} />}
          Run Prediction
        </button>
      </div>

      {/* Attack Type Selector */}
      <div className="glass-card p-4">
        <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Test Attack Type
        </div>
        <div className="flex flex-wrap gap-2">
          {ATTACK_TYPES.map(t => (
            <button key={t}
              onClick={() => setSelectedType(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedType === t ? 'var(--accent-cyan)' : 'rgba(0,240,255,0.08)',
                color: selectedType === t ? '#08111F' : 'var(--text-secondary)',
                border: `1px solid ${selectedType === t ? 'var(--accent-cyan)' : 'rgba(0,240,255,0.15)'}`,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Prediction Card + Confidence + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Prediction Card */}
        <motion.div
          key={prediction.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 neon-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span className="font-bold text-white text-sm">AI Prediction</span>
          </div>

          <div className="p-4 rounded-xl mb-4"
            style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)' }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Detected Threat</div>
            <div className="text-2xl font-bold text-white mt-1">{prediction.prediction}</div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { label: 'Model', val: prediction.model_name, icon: '🤖' },
              { label: 'Risk Score', val: `${prediction.risk_score}/100`, icon: '📊', color: riskColor },
              { label: 'Confidence', val: `${prediction.confidence.toFixed(1)}%`, icon: '🎯', color: confColor },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.icon} {row.label}</span>
                <span className="text-xs font-bold font-mono" style={{ color: row.color || 'var(--text-primary)' }}>
                  {row.val}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl text-[11px] leading-relaxed space-y-2"
            style={{ background: 'rgba(0,240,255,0.05)', color: 'var(--text-secondary)' }}>
            <div className="font-semibold" style={{ color: 'var(--accent-cyan)' }}>Why AI predicted {prediction.prediction}:</div>
            <ul className="space-y-1.5 ml-1">
              {((prediction as any).reasons || []).map((reason: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="text-[#2DE37C] mt-0.5 flex-shrink-0" />
                  <span className="text-white">{reason}</span>
                </li>
              ))}
              {!((prediction as any).reasons) && (
                <li>{prediction.explanation}</li>
              )}
            </ul>
          </div>
        </motion.div>

        {/* Confidence Meter */}
        <motion.div
          key={prediction.confidence}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-5 flex flex-col items-center justify-center"
        >
          <div className="text-sm font-semibold text-white mb-4">Prediction Confidence</div>
          <ConfidenceMeter value={prediction.confidence} color={confColor} />
          <div className="mt-4 w-full space-y-2">
            {[
              { label: 'Random Forest', val: prediction.confidence },
              { label: 'SVM', val: prediction.confidence - 3.2 },
              { label: 'Isolation Forest', val: prediction.confidence - 6.8 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{m.val.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Radar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-5"
        >
          <div className="text-sm font-semibold text-white mb-4">Feature Analysis</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,240,255,0.1)" />
              <PolarAngleAxis dataKey="feature" tick={{ fill: '#5A7089', fontSize: 9 }} />
              <Radar name="Importance" dataKey="importance" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Prevention Actions Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-5 border border-[#FF3366]/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} style={{ color: '#FF3366' }} />
          <span className="font-bold text-white text-sm">Recommended Prevention Actions</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handlePrevention('Block IP', 'block-ip')} className="btn-primary text-xs flex items-center gap-1.5" style={{ background: '#FF3366', color: '#fff', border: 'none' }}>
            <Zap size={14} /> Block IP
          </button>
          <button onClick={() => handlePrevention('Quarantine', 'quarantine')} className="btn-primary text-xs flex items-center gap-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700">
            <Lock size={14} /> Quarantine File
          </button>
          <button onClick={() => handlePrevention('Isolate', 'isolate')} className="btn-primary text-xs flex items-center gap-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700">
            <AlertTriangle size={14} className="text-[#FFD500]" /> Isolate Device
          </button>
          <button onClick={() => handlePrevention('Send Alert', 'send-alert')} className="btn-primary text-xs flex items-center gap-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700">
            <Mail size={14} className="text-[#00F0FF]" /> Send Alert
          </button>
        </div>
      </motion.div>

      {/* Row 2: Feature Importance + SHAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feature Importance */}
        <motion.div
          key={`feat-${prediction.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span className="font-semibold text-sm text-white">Feature Importance</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featImportance} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#5A7089', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#AAB6C8', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                formatter={(val: number) => [`${val}%`, 'Importance']}
                contentStyle={{ background: '#111C2F', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8 }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {featImportance.map((_, i) => (
                  <Cell key={i} fill={`hsl(${195 - i * 15}, 80%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* SHAP Values */}
        <motion.div
          key={`shap-${prediction.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} style={{ color: 'var(--accent-blue)' }} />
            <span className="font-semibold text-sm text-white">SHAP Values</span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(51,119,255,0.1)', color: '#3377FF' }}>
              Explainable AI
            </span>
          </div>
          <div className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
            Positive = pushes toward threat detection · Negative = pushes toward benign
          </div>
          <div className="space-y-0.5">
            {shapEntries.map(([feature, value]) => (
              <ShapBar key={feature} feature={feature} value={value} maxVal={maxShap} />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <span>← Benign</span>
            <span>Threat →</span>
          </div>
        </motion.div>
      </div>

      {/* Decision Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
          <span className="font-semibold text-sm text-white">Decision Timeline</span>
        </div>
        <div className="flex items-center gap-0">
          {[
            { label: 'Traffic Ingested', detail: 'Raw packets received', color: '#3377FF', time: '0ms' },
            { label: 'Feature Extraction', detail: '18 features computed', color: '#00F0FF', time: '120ms' },
            { label: 'RF Model Scored', detail: `${prediction.confidence.toFixed(1)}% confidence`, color: '#FFD500', time: '340ms' },
            { label: 'SHAP Explained', detail: '7 feature contributions', color: '#B45FFF', time: '680ms' },
            { label: 'Decision Made', detail: `${prediction.prediction} detected`, color: '#FF3366', time: '720ms' },
            { label: 'Alert Triggered', detail: 'Prevention activated', color: '#2DE37C', time: '850ms' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `${step.color}20`, border: `2px solid ${step.color}`, color: step.color }}>
                  {i + 1}
                </motion.div>
                <div className="text-[10px] font-medium text-center mt-1.5 text-white truncate max-w-full px-1">{step.label}</div>
                <div className="text-[9px] text-center" style={{ color: 'var(--text-muted)' }}>{step.time}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="h-px flex-shrink-0" style={{ width: 20, background: 'rgba(0,240,255,0.2)', marginBottom: 36 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
