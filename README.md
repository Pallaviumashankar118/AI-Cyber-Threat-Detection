# AegisSOC – AI-Enabled Predictive Cyber Threat Detection & Prevention System

![AegisSOC](https://img.shields.io/badge/AegisSOC-v1.0-12D8FA?style=for-the-badge&logo=shield)
![AI Powered](https://img.shields.io/badge/AI-Powered-2DE37C?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)

## Overview

AegisSOC is a premium AI-powered Security Operations Center (SOC) platform featuring:

- 🛡️ **Real-time Threat Monitoring** — Live network traffic analysis with AI detection
- 🤖 **AI Detection Engine** — Random Forest, SVM, Isolation Forest with SHAP explanations
- ⚡ **Attack Simulator** — DDoS, SQL Injection, Malware, Brute Force, XSS, Ransomware, Port Scan
- 📊 **Interactive Dashboard** — World Threat Map, Risk Gauge, Live Charts, KPI Cards
- 🔒 **Prevention Engine** — Automatic IP blocking, quarantine, firewall rules
- 📋 **Incident Management** — Full lifecycle from detection to resolution
- 📈 **Reports** — PDF/CSV export with daily, weekly, monthly, and executive summaries
- 🎨 **Premium UI** — Glassmorphism, Neon Cyan, Futuristic Cyberpunk design

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

**Demo Credentials:**
- Email: `admin@aegissoc.com`
- Password: `password123`

---

### Backend (Optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API Docs: http://localhost:8000/docs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Custom CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | FastAPI + Python |
| AI/ML | Scikit-learn + SHAP (simulated) |
| Auth | Demo JWT (localStorage) |

---

## Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Animated cyber-grid login |
| Dashboard | `/dashboard` | KPIs, World Map, Charts |
| Threat Monitor | `/threats` | Live threat table + filters |
| Attack Simulator | `/simulator` | Animated attack simulation |
| AI Analytics | `/ai-analytics` | SHAP, confidence, feature importance |
| Incident Center | `/incidents` | Incident management |
| Reports | `/reports` | PDF/CSV report generation |
| Settings | `/settings` | Profile, security, notifications |

---

## Color Palette

| Color | Hex | Use |
|---|---|---|
| Background | `#08111F` | Primary background |
| Cards | `#111C2F` | Card backgrounds |
| Neon Cyan | `#12D8FA` | Primary accent |
| Success Green | `#2DE37C` | Success states |
| Danger Red | `#FF5B6B` | Threats, errors |
| Warning Yellow | `#FFC857` | Medium severity |
| Info Blue | `#4DA6FF` | Information |

---

## Project Structure

```
AegisSOC/
├── frontend/
│   ├── src/
│   │   ├── pages/          ← 8 full pages
│   │   ├── layouts/        ← AppLayout (Sidebar + TopNav)
│   │   ├── components/     ← Reusable UI components
│   │   ├── contexts/       ← AuthContext
│   │   ├── utils/          ← Mock data generators
│   │   └── types/          ← TypeScript interfaces
│   ├── public/
│   └── package.json
├── backend/
│   ├── main.py             ← FastAPI app (all routes)
│   └── requirements.txt
└── README.md
```
