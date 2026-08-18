import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Play, Lock, CheckCircle, Terminal,
  Cpu, Activity, Globe, ArrowRight, Download, Server, RefreshCw,
  Search, Key, Upload, Database, Code, HelpCircle, User, Mail, ShieldAlert, RotateCcw,
  Sliders, FileText, Check, AlertCircle, Ban, Hourglass, Landmark, Users, HardDrive, Wifi, Cloud, Settings
} from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { downloadExecutiveReport } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { SimulationType, Severity, Threat, Incident } from '../types';

// Supported private targets check
const validateTarget = (urlStr: string): boolean => {
  try {
    let hostname = urlStr;
    if (urlStr.includes('://')) {
      const url = new URL(urlStr);
      hostname = url.hostname;
    } else {
      const url = new URL('http://' + urlStr);
      hostname = url.hostname;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    const parts = hostname.split('.').map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      const [p1, p2, p3, p4] = parts;
      if (p1 === 10) return true;
      if (p1 === 192 && p2 === 168) return true;
      if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

interface TelemetryEvent {
  timestamp: string;
  source: string;
  destination: string;
  asset: string;
  action: string;
  result: string;
  risk: number;
  sessionId: string;
  correlationId: string;
}

interface SimulationHistoryEntry {
  id: string;
  type: string;
  target: string;
  timestamp: string;
  status: string;
}

export default function AttackLabPage() {
  const {
    addCustomThreat,
    addCustomIncident,
    addCustomBlockedIP,
    threats,
    incidents,
    telemetryEvents,
    addTelemetryEvent,
    addNotification,
    addPredictionToHistory
  } = useSecurity();

  // Split panel views & layouts
  const [socSubTab, setSocSubTab] = useState<'controls' | 'playbooks' | 'investigation' | 'terminal' | 'history'>('controls');
  const [activeModule, setActiveModule] = useState<string>('auth');
  const [autonomousMode, setAutonomousMode] = useState<'Monitor' | 'Recommend' | 'Auto Response'>('Auto Response');

  // Safety & Targets configuration
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000');
  const [rps, setRps] = useState(5);
  const [duration, setDuration] = useState(30);
  const [concurrentClients, setConcurrentClients] = useState(2);
  const [randomDelay, setRandomDelay] = useState(true);
  const [sourceId, setSourceId] = useState('Simulated-Client-808');
  const [trafficMode, setTrafficMode] = useState<'normal' | 'suspicious' | 'ddos'>('normal');

  // Configurable thresholds
  const [normalThreshold, setNormalThreshold] = useState(5);
  const [suspiciousThreshold, setSuspiciousThreshold] = useState(20);

  // Active Simulation State
  const [simRunning, setSimRunning] = useState(false);
  const [simStage, setSimStage] = useState<'idle' | 'initializing' | 'connecting' | 'generating' | 'analyzing' | 'detecting' | 'matching' | 'calculating' | 'preventing' | 'incident' | 'reporting' | 'completed' | 'halted'>('idle');
  const [currentRequests, setCurrentRequests] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeSimulationType, setActiveSimulationType] = useState<SimulationType | 'Custom Traffic'>('Custom Traffic');
  const [terminalLogs, setTerminalLogs] = useState<{ time: string; msg: string; color: string }[]>([]);
  const [blockStatus, setBlockStatus] = useState<boolean>(false);
  const [lastReport, setLastReport] = useState<any>(null);
  const [simHistory, setSimHistory] = useState<SimulationHistoryEntry[]>([]);

  // Executive (Presentation) Mode
  const [execModeActive, setExecModeActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [timeMachineStep, setTimeMachineStep] = useState(0);

  // Live Telemetry Logs Correlation
  const [correlationChain, setCorrelationChain] = useState<string[]>([]);
  const [correlationScore, setCorrelationScore] = useState(0);

  // Smooth Counter KPIs
  const [kpiSecurityScore, setKpiSecurityScore] = useState(98);
  const [kpiThreatCount, setKpiThreatCount] = useState(2);
  const [kpiBlockedIPs, setKpiBlockedIPs] = useState(12);

  // Shift & Team Operations
  const [shiftMode, setShiftMode] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [currentAnalyst, setCurrentAnalyst] = useState('John Smith');

  // Interactive module states
  // Auth Portal
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFailedCount, setAuthFailedCount] = useState(0);
  const [authLocked, setAuthLocked] = useState(false);
  // Employee Directory
  const [directorySearch, setDirectorySearch] = useState('');
  // API Explorer
  const [apiRoute, setApiRoute] = useState('/api/v1/users/profile');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState('Authorization: Bearer mock-token-xyz');
  const [apiFloodCount, setApiFloodCount] = useState(0);
  const [apiRateLimited, setApiRateLimited] = useState(false);
  // Database Console
  const [sqlQueryInput, setSqlQueryInput] = useState('');
  // File Storage
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: 'Clean' | 'Quarantined' }[]>([
    { name: 'monthly_report.pdf', size: '1.2 MB', status: 'Clean' },
    { name: 'logo.png', size: '420 KB', status: 'Clean' }
  ]);
  // VPN Portal
  const [vpnUsername, setVpnUsername] = useState('');
  const [vpnStatus, setVpnStatus] = useState<'Disconnected' | 'Connecting' | 'Connected' | 'Blocked'>('Disconnected');
  const [vpnAttempts, setVpnAttempts] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Shift calculation on mount
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 14) {
      setShiftMode('Morning');
      setCurrentAnalyst('John Smith');
    } else if (hr >= 14 && hr < 22) {
      setShiftMode('Evening');
      setCurrentAnalyst('Sarah Jenkins');
    } else {
      setShiftMode('Night');
      setCurrentAnalyst('Alex Rivera');
    }
  }, []);

  // Sync mode boundaries
  useEffect(() => {
    if (trafficMode === 'normal') {
      setRps(prev => Math.min(Math.max(prev, 2), 5));
    } else if (trafficMode === 'suspicious') {
      setRps(prev => Math.min(Math.max(prev, 6), 20));
    } else if (trafficMode === 'ddos') {
      setRps(prev => Math.min(Math.max(prev, 21), 50));
    }
  }, [trafficMode]);

  // Terminal scroll
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addTerminalLog = (msg: string, color = 'var(--accent-cyan)') => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, { time, msg, color }]);
  };

  // Live User Operations Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (simRunning) return; // Disable background activity during focused drills
      
      const users = ['Alice Carter', 'David Kim', 'Emma Watson', 'Bob Miller'];
      const assets = ['Auth Portal', 'Directory', 'Customer Portal', 'Cloud Storage', 'API Explorer', 'Email'];
      const actions = ['Read Mail', 'Query API', 'Employee Search', 'Bucket Inbound check'];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      // Push normal telemetry
      pushTelemetryEvent(
        randomUser,
        '10.0.0.45',
        randomAsset,
        randomAction,
        'Success',
        5,
        'sess-bg-' + Math.random().toString(36).substr(2, 5)
      );

      // Jitter Security Score slightly to make it look alive
      setKpiSecurityScore(prev => Math.min(Math.max(prev + (Math.random() > 0.5 ? 1 : -1), 94), 100));

    }, 6500);

    return () => clearInterval(interval);
  }, [simRunning]);

  const pushTelemetryEvent = (
    src: string,
    dest: string,
    asset: string,
    action: string,
    res: string,
    risk: number,
    sess: string
  ) => {
    const timestamp = new Date().toISOString();
    const corrId = 'corr-' + Math.random().toString(36).substr(2, 7);
    const newEvent: TelemetryEvent = {
      timestamp,
      source: src,
      destination: dest,
      asset,
      action,
      result: res,
      risk,
      sessionId: sess,
      correlationId: corrId
    };

    if (addTelemetryEvent) {
      addTelemetryEvent(newEvent);
    }

    // Event correlation calculation
    setCorrelationChain(prev => {
      const updated = [...prev, `${asset}: ${action}`].slice(-5);
      if (updated.some(item => item.includes('Admin') || item.includes('Failed') || item.includes('Quarantined') || item.includes('SQL'))) {
        setCorrelationScore(88);
      } else {
        setCorrelationScore(12);
      }
      return updated;
    });
  };

  // Run Range simulation
  const startRangeSimulation = (type: SimulationType | 'Custom Traffic', customRps?: number, customMode?: 'normal' | 'suspicious' | 'ddos') => {
    if (simRunning) {
      toast.error('Simulation already in progress.');
      return;
    }

    if (!validateTarget(targetUrl)) {
      toast.error('Access Blocked! Target URL is not a local or private address. Intranet/Local targets only.', {
        duration: 5000,
        icon: '⚠️'
      });
      addTerminalLog(`[SECURITY] Target blocked: ${targetUrl}. Resets to localhost safe loopback.`, '#FF3366');
      return;
    }

    setTerminalLogs([]);
    setSimRunning(true);
    setBlockStatus(false);
    setCurrentRequests(0);
    setElapsedTime(0);
    setActiveSimulationType(type);
    setSimStage('initializing');
    setSocSubTab('terminal');

    const selectedRps = customRps || rps;
    const selectedMode = customMode || trafficMode;
    const finalDuration = duration;

    // Adjust smooth counter KPIs
    setKpiSecurityScore(65);
    setKpiThreatCount(prev => prev + 1);

    const getMitreTechnique = () => {
      switch (type) {
        case 'SQL Injection': return 'T1190 - Exploit Public-Facing Application';
        case 'Brute Force': return 'T1110 - Brute Force';
        case 'API Abuse': return 'T1499 - Endpoint Denial of Service';
        case 'Malicious Upload': return 'T1505 - Server Software Component';
        case 'Directory Traversal': return 'T1083 - File and Directory Discovery';
        case 'Port Scan': return 'T1046 - Network Service Discovery';
        default: return 'T1190 - Web Application Exploit';
      }
    };

    addTerminalLog('Initializing Cyber Range simulator...');
    
    // Notify backend to start generating threats
    api.post('/simulator/start', { attack: type === 'Custom Traffic' ? 'DDoS' : type }).catch(console.error);

    let currentSec = 0;
    timerRef.current = setInterval(() => {
      currentSec += 1;
      setElapsedTime(currentSec);

      const deltaRequests = Math.round(selectedRps * (randomDelay ? (0.8 + Math.random() * 0.4) : 1));
      setCurrentRequests(prev => prev + deltaRequests);

      // Sequential log print
      if (currentSec === 1) {
        setSimStage('connecting');
        addTerminalLog(`Connecting to loopback target at ${targetUrl}...`, '#3377FF');
      } else if (currentSec === 3) {
        setSimStage('generating');
        addTerminalLog(`Generating Requests: Transmitting simulated packets [RPS: ${selectedRps}]`, '#3377FF');
        pushTelemetryEvent(sourceId, targetUrl, activeModule.toUpperCase(), `Attack Telemetry Inbound`, 'Blocked', 90, 'sess-sim-99');
      } else if (currentSec === 5) {
        setSimStage('analyzing');
        addTerminalLog('Capturing Logs from internal router sockets...', '#FFD500');
      } else if (currentSec === 7) {
        setSimStage('detecting');
        addTerminalLog('AI Detecting: Scanning headers for signature patterns...', '#B042FF');
      } else if (currentSec === 9) {
        setSimStage('matching');
        addTerminalLog(`Matching MITRE ATT&CK Framework: mapped to ${getMitreTechnique()}`, '#FF3366');
      } else if (currentSec === 11) {
        setSimStage('calculating');
        addTerminalLog('Calculating Risk metrics and Business Impact...', '#FFD500');
      } else if (currentSec === 13) {
        setSimStage('preventing');
        setBlockStatus(true);
        addTerminalLog(`Applying Prevention Containment: Access Blocked for source ID ${sourceId}`, '#FF3366');
        setKpiBlockedIPs(prev => prev + 1);

        // Populate context integration
        const sourceIp = '192.168.1.188';
        const threatId = `thr-man-${Math.random().toString(36).substr(2, 9)}`;
        const incidentId = `INC-RANGE-${Math.floor(Math.random() * 9000) + 1000}`;

        if (addCustomThreat) {
          addCustomThreat({
            id: threatId,
            source_ip: sourceIp,
            destination_ip: '127.0.0.1',
            country: 'Local Network',
            country_code: 'LAN',
            protocol: 'HTTP',
            port: 80,
            attack_type: type === 'Custom Traffic' ? 'DDoS' : type as any,
            packet_size: 2048,
            packets_per_second: selectedRps,
            risk_score: type === 'Custom Traffic' ? 82 : 95,
            confidence: 99.4,
            severity: selectedRps > suspiciousThreshold ? 'Critical' : 'High',
            status: 'Blocked',
            timestamp: new Date().toISOString()
          });
          if (addNotification) {
            addNotification(
              `${type === 'Custom Traffic' ? 'DDoS' : type} Detected`,
              `Risk score ${type === 'Custom Traffic' ? 82 : 95} — IP ${sourceIp}`,
              selectedRps > suspiciousThreshold ? 'Critical' : 'High'
            );
          }
        }

        if (addCustomIncident) {
          addCustomIncident({
            id: incidentId,
            threat_id: threatId,
            analyst_id: 'auto-soc',
            analyst_name: 'AegisSOC Core',
            title: `Cyber Range: ${type}`,
            description: `Simulated security event on company environment asset ${activeModule}`,
            severity: selectedRps > suspiciousThreshold ? 'Critical' : 'High',
            status: 'Closed',
            evidence: `Raw simulated payload matching known ${type} signature. Source ID: ${sourceId}`,
            resolution: 'Threat neutralized automatically. Source IP restricted at network edge.',
            opened_at: new Date().toISOString(),
            closed_at: new Date().toISOString()
          });
          if (addNotification) {
            addNotification(
              `Incident Created: ${type === 'Custom Traffic' ? 'DDoS' : type}`,
              `Automated response neutralized threat. Source IP blocked.`,
              'Medium'
            );
          }

          if (addPredictionToHistory) {
            addPredictionToHistory({
              id: `pred-${Math.random()}`,
              timestamp: new Date().toISOString(),
              threat_type: type === 'Custom Traffic' ? 'DDoS' : type,
              confidence: 99.4,
              severity: selectedRps > suspiciousThreshold ? 'Critical' : 'High',
              action_taken: 'Blocked IP',
              status: 'Success'
            });
          }
        }

        if (addCustomBlockedIP) {
          addCustomBlockedIP(sourceIp);
        }

        toast.error(`🛡️ Response Engine: Containment Applied! Blocked Client ID "${sourceId}"`);
      } else if (currentSec === 16) {
        setSimStage('incident');
        addTerminalLog('Generating Incident log details...', '#B042FF');
      } else if (currentSec === 19) {
        setSimStage('reporting');
        addTerminalLog('Generating Executive Summary and Report...', '#00FFA3');

        const dateStr = new Date().toLocaleString();
        setLastReport({
          id: `REP-CR-${Math.floor(Math.random() * 9000) + 1000}`,
          title: `Cyber Range Incident Audit: ${type}`,
          target: targetUrl,
          mode: selectedMode,
          peakRps: selectedRps,
          duration: finalDuration,
          elapsed: currentSec,
          source: sourceId,
          classification: type,
          severity: selectedRps > suspiciousThreshold ? 'Critical' : 'High',
          actionsTaken: 'Simulated Rate Limiting Enabled, IP quarantined, Account Locked',
          executiveSummary: `On ${dateStr}, AegisSOC Cyber Range triggered a simulated ${type} exploit drill targeting the ${activeModule} module. Dynamic security response was fully completed inside T+13s.`,
          technicalSummary: `Heuristic matches flagged packet structures matching ${getMitreTechnique()}. Perimeter rules quarantined host ${sourceId}.`,
          timeline: [
            { time: 'T+0s', event: 'Simulator parameters validated' },
            { time: 'T+5s', event: 'Connection established & packet buffers analyzed' },
            { time: 'T+9s', event: 'AI Deep Packet Heuristic engines activated' },
            { time: 'T+13s', event: 'Dynamic IP block applied' }
          ],
          recommendations: [
            'Maintain educational local lab policies.',
            'Deploy dynamic rate limiting profiles.'
          ]
        });

        // Add to history list
        setSimHistory(prev => [
          {
            id: `SIM-${Math.floor(Math.random() * 9000) + 1000}`,
            type: type,
            target: targetUrl,
            timestamp: new Date().toLocaleTimeString(),
            status: 'Mitigated'
          },
          ...prev
        ]);
      }

      if (currentSec >= finalDuration) {
        setSimStage('completed');
        addTerminalLog('Simulation Complete. Range systems secured.', '#00FFA3');
        setKpiSecurityScore(99);
        clearInterval(timerRef.current!);
        setSimRunning(false);
        if (execModeActive) {
          setExecModeActive(false);
        }
        api.post('/simulator/stop').catch(console.error);
        toast.success(`Cyber Range Drill Completed: ${type}`);
      }
    }, 1000);
  };

  const stopRangeSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSimRunning(false);
    setExecModeActive(false);
    setSimStage('halted');
    setKpiSecurityScore(98);
    api.post('/simulator/stop').catch(console.error);
    addTerminalLog('🚨 Simulation emergency stopped.', '#FF3366');
    toast.error('Simulation stopped.');
  };

  // Executive Mode runner automation (1-click presentation tool)
  const startExecutiveMode = () => {
    if (simRunning) return;
    setExecModeActive(true);
    toast.success('Executive Mode Activated: Auto-sequencing demo steps...');
    startRangeSimulation('SQL Injection', 15, 'suspicious');
  };

  // Interactive Company Modules Handlers
  const handleAuthLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authLocked) {
      toast.error('Account locked! Authentications blocked.');
      return;
    }
    pushTelemetryEvent(authEmail || 'guest', '127.0.0.1', 'Auth Portal', 'Login Attempt', 'Failure', 15, 'sess-auth-01');
    setAuthFailedCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        setAuthLocked(true);
        startRangeSimulation('Brute Force', 15, 'suspicious');
        toast.error('Multiple failed login attempts! Account Locked.');
      } else {
        toast.error(`Invalid login credentials. Attempt ${nextCount}/3`);
      }
      return nextCount;
    });
  };

  const handleDirectorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = directorySearch.toLowerCase();
    pushTelemetryEvent('Client-09', '127.0.0.1', 'Directory Portal', `Search: ${query}`, 'Success', 10, 'sess-dir-02');
    if (query.includes('union select') || query.includes('<script>')) {
      startRangeSimulation('SQL Injection', 6, 'suspicious');
      toast.error('Suspicious search query flagged by AegisSOC!');
    } else {
      toast.success(`Employee Directory: 0 records found for "${directorySearch}"`);
    }
  };

  const handleApiQuery = () => {
    pushTelemetryEvent(sourceId, '127.0.0.1', 'API Explorer', `GET ${apiRoute}`, 'Success', 8, 'sess-api-03');
    setApiFloodCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setApiRateLimited(true);
        startRangeSimulation('API Abuse', 35, 'ddos');
        toast.error('API Abuse detected! Rate limits activated.');
      } else {
        toast.success(`API Route ${apiRoute} request processed.`);
      }
      return nextCount;
    });
  };

  const handleSqlConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushTelemetryEvent('ConsoleAdmin', '127.0.0.1', 'Database Console', `Execute Query`, 'Blocked', 95, 'sess-db-04');
    if (sqlQueryInput.includes("' OR 1=1 --") || sqlQueryInput.toLowerCase().includes('union select')) {
      startRangeSimulation('SQL Injection', 10, 'suspicious');
      toast.error('SQL Injection payload blocked by firewall!');
    } else {
      toast.success('Query syntax validated. No rows returned.');
    }
  };

  const handleFileUpload = (fileName: string) => {
    const isMalicious = ['dummy.php', 'demo.exe', 'training.sh'].some(ext => fileName.toLowerCase().endsWith(ext));
    pushTelemetryEvent('StorageClient', '127.0.0.1', 'File Storage', `Upload file ${fileName}`, isMalicious ? 'Quarantined' : 'Success', isMalicious ? 98 : 5, 'sess-files-05');
    if (isMalicious) {
      setUploadedFiles(prev => [
        { name: fileName, size: '8.4 KB', status: 'Quarantined' },
        ...prev
      ]);
      startRangeSimulation('Malicious Upload', 8, 'suspicious');
      toast.error('Malware Upload Blocked! File Quarantined.');
    } else {
      setUploadedFiles(prev => [
        { name: fileName, size: '150 KB', status: 'Clean' },
        ...prev
      ]);
      toast.success(`File ${fileName} uploaded successfully.`);
    }
  };

  const handleVpnConnect = () => {
    setVpnStatus('Connecting');
    pushTelemetryEvent(vpnUsername || 'vpn-user', '127.0.0.1', 'VPN Gateway', 'VPN Connect Handshake', 'Failure', 25, 'sess-vpn-06');
    setVpnAttempts(prev => {
      const nextAttempts = prev + 1;
      if (nextAttempts >= 4) {
        setVpnStatus('Blocked');
        startRangeSimulation('Credential Stuffing', 15, 'suspicious');
        toast.error('Rapid VPN connection attempts flagged! Access Blocked.');
      } else {
        setTimeout(() => setVpnStatus('Disconnected'), 800);
        toast.error(`VPN Handshake failed. Attempt ${nextAttempts}/4`);
      }
      return nextAttempts;
    });
  };

  const handleAdminAccess = () => {
    pushTelemetryEvent('UnknownGuest', '127.0.0.1', 'Admin Portal', 'Privileged directory read', 'Blocked', 99, 'sess-admin-07');
    startRangeSimulation('Unauthorized Access' as any, 10, 'suspicious');
    toast.error('Access Denied! Unauthorized administrative entry.');
  };

  const handleDownloadReport = () => {
    if (!lastReport) return;
    const mockAnalysis = {
      summary: lastReport.executiveSummary,
      endpoint: '/api/v1/simulator/ingress',
      payload: `Generated ${lastReport.peakRps} requests/sec from client: ${lastReport.source}`,
      dbAccess: 'None',
      prevention: lastReport.actionsTaken,
      threatFamily: lastReport.classification,
      attackVector: 'Local Loopback Ingress',
      mitreTechnique: 'T1498 - Network Denial of Service',
      target: lastReport.target,
      businessImpact: 'LOW (Simulated Drill)',
      firewallRule: 'Quarantined Client ID',
      threatIntelMatch: 'Simulation matches local lab patterns',
      recommendations: lastReport.recommendations
    };

    downloadExecutiveReport(
      activeSimulationType,
      99.4,
      lastReport.peakRps > 20 ? 98 : 75,
      13,
      [],
      mockAnalysis
    );
  };

  const STAGES_LIST = ['connecting', 'generating', 'analyzing', 'detecting', 'matching', 'calculating', 'preventing', 'incident', 'reporting', 'completed'];

  return (
    <div className="space-y-6">
      {/* Permanent safety banner */}
      <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
        <Shield className="text-red-400 shrink-0 mt-0.5" size={18} />
        <div>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block font-mono">EDUCATIONAL USE ONLY</span>
          <p className="text-xs text-slate-355 mt-0.5 leading-relaxed">
            This environment is intended only for systems you own or are authorized to test. Public websites, public IP addresses, and external systems must never be targeted.
          </p>
        </div>
      </div>

      {/* Header bar and Shift stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider block font-mono">Real-time Demonstration Console</span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Server className="text-[#00F0FF]" size={22} /> ENTERPRISE CYBER RANGE
            </h1>
          </div>
          <button
            onClick={() => setTourStep(1)}
            className="px-3 py-1 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 rounded text-[10px] font-mono text-[#00F0FF] font-bold uppercase transition-all"
            aria-label="Start Guided Demo Walkthrough"
          >
            Guided Walkthrough
          </button>
        </div>

        {/* SOC Shift Widget */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-4 text-[10px] font-mono">
          <div>
            <span className="text-slate-500 block">CURRENT SHIFT</span>
            <span className="text-[#00F0FF] font-bold">{shiftMode} Shift</span>
          </div>
          <div className="w-px h-8 bg-slate-850" />
          <div>
            <span className="text-slate-500 block">ACTIVE ANALYST</span>
            <span className="text-white font-bold">{currentAnalyst}</span>
          </div>
          <div className="w-px h-8 bg-slate-850" />
          <div>
            <span className="text-slate-500 block">AVG RESPONSE</span>
            <span className="text-[#00FFA3] font-bold">420ms</span>
          </div>
        </div>
      </div>

      {/* Live smooth KPI counter blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Security posture score', value: kpiSecurityScore, suffix: '%', color: kpiSecurityScore > 80 ? '#00FFA3' : '#FF3366' },
          { label: 'Threats mitigated', value: kpiThreatCount, suffix: '', color: '#00F0FF' },
          { label: 'Network edge blocks', value: kpiBlockedIPs, suffix: '', color: '#FFD500' },
          { label: 'Active environment modules', value: 12, suffix: '', color: '#B042FF' }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-4 flex flex-col justify-between">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">{kpi.label}</span>
            <span className="text-2xl font-bold font-mono mt-1 text-white" style={{ color: kpi.color }}>
              {kpi.value}{kpi.suffix}
            </span>
          </div>
        ))}
      </div>

      {/* Cyber Range Split Workstation Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ==================== LEFT PANEL: SOC CONTROL CENTER ==================== */}
        <div className="xl:col-span-6 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[#00F0FF]" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">SOC CONTROL CORE</span>
              </div>
              <div className="flex gap-1 rounded bg-slate-950 p-0.5 border border-slate-850">
                {['controls', 'playbooks', 'investigation', 'terminal', 'history'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSocSubTab(tab as any)}
                    className={`px-2 py-1 text-[9px] font-semibold uppercase rounded transition-all ${
                      socSubTab === tab ? 'bg-[#00F0FF] text-[#030712]' : 'text-slate-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: Controls */}
            {socSubTab === 'controls' && (
              <div className="space-y-4">
                {/* Autonomous SOC mode picker */}
                <div className="space-y-1.5 border-b border-slate-900 pb-3">
                  <span className="text-[9px] text-slate-500 font-mono block">AUTONOMOUS OPERATING MODE</span>
                  <div className="flex gap-1.5 rounded-lg bg-slate-950 p-1 border border-slate-850 font-mono text-[9px]">
                    {['Monitor', 'Recommend', 'Auto Response'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => { setAutonomousMode(mode as any); toast.success(`SOC operating mode: ${mode}`); }}
                        className={`flex-1 py-1 rounded font-bold uppercase transition-all ${
                          autonomousMode === mode ? 'bg-[#00F0FF] text-[#030712]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">TARGET ADDR</label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      disabled={simRunning}
                      className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">CLIENT ID</label>
                    <input
                      type="text"
                      value={sourceId}
                      onChange={e => setSourceId(e.target.value)}
                      disabled={simRunning}
                      className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startRangeSimulation('Custom Traffic')}
                    disabled={simRunning}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#08111F] font-bold text-[10px] uppercase rounded"
                  >
                    Start Ingress Traffic
                  </button>
                  <button
                    onClick={startExecutiveMode}
                    disabled={simRunning}
                    className="flex-1 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#030712] font-bold text-[10px] uppercase rounded flex items-center justify-center gap-1"
                  >
                    <Play size={11} /> Executive Demo Mode
                  </button>
                  <button
                    onClick={stopRangeSimulation}
                    disabled={!simRunning}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase rounded"
                  >
                    Halt
                  </button>
                </div>

                {/* Preconfigured simulation triggers */}
                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <span className="text-[9px] text-slate-500 font-mono block">TRIGGER RAPID ATTACK VECTORS</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'SQL Injection', label: 'SQL Injection' },
                      { type: 'Brute Force', label: 'Brute Force' },
                      { type: 'API Abuse', label: 'API Abuse' }
                    ].map(att => (
                      <button
                        key={att.type}
                        onClick={() => startRangeSimulation(att.type as any, att.type === 'API Abuse' ? 45 : 12)}
                        disabled={simRunning}
                        className="py-1 px-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-355 text-[9px] font-mono rounded text-left flex justify-between items-center"
                      >
                        {att.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cyber Kill Chain Progression View */}
                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <span className="text-[9px] text-slate-500 font-mono block">Cyber Kill Chain Progress</span>
                  <div className="flex gap-1 justify-between font-mono text-[7px] text-center">
                    {[
                      { name: 'Recon', active: simStage === 'connecting' },
                      { name: 'Delivery', active: simStage === 'generating' },
                      { name: 'Exploit', active: simStage === 'detecting' },
                      { name: 'Contain', active: simStage === 'preventing' },
                      { name: 'Mitigated', active: simStage === 'completed' }
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 p-1 rounded border transition-all ${
                          step.active ? 'bg-red-950 border-red-500 text-red-400 font-bold' : 'bg-slate-950 text-slate-500 border-slate-900'
                        }`}
                      >
                        {step.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Machine Scrubber Slider */}
                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-mono block">AI TIME MACHINE PLAYBACK</span>
                    <span className="text-[8px] text-[#00F0FF] font-mono">Stage: {simStage.toUpperCase()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={timeMachineStep}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setTimeMachineStep(val);
                      const stages: typeof simStage[] = ['idle', 'connecting', 'generating', 'analyzing', 'detecting', 'matching', 'calculating', 'preventing', 'incident', 'reporting', 'completed'];
                      setSimStage(stages[val]);
                      addTerminalLog(`[TIME MACHINE] Scrupped timeline state to: ${stages[val].toUpperCase()}`, '#00F0FF');
                    }}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Live Playbook Engine */}
            {socSubTab === 'playbooks' && (
              <div className="space-y-4 font-mono text-[9px] text-slate-350">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-white block font-bold text-xs uppercase text-[#00F0FF]">SQL Injection Response Playbook</span>
                  <div className="space-y-1">
                    <p className={simStage === 'detecting' || simStage === 'matching' ? 'text-amber-400 font-bold' : ''}>1. DETECTION: Scan URI string parameters for union/OR signatures.</p>
                    <p className={simStage === 'preventing' ? 'text-[#00FFA3] font-bold' : ''}>2. CONTAINMENT: Quarantine source IP block and drop traffic.</p>
                    <p className={simStage === 'completed' ? 'text-blue-400 font-bold' : ''}>3. RECOVERY: Restore DB states and audit credentials logs.</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-white block font-bold text-xs uppercase text-[#00F0FF]">Brute Force Mitigate Playbook</span>
                  <div className="space-y-1">
                    <p>1. DETECTION: Threshold &gt;3 failures triggers alarm sweeps.</p>
                    <p>2. CONTAINMENT: Enforce SSO lockouts and block IP rules.</p>
                    <p>3. RECOVERY: Flag account for MFA re-authentication.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI Investigation Confidence Explanation */}
            {socSubTab === 'investigation' && (
              <div className="space-y-4 font-mono text-[10px]">
                {simStage !== 'idle' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#00F0FF]/5 border border-[#00F0FF]/10 rounded-xl space-y-2">
                      <span className="text-white block font-bold text-xs">AI Confidence assessment: 99.4%</span>
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Heuristic explanation verdicts:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1 text-[9px]">
                        <li>• Repeated failed authentication sequence patterns matched.</li>
                        <li>• Payload string matches MITRE signature registry indicators.</li>
                        <li>• Inbound packet count exceeded local safety threshold limits.</li>
                        <li>• Anomaly classification model evaluated posture block criteria.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-red-950/15 border border-red-500/20 rounded-xl space-y-1">
                      <span className="text-red-400 block font-bold">Correlation Engine Insight</span>
                      <div className="text-[9px] text-slate-400 mt-1">
                        <span className="block font-bold">Score: {correlationScore}%</span>
                        <span className="block mt-1">Chain: {correlationChain.join(' -> ') || 'Standing by'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-600">[Heuristics offline. Start a range simulation to view AI details]</div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Live terminal logs */}
            {socSubTab === 'terminal' && (
              <div className="h-64 overflow-y-auto font-mono text-[9px] bg-black/80 p-3 rounded-lg border border-slate-900 space-y-1.5">
                {terminalLogs.length === 0 ? (
                  <div className="text-slate-600 text-center py-16">[SOC Console Standby. Interactive range sweeps print here]</div>
                ) : (
                  terminalLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span style={{ color: log.color }}>{log.msg}</span>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            )}

            {/* TAB CONTENT: Simulation History */}
            {socSubTab === 'history' && (
              <div className="space-y-2 font-mono text-[10px] max-h-64 overflow-y-auto">
                {simHistory.length === 0 ? (
                  <div className="text-slate-600 text-center py-12">[No historical range entries logged]</div>
                ) : (
                  simHistory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-900">
                      <div>
                        <span className="text-white block font-bold">{item.type}</span>
                        <span className="text-slate-500 text-[8px]">{item.timestamp} · {item.target}</span>
                      </div>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-[#00FFA3]">
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dynamic Threat Heat Map and Digital Twin of Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Heat Map Widget */}
            <div className="glass-card p-5 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Telemetry Heat Map</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center">
                {[
                  { label: 'Auth', active: activeModule === 'auth' },
                  { label: 'Database', active: activeModule === 'db' },
                  { label: 'API Route', active: activeModule === 'api' },
                  { label: 'Cloud Storage', active: activeModule === 'cloud' },
                  { label: 'VPN Access', active: activeModule === 'vpn' },
                  { label: 'Mail Ingress', active: activeModule === 'email' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border transition-all duration-300 ${
                      item.active
                        ? 'bg-red-500/25 border-red-500 text-white font-bold animate-pulse'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Twin Widget */}
            <div className="glass-card p-5 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Digital twin asset telemetry</span>
              <div className="space-y-2 font-mono text-[8px]">
                {[
                  { label: 'HQ Office Core', health: '98%', risk: 'Low', owner: 'CorpNet', prot: 'High' },
                  { label: 'Cloud Infrastructure', health: '100%', risk: 'Low', owner: 'DevOps', prot: 'Max' },
                  { label: 'Branch Datacenters', health: '94%', risk: 'Medium', owner: 'InfraTeam', prot: 'Medium' }
                ].map((unit, idx) => (
                  <div key={idx} className="p-2 rounded border bg-slate-950/40 border-slate-900 flex justify-between text-slate-350">
                    <span className="text-white font-bold">{unit.label}</span>
                    <span>Health: {unit.health} · Risk: {unit.risk} · Owner: {unit.owner}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Business Impact Simulator & Future Roadmap Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Impact Simulator widget */}
            <div className="glass-card p-5 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Business Impact Simulator</span>
              <div className="space-y-1.5 font-mono text-[9px] text-slate-400">
                <div className="flex justify-between">
                  <span>Simulated Savings Avoided:</span>
                  <span className="text-[#00FFA3] font-bold">$185,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Downtime Hours Saved:</span>
                  <span className="text-[#00F0FF] font-bold">4.2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>User Records Protected:</span>
                  <span className="text-white font-bold">12,500 records</span>
                </div>
              </div>
            </div>

            {/* Future Roadmap widget */}
            <div className="glass-card p-5 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">AegisSOC Future Roadmap</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px] text-slate-500 uppercase font-bold text-center">
                <div className="p-1.5 bg-slate-950/40 border border-slate-900 rounded">Threat Hunting</div>
                <div className="p-1.5 bg-slate-950/40 border border-slate-900 rounded">Zero Trust</div>
                <div className="p-1.5 bg-slate-950/40 border border-slate-900 rounded">EDR Integration</div>
                <div className="p-1.5 bg-slate-950/40 border border-slate-900 rounded">ASM Control</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Network Map SVG widget */}
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Intranet Network Topology Map</span>
            <div className="w-full h-44 bg-slate-950 rounded-xl border border-slate-900 relative overflow-hidden flex items-center justify-center">
              
              {/* Dynamic communication lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Gateway to Firewall */}
                <line x1="50" y1="88" x2="110" y2="88" stroke="#00F0FF" strokeWidth="1" strokeDasharray="3,3" />
                {/* Firewall to WebServer */}
                <line x1="110" y1="88" x2="200" y2="88" stroke={simStage === 'connecting' ? '#FFD500' : '#00F0FF'} strokeWidth="1" />
                {/* WebServer to API */}
                <line x1="200" y1="88" x2="290" y2="50" stroke={simStage === 'generating' ? '#FFD500' : '#00F0FF'} strokeWidth="1" />
                {/* WebServer to Database */}
                <line x1="200" y1="88" x2="290" y2="120" stroke={simStage === 'preventing' ? '#FF3366' : '#00F0FF'} strokeWidth="1" />
                
                {/* Animated Packet Circle */}
                {simRunning && (
                  <circle r="3" fill="#00FFA3">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M50,88 L200,88 L290,50" />
                  </circle>
                )}
              </svg>

              {/* Topology Node markers */}
              <div className="absolute left-6 top-[72px] flex flex-col items-center">
                <Globe size={16} className="text-slate-400" />
                <span className="text-[8px] font-mono text-slate-500 mt-1">Gateway</span>
              </div>
              <div className="absolute left-[100px] top-[72px] flex flex-col items-center">
                <Shield size={16} className="text-[#00F0FF]" />
                <span className="text-[8px] font-mono text-slate-500 mt-1">Firewall</span>
              </div>
              <div className="absolute left-[180px] top-[72px] flex flex-col items-center">
                <Server size={16} className={blockStatus ? 'text-red-400 animate-bounce' : 'text-[#00FFA3]'} />
                <span className="text-[8px] font-mono text-slate-500 mt-1">WebServer</span>
              </div>
              <div className="absolute right-[80px] top-[30px] flex flex-col items-center">
                <Code size={16} className="text-[#3377FF]" />
                <span className="text-[8px] font-mono text-slate-500 mt-1">API</span>
              </div>
              <div className="absolute right-[80px] bottom-[30px] flex flex-col items-center">
                <Database size={16} className="text-emerald-400" />
                <span className="text-[8px] font-mono text-slate-500 mt-1">Database</span>
              </div>

            </div>
          </div>
        </div>

        {/* ==================== RIGHT PANEL: PROTECTED COMPANY ENVIRONMENT ==================== */}
        <div className="xl:col-span-6 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#00FFA3]" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Protected Company Modules</span>
              </div>
              <span className="text-[9px] text-[#00FFA3] font-mono">SHIELD ACTIVE</span>
            </div>

            {/* Modules Grid Picker */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'auth', label: 'Auth Portal', icon: Key },
                { id: 'directory', label: 'Directory', icon: Users },
                { id: 'api', label: 'API Explorer', icon: Code },
                { id: 'db', label: 'SQL Console', icon: Database },
                { id: 'files', label: 'Storage', icon: HardDrive },
                { id: 'admin', label: 'Admin', icon: Settings },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'vpn', label: 'VPN Portal', icon: Wifi }
              ].map(mod => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`p-2 rounded border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      activeModule === mod.id
                        ? 'bg-[#00FFA3]/15 border-[#00FFA3] text-[#00FFA3]'
                        : 'bg-slate-950/45 border-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span className="text-[8px] font-mono uppercase truncate max-w-full">{mod.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Module view sandbox */}
            <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl min-h-[220px]">
              
              {/* Auth Portal Module */}
              {activeModule === 'auth' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-white font-mono block">Auth SSO Portal</span>
                  {authLocked ? (
                    <div className="p-4 bg-red-950/15 border border-red-500/20 rounded text-center space-y-2 font-mono">
                      <Lock className="text-red-500 mx-auto" size={20} />
                      <h4 className="text-xs font-bold text-red-400">PROFILE LOCK ENGAGED</h4>
                      <p className="text-[9px] text-slate-405">SSO locked. Triggered brute-force simulation events automatically.</p>
                      <button
                        onClick={() => { setAuthLocked(false); setAuthFailedCount(0); }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-white"
                      >
                        Reset lock
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAuthLogin} className="space-y-2 max-w-xs mx-auto">
                      <input
                        type="text"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="john.smith@company.com"
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs font-mono"
                      />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="password"
                        className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs font-mono"
                      />
                      <button type="submit" className="w-full py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded">
                        Login
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Directory search module */}
              {activeModule === 'directory' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-white font-mono block font-mono">Employee Directory</span>
                  <form onSubmit={handleDirectorySearch} className="flex gap-2">
                    <input
                      type="text"
                      value={directorySearch}
                      onChange={e => setDirectorySearch(e.target.value)}
                      placeholder="e.g. union select"
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-1.5 text-xs font-mono"
                    />
                    <button type="submit" className="px-4 py-1.5 bg-slate-900 text-xs font-bold text-white rounded">
                      Search
                    </button>
                  </form>
                </div>
              )}

              {/* API explorer module */}
              {activeModule === 'api' && (
                <div className="space-y-3 font-mono text-[10px]">
                  <span className="text-xs font-bold text-white block">API Request Panel</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiRoute}
                      onChange={e => setApiRoute(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-1.5"
                    />
                    <button onClick={handleApiQuery} className="px-3 bg-slate-900 border border-slate-800 text-white rounded">
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* SQL Console module */}
              {activeModule === 'db' && (
                <div className="space-y-3 font-mono text-[10px]">
                  <span className="text-xs font-bold text-white block">Interactive Database console</span>
                  <form onSubmit={handleSqlConsoleSubmit} className="space-y-2">
                    <textarea
                      value={sqlQueryInput}
                      onChange={e => setSqlQueryInput(e.target.value)}
                      placeholder="SELECT * FROM users WHERE ID = 1;"
                      className="w-full bg-slate-950 border border-slate-850 rounded p-2 h-14"
                    />
                    <button type="submit" className="w-full py-1.5 bg-slate-900 border border-slate-800 text-white rounded">
                      Execute SQL query
                    </button>
                  </form>
                </div>
              )}

              {/* File storage upload module */}
              {activeModule === 'files' && (
                <div className="space-y-3 font-mono text-[9px]">
                  <span className="text-xs font-bold text-white block font-mono">File Upload repository</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-dashed border-slate-800 rounded p-4 text-center">
                      <span className="block text-slate-500">Inject training file:</span>
                      <div className="flex gap-1.5 justify-center mt-2">
                        {['dummy.php', 'clean.pdf'].map(f => (
                          <button
                            key={f}
                            onClick={() => handleFileUpload(f)}
                            className="px-2 py-0.5 bg-slate-900 border border-slate-855 rounded text-white"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between p-1 bg-slate-950 rounded">
                          <span>{file.name}</span>
                          <span className={file.status === 'Quarantined' ? 'text-red-400 font-bold' : 'text-slate-505'}>{file.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Portal Module */}
              {activeModule === 'admin' && (
                <div className="space-y-3 font-mono text-center py-4">
                  <span className="text-xs font-bold text-white block">Internal admin cluster panel</span>
                  <button onClick={handleAdminAccess} className="px-4 py-2 bg-red-950 border border-red-500/25 text-red-400 rounded text-xs">
                    Access Dashboard Console
                  </button>
                </div>
              )}

              {/* Email Gateway Module */}
              {activeModule === 'email' && (
                <div className="space-y-2 font-mono text-[9px]">
                  <span className="text-xs font-bold text-white block font-mono">Mailbox routing filters</span>
                  {[
                    { from: 'alerts@soc.company', sub: 'Weekly alert digest', attachment: 'report.pdf' },
                    { from: 'attacker@c2.server', sub: 'Attachment instructions', attachment: 'training.sh' }
                  ].map((mail, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-955 border border-slate-900 rounded flex justify-between items-center">
                      <span>{mail.sub} ({mail.from})</span>
                      <button
                        onClick={() => handleFileUpload(mail.attachment)}
                        className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-amber-400"
                      >
                        Download {mail.attachment}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* VPN Tunnel module */}
              {activeModule === 'vpn' && (
                <div className="space-y-3 max-w-xs mx-auto font-mono text-[10px]">
                  <span className="text-xs font-bold text-white block">VPN Access Portal</span>
                  <input
                    type="text"
                    value={vpnUsername}
                    onChange={e => setVpnUsername(e.target.value)}
                    placeholder="vpn-user-01"
                    className="w-full bg-slate-950 border border-slate-850 rounded p-1"
                  />
                  <button onClick={handleVpnConnect} className="w-full py-1.5 bg-slate-900 border border-slate-855 text-white rounded">
                    Connect Tunnel
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Live MITRE ATT&CK Matrix panel */}
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Dynamic MITRE Matrix Highlights</span>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[8px] text-slate-500 uppercase font-bold">
              {[
                { tech: 'T1190', label: 'Initial Access', active: activeSimulationType === 'SQL Injection' },
                { tech: 'T1059', label: 'Execution', active: activeSimulationType === 'Malicious Upload' },
                { tech: 'T1110', label: 'Credential Access', active: activeSimulationType === 'Brute Force' },
                { tech: 'T1498', label: 'Impact / DDoS', active: simStage === 'preventing' && activeSimulationType === 'Custom Traffic' }
              ].map((cell, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border transition-all duration-300 ${
                    cell.active
                      ? 'bg-red-950 border-red-500 text-red-400 scale-105 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                      : 'bg-slate-950/40 border-slate-900'
                  }`}
                >
                  <span className="block text-white font-bold">{cell.tech}</span>
                  <span className="block mt-1 text-[7px] leading-tight">{cell.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Telemetry Events Logger Ticker */}
      <div className="glass-card p-5 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Live Telemetry Events Logs Feed</span>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[9px] text-slate-405 border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500">
                <th className="py-2 pr-4">TIMESTAMP</th>
                <th className="py-2 pr-4">SOURCE</th>
                <th className="py-2 pr-4">DESTINATION</th>
                <th className="py-2 pr-4">ASSET</th>
                <th className="py-2 pr-4">ACTION</th>
                <th className="py-2 pr-4">RESULT</th>
                <th className="py-2">RISK</th>
              </tr>
            </thead>
            <tbody>
              {telemetryEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-600">[Telemetry standing by. Generating background employee requests]</td>
                </tr>
              ) : (
                telemetryEvents.map((ev, idx) => (
                  <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/10">
                    <td className="py-1.5 pr-4 text-slate-500">{ev.timestamp.split('T')[1].substr(0, 8)}</td>
                    <td className="py-1.5 pr-4 text-white font-semibold">{ev.source}</td>
                    <td className="py-1.5 pr-4">{ev.destination}</td>
                    <td className="py-1.5 pr-4 text-[#00F0FF]">{ev.asset}</td>
                    <td className="py-1.5 pr-4">{ev.action}</td>
                    <td className="py-1.5 pr-4">
                      <span className={`px-1.5 py-0.5 rounded ${ev.result === 'Blocked' || ev.result === 'Quarantined' ? 'bg-red-950 text-red-400' : 'bg-emerald-950/20 text-emerald-400'}`}>
                        {ev.result}
                      </span>
                    </td>
                    <td className="py-1.5 font-bold" style={{ color: ev.risk > 70 ? '#FF3366' : (ev.risk > 30 ? '#FFD500' : '#00FFA3') }}>{ev.risk}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guided Walkthrough Tour Overlay Cards */}
      <AnimatePresence>
        {tourStep > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-[#00F0FF]/30 p-5 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.15)] font-mono text-xs text-slate-300 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-white font-bold uppercase tracking-wider">GUIDED RANGE TUTORIAL</span>
                <span className="text-[10px] text-slate-500">Step {tourStep} of 3</span>
              </div>

              {tourStep === 1 && (
                <div className="space-y-2">
                  <p className="font-bold text-[#00F0FF]">1. SOC CONTROL CENTER (Left Panel)</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    This panel controls AegisSOC simulations. You can configure target hosts, launch custom traffic patterns, or trigger preconfigured cyber threats.
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-2">
                  <p className="font-bold text-[#00FFA3]">2. PROTECTED COMPANY ENVIRONMENT (Right Panel)</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    This contains interactive mock modules representing company assets. Try submitting inputs to the SQL Console, failed logins to Auth Portal, or file uploads to trigger real-time AI WAF locks.
                  </p>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-2">
                  <p className="font-bold text-amber-400">3. TELEMETRY & NETWORK TOPOLOGY</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    The SVG network map and the bottom live events feed log employee tasks and malicious payloads. Watch indicators change to red when containment drops apply.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {tourStep > 1 && (
                  <button
                    onClick={() => setTourStep(prev => prev - 1)}
                    className="flex-1 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-semibold text-[10px] text-white"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (tourStep < 3) {
                      setTourStep(prev => prev + 1);
                    } else {
                      setTourStep(0);
                      toast.success('Ready to run drills! Click "Executive Demo Mode" for a quick automated walkthrough.');
                    }
                  }}
                  className="flex-1 py-1.5 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#08111F] rounded font-bold text-[10px] uppercase"
                >
                  {tourStep === 3 ? 'Done' : 'Next'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
