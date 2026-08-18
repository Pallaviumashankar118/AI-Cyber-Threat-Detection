"""
AegisSOC Backend – FastAPI Application
AI-Enabled Predictive Cyber Threat Detection & Prevention System
"""

import random
import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import asyncio

# ─── App Instance ──────────────────────────────────────────
app = FastAPI(
    title="AegisSOC API",
    description="AI-Enabled Predictive Cyber Threat Detection & Prevention System",
    version="1.0.0",
)

# ─── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mock Data Generators ──────────────────────────────────
ATTACK_TYPES = ["DDoS", "SQL Injection", "XSS", "Brute Force", "Port Scan", "Malware", "Ransomware", "Botnet"]
SEVERITIES   = ["Low", "Medium", "High", "Critical"]
STATUSES     = ["Detected", "Blocked", "Investigating", "Closed"]
PROTOCOLS    = ["TCP", "UDP", "HTTP", "HTTPS", "ICMP", "DNS"]
COUNTRIES    = [("China", "CN"), ("Russia", "RU"), ("United States", "US"), ("North Korea", "KP"),
                ("Iran", "IR"), ("Brazil", "BR"), ("Germany", "DE"), ("India", "IN")]

def rand_ip():
    prefixes = ["192.168.1.", "45.33.", "104.21.", "198.51.", "203.0.", "10.0.0."]
    return f"{random.choice(prefixes)}{random.randint(1, 254)}"

def make_threat():
    severity = random.choice(SEVERITIES)
    risk = {"Critical": random.randint(80, 99), "High": random.randint(60, 79),
            "Medium": random.randint(35, 59), "Low": random.randint(10, 34)}[severity]
    country = random.choice(COUNTRIES)
    return {
        "id": str(uuid.uuid4()),
        "source_ip": rand_ip(),
        "destination_ip": f"10.0.0.{random.randint(1, 50)}",
        "country": country[0], "country_code": country[1],
        "protocol": random.choice(PROTOCOLS),
        "port": random.choice([80, 443, 22, 3306, 8080, 53, 25, 8443]),
        "attack_type": random.choice(ATTACK_TYPES),
        "packet_size": random.randint(64, 65535),
        "packets_per_second": random.randint(100, 50000),
        "risk_score": risk, "confidence": random.randint(75, 99),
        "severity": severity, "status": random.choice(STATUSES),
        "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(0, 1440))).isoformat(),
    }

def make_prediction(attack_type="DDoS"):
    features = ["Packet Rate", "Connection Duration", "Byte Ratio", "Source Port Entropy",
                "Protocol Type", "Flag Count", "Payload Size"]
    vals = [round(random.uniform(0.05, 0.35), 3) for _ in features]
    total = sum(vals)
    feature_importance = {f: round(v / total, 3) for f, v in zip(features, vals)}
    shap_values = {f: round(random.uniform(-0.1, 0.4), 3) for f in features}
    return {
        "id": str(uuid.uuid4()),
        "threat_id": str(uuid.uuid4()),
        "model_name": "Random Forest v2.1",
        "prediction": attack_type,
        "confidence": round(random.uniform(88, 99.5), 2),
        "risk_score": random.randint(72, 98),
        "feature_importance": feature_importance,
        "shap_values": shap_values,
        "explanation": f"AI detected {attack_type} with high confidence. Primary indicators: abnormal packet rate, repeated SYN patterns, and entropy signature matching known {attack_type} botnet.",
        "created_at": datetime.utcnow().isoformat(),
    }

