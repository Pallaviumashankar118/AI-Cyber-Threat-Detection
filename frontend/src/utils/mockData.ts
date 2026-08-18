import { Threat, Incident, Notification, DashboardStats, Prediction, Report, AttackType, Severity, ThreatStatus } from '../types';

// ─── Helpers ───────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const ips = [
  '192.168.1.', '10.0.0.', '172.16.0.', '45.33.', '104.21.', '198.51.', '203.0.',
];
const makeIP = () => `${pick(ips)}${rand(1, 254)}`;

const countries = [
  { name: 'China', code: 'CN' },
  { name: 'Russia', code: 'RU' },
  { name: 'United States', code: 'US' },
  { name: 'North Korea', code: 'KP' },
  { name: 'Iran', code: 'IR' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Germany', code: 'DE' },
  { name: 'India', code: 'IN' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'Romania', code: 'RO' },
];

const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP', 'DNS', 'FTP', 'SSH'];
const attackTypes: AttackType[] = ['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'Port Scan', 'Malware', 'Ransomware', 'Botnet'];
const severities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
const statuses: ThreatStatus[] = ['Detected', 'Blocked', 'Investigating', 'Closed'];

const uuids = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const timeAgo = (minutes: number) => {
  const d = new Date(Date.now() - minutes * 60 * 1000);
  return d.toISOString();
};

// ─── Generate Threats ──────────────────────────────────────
export const generateThreats = (count = 50): Threat[] => {
  return Array.from({ length: count }, (_, i) => {
    const attackType = pick(attackTypes);
    const severity = pick(severities);
    const riskScore = severity === 'Critical' ? rand(80, 99) :
                      severity === 'High' ? rand(60, 79) :
                      severity === 'Medium' ? rand(35, 59) : rand(10, 34);
    const country = pick(countries);
    return {
      id: uuids(),
      source_ip: makeIP(),
      destination_ip: `10.0.0.${rand(1, 50)}`,
      country: country.name,
      country_code: country.code,
      protocol: pick(protocols),
      port: pick([80, 443, 22, 21, 3306, 8080, 53, 25, 8443, 3389]),
      attack_type: attackType,
      packet_size: rand(64, 65535),
      packets_per_second: rand(100, 50000),
      risk_score: riskScore,
      confidence: rand(75, 99),
      severity,
      status: pick(statuses),
      timestamp: timeAgo(rand(0, 1440)),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ─── Generate Incidents ────────────────────────────────────
const incidentTitles: Record<string, string> = {
  'DDoS': 'Distributed Denial of Service Attack Detected',
  'SQL Injection': 'SQL Injection Attempt on Database Server',
  'XSS': 'Cross-Site Scripting Attack Identified',
  'Brute Force': 'Brute Force Login Attack in Progress',
  'Port Scan': 'Suspicious Port Scanning Activity',
  'Malware': 'Malware Execution Detected on Endpoint',
  'Ransomware': 'Ransomware Encryption Activity Detected',
  'Botnet': 'Botnet Command & Control Communication',
};

const analysts = ['Alex Chen', 'Sarah Mitchell', 'James Rivera', 'Priya Patel', 'Marcus Webb'];
const incidentStatuses = ['Open', 'Investigating', 'Mitigated', 'Closed'] as const;

export const generateIncidents = (count = 20): Incident[] => {
  return Array.from({ length: count }, () => {
    const attackType = pick(attackTypes);
    const severity = pick(severities);
    const status = pick(incidentStatuses);
    return {
      id: `INC-${rand(1000, 9999)}`,
      threat_id: uuids(),
      analyst_id: uuids(),
      analyst_name: pick(analysts),
      title: incidentTitles[attackType] || 'Security Incident Detected',
      description: `Automated AI detection identified suspicious ${attackType} activity from external source. Immediate investigation required.`,
      severity,
      status,
      evidence: `Packet capture logs, system event logs, network flow data collected. Source IP flagged in threat intelligence database.`,
      resolution: status === 'Closed' || status === 'Mitigated'
        ? 'Threat neutralized. IP blocked, firewall rules updated, affected systems patched.'
        : '',
      opened_at: timeAgo(rand(10, 4320)),
      closed_at: status === 'Closed' ? timeAgo(rand(0, 60)) : undefined,
    };
  }).sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());
};

// ─── Dashboard Stats ───────────────────────────────────────
export const generateDashboardStats = (): DashboardStats => ({
  activeThreats: rand(8, 25),
  blockedIPs: rand(140, 320),
  riskScore: rand(62, 88),
  systemHealth: pick(['Healthy', 'Warning', 'Healthy', 'Healthy']),
  todayAttacks: rand(18, 72),
  detectionAccuracy: randFloat(94.5, 99.2),
  incidentCount: rand(5, 18),
  packetsAnalyzed: rand(4500000, 9800000),
  cpuUsage: randFloat(22, 68),
  memoryUsage: randFloat(38, 72),
  networkThroughput: randFloat(124, 890),
});

// ─── Notifications ─────────────────────────────────────────
const notifData = [
  { title: 'Critical DDoS Attack Detected', message: 'High-volume traffic from 45.33.102.14 — risk score 97', type: 'danger' as const },
  { title: 'Brute Force Attack Blocked', message: 'IP 192.168.1.102 blocked after 500 failed login attempts', type: 'warning' as const },
  { title: 'AI Model Retrained', message: 'Random Forest model updated with 2,400 new samples — accuracy 98.2%', type: 'success' as const },
  { title: 'New Incident Created', message: 'INC-4821: SQL Injection detected on DB server assigned to Alex Chen', type: 'info' as const },
  { title: 'Ransomware Quarantined', message: 'Suspicious file execution blocked. Endpoint quarantined automatically.', type: 'danger' as const },
  { title: 'Weekly Report Ready', message: 'Your weekly threat summary report is ready for download.', type: 'info' as const },
  { title: 'System Health: Normal', message: 'All systems operating within normal parameters.', type: 'success' as const },
  { title: 'Port Scan Detected', message: 'Sequential port scanning from 203.0.112.44 — 1,240 ports probed', type: 'warning' as const },
];

export const generateNotifications = (): Notification[] => {
  return notifData.map((n, i) => ({
    id: uuids(),
    user_id: 'admin',
    ...n,
    is_read: i > 3,
    created_at: timeAgo(rand(1, 360)),
  }));
};

// ─── Prediction ────────────────────────────────────────────
export const generatePrediction = (attackType = 'DDoS'): Prediction => ({
  id: uuids(),
  threat_id: uuids(),
  model_name: 'Random Forest v2.1',
  prediction: attackType,
  confidence: randFloat(88, 99.5),
  risk_score: rand(72, 98),
  feature_importance: {
    'Packet Rate': randFloat(0.28, 0.38),
    'Connection Duration': randFloat(0.18, 0.25),
    'Byte Ratio': randFloat(0.12, 0.18),
    'Source Port Entropy': randFloat(0.08, 0.14),
    'Protocol Type': randFloat(0.07, 0.12),
    'Flag Count': randFloat(0.05, 0.09),
    'Payload Size': randFloat(0.03, 0.07),
  },
  shap_values: {
    'Packet Rate': randFloat(0.25, 0.40),
    'Connection Duration': randFloat(-0.1, 0.2),
    'Byte Ratio': randFloat(0.05, 0.18),
    'Source Port Entropy': randFloat(0.05, 0.15),
    'Protocol Type': randFloat(-0.05, 0.12),
    'Flag Count': randFloat(0.02, 0.10),
    'Payload Size': randFloat(-0.03, 0.08),
  },
  explanation: `The AI model detected ${attackType} with high confidence. Primary indicators: abnormally high packet rate (${rand(5000, 50000)} pps), repeated SYN requests without completion, and source IP entropy pattern consistent with distributed botnet activity.`,
  created_at: new Date().toISOString(),
});

// ─── Reports ───────────────────────────────────────────────
const reportTypes = ['Daily', 'Weekly', 'Monthly', 'Executive', 'Threat Summary'] as const;

export const generateReports = (): Report[] => {
  return reportTypes.map(type => ({
    id: uuids(),
    generated_by: 'admin',
    report_type: type,
    created_at: timeAgo(rand(0, 10080)),
    file_path: `/reports/${type.toLowerCase().replace(' ', '_')}_${Date.now()}.pdf`,
  }));
};

// ─── Time Series for Charts ────────────────────────────────
export const generateTimeSeriesData = (points = 24, base = 50, variance = 30) => {
  return Array.from({ length: points }, (_, i) => {
    const hour = new Date(Date.now() - (points - i) * 3600000);
    return {
      time: `${hour.getHours().toString().padStart(2, '0')}:00`,
      threats: rand(Math.max(0, base - variance), base + variance),
      blocked: rand(Math.max(0, base - variance - 10), base + variance - 5),
      normal: rand(200, 600),
    };
  });
};

export const attackDistributionData = [
  { name: 'DDoS', value: 32, color: '#FF3366' },
  { name: 'Brute Force', value: 21, color: '#FFD500' },
  { name: 'SQL Injection', value: 18, color: '#FF9632' },
  { name: 'Port Scan', value: 14, color: '#3377FF' },
  { name: 'Malware', value: 9, color: '#B042FF' },
  { name: 'XSS', value: 6, color: '#00F0FF' },
];

export const generateNetworkFlow = (points = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${String(i * 3).padStart(2, '0')}m`,
    inbound: rand(100, 900),
    outbound: rand(50, 400),
    malicious: rand(0, 80),
  }));
};
