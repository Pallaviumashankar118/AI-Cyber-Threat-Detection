import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Zap, Lock, CheckCircle, Square, Activity } from 'lucide-react';
import { SimulationType, SimulationState } from '../types';
import toast from 'react-hot-toast';

// ─── Attack Config ─────────────────────────────────────────
const ATTACKS: {
  type: SimulationType;
  label: string;
  description: string;
  color: string;
  icon: string;
  confidence: number;
  risk: number;
  action: string;
}[] = [
  { type: 'DDoS', label: 'DDoS Attack', description: 'Flood target with millions of requests', color: '#FF3366', icon: '⚡', confidence: 98, risk: 97, action: 'Rate limiting + IP block' },
  { type: 'SQL Injection', label: 'SQL Injection', description: 'Inject malicious SQL to extract data', color: '#FF9632', icon: '🗄️', confidence: 95, risk: 88, action: 'Query blocked + sanitized' },
  { type: 'XSS', label: 'XSS Attack', description: 'Cross-site scripting payload injection', color: '#FFD500', icon: '🌐', confidence: 91, risk: 72, action: 'Script filtered + blocked' },
  { type: 'Malware', label: 'Malware', description: 'Malicious file execution attempt', color: '#B45FFF', icon: '🦠', confidence: 96, risk: 93, action: 'Quarantine + endpoint isolation' },
  { type: 'Port Scan', label: 'Port Scan', description: 'Enumerate open ports for attack surface', color: '#3377FF', icon: '🔍', confidence: 87, risk: 55, action: 'Source IP blacklisted' },
  { type: 'Brute Force', label: 'Brute Force', description: 'Password guessing attack on login', color: '#FFD500', icon: '🔨', confidence: 94, risk: 79, action: 'Account locked + CAPTCHA' },
  { type: 'Ransomware', label: 'Ransomware', description: 'File encryption ransomware payload', color: '#FF3366', icon: '🔒', confidence: 99, risk: 99, action: 'Endpoint quarantined + isolated' },
];

const PHASE_LABELS: Record<string, string> = {
  idle: 'Ready',
  launching: '🔴 Attack Launching...',
  detecting: '🔵 AI Detecting...',
  preventing: '🛡️ Prevention Activated...',
  resolved: '✅ Threat Neutralized',
};