def make_incident():
    titles = {
        "DDoS": "Distributed Denial of Service Attack Detected",
        "SQL Injection": "SQL Injection Attempt on Database Server",
        "XSS": "Cross-Site Scripting Attack Identified",
        "Brute Force": "Brute Force Login Attack in Progress",
        "Port Scan": "Suspicious Port Scanning Activity",
        "Malware": "Malware Execution Detected on Endpoint",
        "Ransomware": "Ransomware Encryption Activity Detected",
        "Botnet": "Botnet C2 Communication Detected",
    }
    analysts = ["Alex Chen", "Sarah Mitchell", "James Rivera", "Priya Patel"]
    statuses = ["Open", "Investigating", "Mitigated", "Closed"]
    attack = random.choice(ATTACK_TYPES)
    status = random.choice(statuses)
    opened = datetime.utcnow() - timedelta(minutes=random.randint(10, 4320))
    return {
        "id": f"INC-{random.randint(1000, 9999)}",
        "threat_id": str(uuid.uuid4()),
        "analyst_id": str(uuid.uuid4()),
        "analyst_name": random.choice(analysts),
        "title": titles.get(attack, "Security Incident Detected"),
        "description": f"Automated AI detection identified suspicious {attack} activity. Immediate investigation required.",
        "severity": random.choice(SEVERITIES),
        "status": status,
        "evidence": "Packet capture logs, network flow data, and system events collected.",
        "resolution": "Threat neutralized. IP blocked." if status in ("Closed", "Mitigated") else "",
        "opened_at": opened.isoformat(),
        "closed_at": (opened + timedelta(hours=random.randint(1, 24))).isoformat() if status == "Closed" else None,
    }

# ─── In-memory Store ───────────────────────────────────────
threats_db   = [make_threat() for _ in range(50)]
incidents_db = [make_incident() for _ in range(20)]
notifications_db = [
    {"id": str(uuid.uuid4()), "title": "Critical DDoS Detected", "message": "Risk score 97 — IP 45.33.102.14",
     "severity": "Critical", "is_read": False, "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "title": "Brute Force Blocked", "message": "IP locked after 500 attempts",
     "severity": "Medium", "is_read": False, "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "title": "AI Model Updated", "message": "Accuracy 98.2% — 2,400 new samples",
     "severity": "Low", "is_read": True, "created_at": datetime.utcnow().isoformat()},
]

prediction_history_db = [
    {
        "id": str(uuid.uuid4()),
        "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(10, 1000))).isoformat(),
        "threat_type": "Malware",
        "confidence": 96,
        "severity": "Critical",
        "action_taken": "Quarantined",
        "status": "Success",
        "username": "admin",
        "simulation_id": str(uuid.uuid4())
    },
    {
        "id": str(uuid.uuid4()),
        "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(10, 1000))).isoformat(),
        "threat_type": "DDoS",
        "confidence": 89,
        "severity": "High",
        "action_taken": "Blocked IP",
        "status": "Success",
        "username": "admin",
        "simulation_id": str(uuid.uuid4())
    },
    {
        "id": str(uuid.uuid4()),
        "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(10, 1000))).isoformat(),
        "threat_type": "Phishing",
        "confidence": 73,
        "severity": "Medium",
        "action_taken": "Alert Sent",
        "status": "Pending",
        "username": "admin",
        "simulation_id": str(uuid.uuid4())
    }
]

# ─── WebSocket Manager ─────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()

# ─── Schemas ───────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class SimulateRequest(BaseModel):
    attack: str

class PredictRequest(BaseModel):
    source_ip: str = "192.168.1.1"
    protocol: str = "TCP"
    packet_size: int = 1024

class PreventRequest(BaseModel):
    threatId: str

class ReportRequest(BaseModel):
    type: str

# ─── Auth ──────────────────────────────────────────────────
DEMO_USERS = {
    "admin@aegissoc.com": {"name": "Admin User", "role": "Admin", "id": "1"},
    "analyst@aegissoc.com": {"name": "Alex Chen", "role": "Analyst", "id": "2"},
    "manager@aegissoc.com": {"name": "Sarah Mitchell", "role": "Manager", "id": "3"},
}

