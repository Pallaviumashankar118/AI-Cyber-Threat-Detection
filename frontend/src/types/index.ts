// ─── User & Auth ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Manager';
  avatar?: string;
  status: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Threats ───────────────────────────────────────────────
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ThreatStatus = 'Detected' | 'Blocked' | 'Investigating' | 'Closed';
export type AttackType =
  | 'DDoS'
  | 'SQL Injection'
  | 'XSS'
  | 'CSRF'
  | 'Command Injection'
  | 'Directory Traversal'
  | 'Brute Force'
  | 'Credential Stuffing'
  | 'Password Spray'
  | 'Port Scan'
  | 'Malware'
  | 'Malicious Upload'
  | 'Ransomware'
  | 'Ransomware Simulation'
  | 'Trojan Simulation'
  | 'Botnet'
  | 'API Abuse'
  | 'Privilege Escalation'
  | 'Unauthorized Access'
  | 'Data Exfiltration Simulation'
  | 'ARP Spoof Simulation'
  | 'DNS Attack'
  | 'Normal';

export interface Threat {
  id: string;
  source_ip: string;
  destination_ip: string;
  country: string;
  country_code: string;
  protocol: string;
  port: number;
  attack_type: AttackType;
  packet_size: number;
  packets_per_second: number;
  risk_score: number;
  confidence: number;
  severity: Severity;
  status: ThreatStatus;
  timestamp: string;
}

// ─── AI Prediction ─────────────────────────────────────────
export interface Prediction {
  id: string;
  threat_id: string;
  model_name: string;
  prediction: string;
  confidence: number;
  risk_score: number;
  feature_importance: Record<string, number>;
  shap_values: Record<string, number>;
  explanation: string;
  created_at: string;
}

// ─── Prevention ────────────────────────────────────────────
export interface PreventionAction {
  id: string;
  threat_id: string;
  action: string;
  firewall_enabled: boolean;
  ip_blocked: boolean;
  quarantine: boolean;
  notification_sent: boolean;
  action_status: string;
  timestamp: string;
}

// ─── Incidents ─────────────────────────────────────────────
export type IncidentStatus = 'Open' | 'Investigating' | 'Mitigated' | 'Closed';

export interface Incident {
  id: string;
  threat_id: string;
  analyst_id: string;
  analyst_name: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  evidence: string;
  resolution: string;
  opened_at: string;
  closed_at?: string;
}

// ─── Reports ───────────────────────────────────────────────
export interface Report {
  id: string;
  generated_by: string;
  report_type: 'Daily' | 'Weekly' | 'Monthly' | 'Executive' | 'Threat Summary';
  created_at: string;
  file_path: string;
}

// ─── Notifications ─────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  is_read: boolean;
  created_at: string;
}

// ─── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  activeThreats: number;
  blockedIPs: number;
  riskScore: number;
  systemHealth: 'Healthy' | 'Warning' | 'Critical';
  todayAttacks: number;
  detectionAccuracy: number;
  incidentCount: number;
  packetsAnalyzed: number;
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
}

// ─── Chart Data ────────────────────────────────────────────
export interface TimeSeriesPoint {
  time: string;
  value: number;
  label?: string;
}

export interface AttackDistribution {
  name: string;
  value: number;
  color: string;
}

// ─── Simulation ────────────────────────────────────────────
// SimulationType is identical to AttackType (minus generics like Botnet/Normal)
// One canonical definition — use AttackType everywhere.
export type SimulationType = AttackType;

export interface SimulationState {
  isRunning: boolean;
  attackType: SimulationType | null;
  // Unified lifecycle — all pages must use these phases:
  phase:
    | 'idle'
    | 'preparing'
    | 'launching'
    | 'monitoring'
    | 'detected'
    | 'detecting'
    | 'investigating'
    | 'classified'
    | 'preventing'
    | 'neutralized'
    | 'resolved'
    | 'closed'
    | 'ready';
  progress: number;
  result?: {
    detected: boolean;
    confidence: number;
    riskScore: number;
    action: string;
    timeToDetect: number;
  };
}