// ─── Animated Network Canvas ───────────────────────────────
const NetworkCanvas = ({ state }: { state: SimulationState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const packetsRef = useRef<{
    x: number; y: number; tx: number; ty: number;
    progress: number; color: string; speed: number;
  }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Nodes
    const nodes = [
      { x: cx, y: cy, label: 'Server', color: state.phase === 'resolved' ? '#00FFA3' : state.phase === 'preventing' ? '#FFD500' : '#00F0FF', r: 20 },
      { x: 60, y: 60, label: 'Attacker', color: '#FF3366', r: 12 },
      { x: canvas.width - 60, y: 60, label: 'Node A', color: '#FF9632', r: 10 },
      { x: 60, y: canvas.height - 60, label: 'Node B', color: '#FF3366', r: 10 },
      { x: canvas.width - 60, y: canvas.height - 60, label: 'Node C', color: '#FFD500', r: 10 },
      { x: cx, y: 40, label: 'Firewall', color: state.phase === 'preventing' || state.phase === 'resolved' ? '#00FFA3' : '#3377FF', r: 12 },
    ];

    // Generate packets during attack
    if (state.phase === 'launching' || state.phase === 'detecting') {
      for (let i = 0; i < 3; i++) {
        const srcNode = nodes[Math.floor(Math.random() * 4) + 1];
        packetsRef.current.push({
          x: srcNode.x, y: srcNode.y,
          tx: cx + (Math.random() - 0.5) * 40,
          ty: cy + (Math.random() - 0.5) * 40,
          progress: 0,
          color: state.phase === 'detecting' ? '#3377FF' : '#FF3366',
          speed: 0.008 + Math.random() * 0.01,
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = 'rgba(8, 17, 31, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Connection lines
      nodes.slice(1).forEach(n => {
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = 'rgba(18, 216, 250, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Shield animation when preventing
      if (state.phase === 'preventing' || state.phase === 'resolved') {
        const shieldR = 55 + Math.sin(Date.now() / 400) * 5;
        ctx.beginPath();
        ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
        ctx.strokeStyle = state.phase === 'resolved' ? 'rgba(0,255,163,0.5)' : 'rgba(0,240,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = state.phase === 'resolved' ? 'rgba(0,255,163,0.05)' : 'rgba(0,240,255,0.05)';
        ctx.fill();
      }

      // Nodes
      nodes.forEach(n => {
        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 15);
        grd.addColorStop(0, n.color + '40');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 15, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '30';
        ctx.fill();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = n.color;
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 14);
      });

      // Animate packets
      packetsRef.current = packetsRef.current.filter(p => p.progress < 1);
      packetsRef.current.forEach(p => {
        p.progress = Math.min(1, p.progress + p.speed);
        const px = p.x + (p.tx - p.x) * p.progress;
        const py = p.y + (p.ty - p.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // AI scan ring
      if (state.phase === 'detecting') {
        const r = ((Date.now() % 2000) / 2000) * 150;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 * (1 - r / 150)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [state.phase]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: 300 }}
    />
  );
};

// ─── Attack Simulator Page ─────────────────────────────────
export default function AttackSimulatorPage() {
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    attackType: null,
    phase: 'idle',
    progress: 0,
  });
  const [selectedAttack, setSelectedAttack] = useState<typeof ATTACKS[0] | null>(null);
  const [log, setLog] = useState<{ time: string; msg: string; color: string }[]>([]);

  const addLog = (msg: string, color = 'var(--text-secondary)') => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => [{ time, msg, color }, ...prev].slice(0, 20));
  };

  const startSimulation = (attack: typeof ATTACKS[0]) => {
    if (simState.isRunning) return;
    setSelectedAttack(attack);
    setLog([]);
    addLog(`▶ Starting ${attack.type} simulation...`, '#FFD500');

    setSimState({ isRunning: true, attackType: attack.type, phase: 'launching', progress: 0 });
    toast.error(`🔴 ${attack.type} simulation launched!`);

    // Phase sequence
    setTimeout(() => {
      addLog(`⚡ Attack packets flooding target — ${Math.floor(Math.random() * 50000 + 5000).toLocaleString()} pps`, '#FF3366');
      setSimState(s => ({ ...s, phase: 'launching', progress: 25 }));
    }, 500);

    setTimeout(() => {
      addLog('🔵 AI engine analyzing traffic patterns...', '#00F0FF');
      addLog(`📊 Random Forest model activated — processing features`, '#3377FF');
      setSimState(s => ({ ...s, phase: 'detecting', progress: 55 }));
      toast.loading('AI analyzing threat...', { id: 'ai' });
    }, 2500);

    setTimeout(() => {
      addLog(`✅ Threat detected: ${attack.type}`, '#00F0FF');
      addLog(`📈 Confidence: ${attack.confidence}% | Risk Score: ${attack.risk}/100`, '#00FFA3');
      addLog('🛡️ Prevention engine activated...', '#FFD500');
      setSimState(s => ({ ...s, phase: 'preventing', progress: 80 }));
      toast.dismiss('ai');
      toast.success(`Threat detected: ${attack.type} (${attack.confidence}% confidence)`, { id: 'detect' });
    }, 5000);

    setTimeout(() => {
      addLog(`🔒 Action: ${attack.action}`, '#00FFA3');
      addLog('📋 Incident report generated automatically', '#00FFA3');
      addLog('✅ System status: SECURE', '#00FFA3');
      setSimState({
        isRunning: false,
        attackType: attack.type,
        phase: 'resolved',
        progress: 100,
        result: {
          detected: true,
          confidence: attack.confidence,
          riskScore: attack.risk,
          action: attack.action,
          timeToDetect: 2.4,
        }
      });
      toast.success(`Threat neutralized! — ${attack.action}`, { icon: '🛡️' });
    }, 7500);
  };

  const stopSimulation = () => {
    setSimState({ isRunning: false, attackType: null, phase: 'idle', progress: 0 });
    setSelectedAttack(null);
    setLog([]);
    toast.success('Simulation stopped');
  };

  const phaseColor: Record<string, string> = {
    idle: '#5A7089',
    launching: '#FF5B6B',
    detecting: '#12D8FA',
    preventing: '#FFC857',
    resolved: '#2DE37C',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Attack Simulator</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Simulate cyber attacks to test AI detection and prevention capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attack Selection */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Select Attack Type
          </div>
          {ATTACKS.map(attack => (
            <motion.button
              key={attack.type}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !simState.isRunning && startSimulation(attack)}
              disabled={simState.isRunning}
              className={`w-full text-left p-4 rounded-xl glass-card transition-all ${simState.isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                border: selectedAttack?.type === attack.type ? `1px solid ${attack.color}60` : '1px solid rgba(0,240,255,0.1)',
                background: selectedAttack?.type === attack.type ? `${attack.color}08` : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{attack.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{attack.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {attack.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: attack.color }}>
                    {attack.risk}%
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>risk</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Network Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Bar */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: simState.isRunning ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: simState.isRunning ? Infinity : 0, duration: 0.8 }}
                  className="w-3 h-3 rounded-full"
                  style={{ background: phaseColor[simState.phase] || '#5A7089' }}
                />
                <span className="text-sm font-semibold" style={{ color: phaseColor[simState.phase] }}>
                  {PHASE_LABELS[simState.phase]}
                </span>
              </div>
              {simState.isRunning && (
                <button onClick={stopSimulation} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <Square size={11} /> Stop
                </button>
              )}
            </div>
            {/* Progress */}
            <div className="progress-bar h-2">
              <motion.div
                className="progress-fill h-full"
                animate={{ width: `${simState.progress}%` }}
                transition={{ duration: 0.5 }}
                style={{ background: `linear-gradient(90deg, ${phaseColor[simState.phase]}, ${phaseColor[simState.phase]}aa)` }}
              />
            </div>
          </div>

          {/* Canvas */}
          <div className="glass-card p-4" style={{ height: 300 }}>
            <div className="h-full">
              <NetworkCanvas state={simState} />
            </div>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {simState.phase === 'resolved' && simState.result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 neon-border-green"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
                  <span className="font-bold text-white">Simulation Complete — Threat Neutralized</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Attack Type', val: simState.attackType, color: '#FF5B6B' },
                    { label: 'Confidence', val: `${simState.result.confidence}%`, color: '#12D8FA' },
                    { label: 'Risk Score', val: `${simState.result.riskScore}/100`, color: '#FFC857' },
                    { label: 'Detection Time', val: `${simState.result.timeToDetect}s`, color: '#2DE37C' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-3 rounded-xl"
                      style={{ background: `${m.color}0D`, border: `1px solid ${m.color}25` }}>
                      <div className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.val}</div>
                      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-xl text-xs"
                  style={{ background: 'rgba(0,255,163,0.06)', color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>Prevention Action: </span>
                  {simState.result.action}
                </div>
                <button onClick={stopSimulation} className="btn-ghost mt-3 text-sm py-2 px-4">
                  Run Another Simulation
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity Log */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span className="text-sm font-semibold text-white">Activity Log</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono">
              {log.length === 0 ? (
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Select an attack type to begin simulation...
                </div>
              ) : (
                log.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 text-xs"
                  >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{entry.time}</span>
                    <span style={{ color: entry.color }}>{entry.msg}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