@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    user = DEMO_USERS.get(req.email.lower())
    if not user or len(req.password) < 6:
        # Allow any email/password for demo
        if len(req.password) < 6:
            raise HTTPException(status_code=401, detail="Password too short")
        user = {"name": req.email.split("@")[0], "role": "Analyst", "id": "99"}
    return {
        "token": f"demo_jwt_{uuid.uuid4()}",
        "user": user["name"],
        "role": user["role"],
        "user_id": user["id"],
    }

@app.post("/api/v1/auth/logout")
async def logout():
    return {"message": "Logged out"}

@app.post("/api/v1/auth/forgot-password")
async def forgot_password(data: dict):
    return {"message": "Password reset link sent"}

# ─── Dashboard ─────────────────────────────────────────────
@app.get("/api/v1/dashboard")
async def dashboard():
    critical = sum(1 for t in threats_db if t["severity"] == "Critical")
    return {
        "activeThreats": critical,
        "blockedIPs": sum(1 for t in threats_db if t["status"] == "Blocked"),
        "riskScore": random.randint(62, 88),
        "systemHealth": "Healthy",
        "todayAttacks": len(threats_db),
        "detectionAccuracy": round(random.uniform(94.5, 99.2), 1),
        "incidentCount": len(incidents_db),
        "packetsAnalyzed": random.randint(4000000, 9000000),
        "cpuUsage": round(random.uniform(22, 68), 1),
        "memoryUsage": round(random.uniform(38, 72), 1),
        "networkThroughput": round(random.uniform(124, 890), 1),
    }

@app.get("/api/v1/dashboard/live")
async def dashboard_live():
    return {
        "cpu": round(random.uniform(20, 70), 1),
        "memory": round(random.uniform(35, 75), 1),
        "network": round(random.uniform(100, 900), 1),
        "threatCount": random.randint(5, 30),
        "timestamp": datetime.utcnow().isoformat(),
    }

# ─── Threats ───────────────────────────────────────────────
@app.get("/api/v1/threats")
async def get_threats(
    severity: Optional[str] = None,
    attack_type: Optional[str] = None,
    protocol: Optional[str] = None,
    skip: int = 0, limit: int = 50
):
    result = threats_db
    if severity: result = [t for t in result if t["severity"] == severity]
    if attack_type: result = [t for t in result if t["attack_type"] == attack_type]
    if protocol: result = [t for t in result if t["protocol"] == protocol]
    return {"data": result[skip:skip+limit], "total": len(result)}

@app.get("/api/v1/threats/{threat_id}")
async def get_threat(threat_id: str):
    t = next((x for x in threats_db if x["id"] == threat_id), None)
    if not t: raise HTTPException(404, "Threat not found")
    return t

@app.delete("/api/v1/threats/{threat_id}")
async def delete_threat(threat_id: str):
    global threats_db
    threats_db = [t for t in threats_db if t["id"] != threat_id]
    return {"message": "Deleted"}

# ─── Simulator ─────────────────────────────────────────────
sim_history = []
simulation_active = False

@app.post("/api/v1/simulator/start")
async def start_simulation(req: SimulateRequest):
    global simulation_active
    simulation_active = True
    
    if req.attack not in ATTACK_TYPES:
        raise HTTPException(400, f"Invalid attack type. Valid: {ATTACK_TYPES}")
    
    # Create a new threat from this simulation
    new_threat = make_threat()
    new_threat["attack_type"] = req.attack
    new_threat["severity"] = "Critical" if req.attack in ["DDoS", "Ransomware"] else "High"
    new_threat["risk_score"] = random.randint(85, 99)
    new_threat["status"] = "Detected"
    threats_db.insert(0, new_threat)

    entry = {
        "id": str(uuid.uuid4()),
        "simulation_name": f"{req.attack} Simulation",
        "attack_type": req.attack,
        "duration": random.randint(5, 15),
        "packets_generated": random.randint(10000, 500000),
        "result": "Detected & Blocked",
        "created_at": datetime.utcnow().isoformat(),
        "threat_id": new_threat["id"],
    }
    sim_history.insert(0, entry)
    await manager.broadcast({"event": "simulationStarted", "data": entry})
    return {"status": "Simulation Started", "simulation_id": entry["id"], "threat_id": new_threat["id"]}

