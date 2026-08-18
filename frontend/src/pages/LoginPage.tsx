import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, Mail, Cpu, Wifi, Database, Activity, type LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// ─── Animated Cyber Grid Canvas ───────────────────────────
const CyberCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(18, 216, 250, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18, 216, 250, ${p.alpha})`;
        ctx.fill();
      });

      // Connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(18, 216, 250, ${0.08 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
};

// ─── Floating Status Chips ─────────────────────────────────
const StatusChip = ({ icon: Icon, label, value, color, delay }: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card"
    style={{ border: `1px solid ${color}30` }}
  >
    <Icon size={13} style={{ color }} />
    <div>
      <div className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-[11px] font-bold" style={{ color }}>{value}</div>
    </div>
  </motion.div>
);

// ─── Login Page ────────────────────────────────────────────
export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@aegissoc.com');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate auth delay
    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      toast.success('Welcome to AegisSOC!');
      navigate('/dashboard');
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      
      <CyberCanvas />

      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 hidden xl:flex">
        <StatusChip icon={Activity} label="Threats Today" value="47" color="#FF3366" delay={0.3} />
        <StatusChip icon={Cpu} label="AI Accuracy" value="97.3%" color="#00F0FF" delay={0.5} />
        <StatusChip icon={Wifi} label="Network" value="Healthy" color="#00FFA3" delay={0.7} />
        <StatusChip icon={Database} label="Events/sec" value="12,400" color="#FFD500" delay={0.9} />
      </div>

      {/* ── Main Login Card ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-[24px] blur-2xl opacity-20"
          style={{ background: 'radial-gradient(ellipse, #00F0FF 0%, transparent 70%)' }} />

        <div className="glass-card p-8 rounded-[24px] relative"
          style={{ border: '1px solid rgba(0,240,255,0.2)' }}>
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ boxShadow: ['0 0 15px rgba(0,240,255,0.3)', '0 0 35px rgba(0,240,255,0.7)', '0 0 15px rgba(0,240,255,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #00F0FF, #3377FF)' }}
            >
              <Shield size={30} className="text-[#030712]" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">AegisSOC</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI-Powered Security Operations Center</p>
          </div>

          {/* Demo credentials notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-3 rounded-xl text-center text-xs"
            style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)', color: 'var(--text-muted)' }}
          >
            <span style={{ color: 'var(--accent-cyan)' }}>Demo: </span>
            admin@aegissoc.com · password123
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9"
                  placeholder="you@aegissoc.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9 pr-10"
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-cyan-400"
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remember me</span>
              </label>
              <button type="button" className="text-xs transition-colors"
                style={{ color: 'var(--accent-cyan)' }}
                onClick={() => toast('Password reset link sent!', { icon: '📧' })}>
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-xs text-center"
                style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', color: 'var(--accent-red)' }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
              style={{ fontSize: '14px' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Sign In Securely
                </>
              )}
            </motion.button>
          </form>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-[rgba(0,240,255,0.08)]">
            {[
              { label: 'JWT Auth', color: '#00F0FF' },
              { label: 'RBAC', color: '#00FFA3' },
              { label: 'Encrypted', color: '#3377FF' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-[10px] font-medium"
                style={{ color: b.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.color, boxShadow: `0 0 5px ${b.color}` }} />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right decorative chips ────────────── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 hidden xl:flex">
        <StatusChip icon={Shield} label="Threats Blocked" value="1,204" color="#00FFA3" delay={0.4} />
        <StatusChip icon={Activity} label="Risk Score" value="74/100" color="#FFD500" delay={0.6} />
        <StatusChip icon={Cpu} label="CPU Usage" value="42%" color="#3377FF" delay={0.8} />
        <StatusChip icon={Database} label="DB Status" value="Online" color="#00F0FF" delay={1.0} />
      </div>
    </div>
  );
}