@app.post("/api/v1/simulator/stop")
async def stop_simulation():
    global simulation_active
    simulation_active = False
    await manager.broadcast({"event": "simulationStopped"})
    return {"status": "Simulation Stopped"}

@app.get("/api/v1/simulator/history")
async def get_sim_history():
    return {"data": sim_history}

# ─── AI Prediction ─────────────────────────────────────────
@app.post("/api/v1/predict")
async def predict(req: PredictRequest):
    # Simulate ML inference
    attack = random.choice(ATTACK_TYPES)
    confidence = round(random.uniform(82, 99.5), 2)
    risk = random.randint(65, 99)
    return {
        "prediction": attack,
        "confidence": confidence,
        "risk": risk,
        "model": "Random Forest v2.1",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/v1/prediction/explanation/{threat_id}")
async def explain_prediction(threat_id: str):
    pred = make_prediction()
    pred["reasons"] = [
        "High outbound traffic anomaly",
        "Abnormal process execution patterns",
        "Suspicious registry activity detected",
        "Unknown executable signature",
        "Multiple failed authentications"
    ]
    return pred

@app.get("/api/v1/predictions")
async def get_predictions():
    return {"data": prediction_history_db}

# ─── Prevention ────────────────────────────────────────────
@app.post("/api/v1/prevention/block")
async def block_threat(req: PreventRequest):
    for t in threats_db:
        if t["id"] == req.threatId:
            t["status"] = "Blocked"
            break
    await manager.broadcast({"event": "threatBlocked", "threatId": req.threatId})
    return {"status": "Blocked", "firewall": True, "ip_blocked": True}

@app.post("/api/v1/prevention/block-ip")
async def block_ip(req: PreventRequest):
    return {"status": "Blocked IP", "firewall": True, "ip_blocked": True}

@app.post("/api/v1/prevention/quarantine")
async def quarantine(req: PreventRequest):
    return {"status": "Quarantined", "device": "isolated"}

@app.post("/api/v1/prevention/isolate")
async def isolate(req: PreventRequest):
    return {"status": "Isolated", "device": "isolated"}

@app.post("/api/v1/prevention/send-alert")
async def send_alert(req: PreventRequest):
    return {"status": "Alert Sent", "notified": True}

@app.post("/api/v1/prevention/firewall")
async def firewall(req: dict):
    return {"status": "Firewall rule enabled", "rule_id": str(uuid.uuid4())}

# ─── Incidents ─────────────────────────────────────────────
@app.get("/api/v1/incidents")
async def get_incidents(status: Optional[str] = None, severity: Optional[str] = None):
    result = incidents_db
    if status: result = [i for i in result if i["status"] == status]
    if severity: result = [i for i in result if i["severity"] == severity]
    return {"data": result, "total": len(result)}

@app.post("/api/v1/incidents")
async def create_incident(data: dict):
    inc = make_incident()
    inc.update(data)
    incidents_db.insert(0, inc)
    await manager.broadcast({"event": "newIncident", "data": inc})
    return inc

@app.get("/api/v1/incidents/{inc_id}")
async def get_incident(inc_id: str):
    inc = next((i for i in incidents_db if i["id"] == inc_id), None)
    if not inc: raise HTTPException(404, "Incident not found")
    return inc

@app.put("/api/v1/incidents/{inc_id}")
async def update_incident(inc_id: str, data: dict):
    for inc in incidents_db:
        if inc["id"] == inc_id:
            inc.update(data)
            return inc
    raise HTTPException(404, "Incident not found")

@app.put("/api/v1/incidents/{inc_id}/close")
async def close_incident(inc_id: str):
    for inc in incidents_db:
        if inc["id"] == inc_id:
            inc["status"] = "Closed"
            inc["closed_at"] = datetime.utcnow().isoformat()
            return inc
    raise HTTPException(404, "Incident not found")

# ─── Reports ───────────────────────────────────────────────
reports_store = []

@app.post("/api/v1/reports/generate")
async def generate_report(req: ReportRequest):
    report = {
        "id": str(uuid.uuid4()),
        "report_type": req.type,
        "generated_by": "admin",
        "file_path": f"/reports/{req.type.lower().replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf",
        "created_at": datetime.utcnow().isoformat(),
        "size_mb": round(random.uniform(0.5, 3.5), 1),
    }
    reports_store.insert(0, report)
    return report

@app.post("/api/v1/report/pdf")
async def generate_report_pdf(req: ReportRequest):
    return {"status": "PDF Generated", "download_url": "/mock/pdf"}

@app.post("/api/v1/report/excel")
async def generate_report_excel(req: ReportRequest):
    return {"status": "Excel Generated", "download_url": "/mock/excel"}

@app.get("/api/v1/reports")
async def get_reports():
    return {"data": reports_store}

@app.get("/api/v1/reports/download/{report_id}")
async def download_report(report_id: str):
    return {"message": "Download initiated", "report_id": report_id}

# ─── Notifications ─────────────────────────────────────────
@app.get("/api/v1/notifications")
async def get_notifications():
    return {"data": notifications_db, "unread": sum(1 for n in notifications_db if not n["is_read"])}

@app.post("/api/v1/notifications")
async def create_notification(req: dict):
    new_notif = {
        "id": str(uuid.uuid4()),
        "title": req.get("title", "Alert"),
        "message": req.get("message", ""),
        "severity": req.get("severity", "Info"),
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    notifications_db.insert(0, new_notif)
    return new_notif

@app.put("/api/v1/notifications/read/{notif_id}")
async def mark_read(notif_id: str):
    for n in notifications_db:
        if n["id"] == notif_id:
            n["is_read"] = True
            return n
    raise HTTPException(404, "Notification not found")

@app.put("/api/v1/notifications/clear-all")
async def clear_all_notifs():
    global notifications_db
    notifications_db = []
    return {"status": "Cleared"}

# ─── Settings ──────────────────────────────────────────────
settings_store = {
    "autoBlock": True, "autoIncident": True, "aiExplainability": True,
    "realTimeMonitor": True, "dataRetention": 90, "updateInterval": 5,
    "notifications": {"criticalThreats": True, "newIncidents": True, "weeklyReports": True},
}

@app.get("/api/v1/settings")
async def get_settings():
    return settings_store

@app.put("/api/v1/settings")
async def update_settings(data: dict):
    settings_store.update(data)
    return settings_store

# ─── Health ────────────────────────────────────────────────
@app.get("/api/v1/health")
async def health():
    return {
        "status": "Healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "Online",
            "ml_engine": "Online",
            "prevention_engine": "Online",
            "websocket": "Online",
        }
    }

# ─── WebSocket ─────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            # Send live updates every 3 seconds
            await asyncio.sleep(3)
            
            if simulation_active:
                new_threat = make_threat()
                threats_db.insert(0, new_threat)
                if len(threats_db) > 200:
                    threats_db.pop()

                await manager.broadcast({
                    "event": "newThreat",
                    "data": new_threat,
                })
            
            await manager.broadcast({
                "event": "dashboardUpdate",
                "data": {
                    "activeThreats": random.randint(5, 25),
                    "riskScore": random.randint(60, 90),
                    "cpuUsage": round(random.uniform(20, 70), 1),
                }
            })
    except WebSocketDisconnect:
        manager.disconnect(ws)

# ─── Root ──────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "AegisSOC API v1.0", "docs": "/docs", "health": "/api/v1/health"}
