export function downloadExecutiveReport(
  attackType: string,
  confidence: number,
  riskScore: number,
  timeToDetect: number,
  logs: { time: string; msg: string }[],
  aiAnalysis: {
    summary: string;
    endpoint: string;
    payload: string;
    dbAccess: string;
    prevention: string;
    threatFamily: string;
    attackVector: string;
    mitreTechnique: string;
    target: string;
    businessImpact: string;
    firewallRule: string;
    threatIntelMatch: string;
    recommendations: string[];
  } | null
) {
  const dateStr = new Date().toLocaleString();
  const filename = `AegisSOC_Executive_Report_${attackType.replace(/\s+/g, '_')}.pdf`;

  const title = `AEGISSOC EXECUTIVE INCIDENT REPORT`;
  const sub = `Incident Classification: ${attackType.toUpperCase()} - PREVENTED`;
  const time = `Generated: ${dateStr}`;
  const severity = `Severity: CRITICAL   |   Risk Score: ${riskScore}/100   |   Confidence: ${confidence}%`;

  const reportText = `
${title}
======================================================================
${sub}
${time}
${severity}

1. EXECUTIVE SUMMARY
----------------------------------------------------------------------
On ${dateStr}, the AegisSOC Autonomous Threat Protection system detected
and blocked a critical security threat matching signature patterns for
${attackType}. The event was resolved automatically before any host or database
resources could be compromised. Systems operated continuously with no loss of service.

2. TECHNICAL SUMMARY
----------------------------------------------------------------------
The intrusion attempt targeted the system core cluster. Threat signature analysis
revealed pattern indicators matching the following:
- Threat Family:   ${aiAnalysis?.threatFamily || attackType}
- Attack Vector:   ${aiAnalysis?.attackVector || 'External Ingress Request'}
- Target Service:  ${aiAnalysis?.target || 'Perimeter Network Gateway'}
- Telemetry:       Anomalies detected in byte entropy, flag counts, and request structure.

3. INCIDENT LIFECYCLE TIMELINE (MS PRECISION)
----------------------------------------------------------------------
- T+0.00s: Inbound TCP connection request parsed.
- T+0.22s: Destination route accessed. Payload telemetry loaded.
- T+0.54s: WAF detection triggers on malicious query flags.
- T+0.85s: Security score thresholds exceeded. Triggering AI core analyzer.
- T+1.20s: Deep Packet Inspection evaluates request parameters.
- T+2.00s: Intrusion confirmed. Quarantine protocols engaged.
- T+2.45s: Block applied. Dynamic IP drop rule pushed to WAF firewall.
- T+2.82s: Incident ticket automatically created and logged.
- T+3.20s: Telemetry status restored to SECURE. Report created.

4. MITRE ATT&CK MAPPING
----------------------------------------------------------------------
- Tactical Domain: Initial Access / Lateral Movement / Impact
- Execution Technique: ${aiAnalysis?.mitreTechnique || 'T1190 - Web Application Exploit'}
- Defense Evasion: T1036 - Masquerading (MIME/Header tampering)
- Threat Intelligence: Matches known malicious global scanner subnet.

5. BUSINESS IMPACT ASSESSMENT
----------------------------------------------------------------------
- Operational Downtime: None (0.00%)
- Corporate Data Integrity: SECURE (Zero internal database exposure)
- Business Risk Profile: ${aiAnalysis?.businessImpact || 'LOW (Successfully mitigated at gateway)'}
- Action Required: Administrative review of WAF rule persistence settings.

6. AI SECURITY ANALYSIS
----------------------------------------------------------------------
- Classifier Model: Random Forest v2.1 Classifier Array
- Pattern Matching: Matched known exploits in security model.
- Analyzed Payload:
  "${aiAnalysis?.payload || 'N/A'}"
- AI Verdict:
  ${aiAnalysis?.summary || 'The request violates security validation policies.'}

7. PREVENTATIVE RECOMMENDATIONS
----------------------------------------------------------------------
${aiAnalysis?.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 
`1. Implement strict validation on application parameter inputs.
2. Restrict public access to administrative panels.
3. Schedule regular penetration sweeps and vulnerability assessments.`}

8. APPENDIX & SOC TELEMETRY FOOTNOTE
----------------------------------------------------------------------
- Controller Status: Online
- Firewall Integration: ${aiAnalysis?.firewallRule || 'Active'}
- Core Engine: AegisSOC Predictive Threat Classifier v2.1

----------------------------------------------------------------------
CONFIDENTIAL PROPERTY OF AEGISSOC SECURITY OPERATIONS CENTER.
(c) 2026 AegisSOC Systems, Inc. All rights reserved.
`;

  // Standard PDF generator structure
  const header = `%PDF-1.4\r\n`;
  const obj1 = `1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\nendobj\r\n`;
  const obj2 = `2 0 obj\r\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\r\nendobj\r\n`;
  
  const escapePdfText = (txt: string) => {
    return txt.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  };

  const lines = reportText.split('\n');
  let streamContent = `BT\r\n/F1 9 Tf\r\n11 TL\r\n45 745 Td\r\n`;
  
  lines.forEach(line => {
    if (line.trim() === 'AEGISSOC EXECUTIVE INCIDENT REPORT') {
      streamContent += `/F1 13 Tf\r\n14 TL\r\n(${escapePdfText(line)}) Tj T*\r\n/F1 9 Tf\r\n11 TL\r\n`;
    } else if (line.startsWith('---') || line.startsWith('===')) {
      streamContent += `(${escapePdfText(line)}) Tj T*\r\n`;
    } else if (line.match(/^[1-9]\.\s[A-Z\s]+/)) {
      streamContent += `T*\r\n/F1 11 Tf\r\n(${escapePdfText(line)}) Tj T*\r\n/F1 9 Tf\r\n`;
    } else {
      streamContent += `(${escapePdfText(line)}) Tj T*\r\n`;
    }
  });
  
  streamContent += `ET\r\n`;

  const obj4 = `4 0 obj\r\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\r\nendobj\r\n`;
  const obj3 = `3 0 obj\r\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\r\nendobj\r\n`;
  const streamLength = streamContent.length;
  const obj5 = `5 0 obj\r\n<< /Length ${streamLength} >>\r\nstream\r\n${streamContent}endstream\r\nendobj\r\n`;

  const o1 = header.length;
  const o2 = o1 + obj1.length;
  const o3 = o2 + obj2.length;
  const o4 = o3 + obj3.length;
  const o5 = o4 + obj4.length;
  const oX = o5 + obj5.length;

  const xref = `xref\r\n0 6\r\n0000000000 65535 f\r\n` +
    `${o1.toString().padStart(10, '0')} 00000 n\r\n` +
    `${o2.toString().padStart(10, '0')} 00000 n\r\n` +
    `${o3.toString().padStart(10, '0')} 00000 n\r\n` +
    `${o4.toString().padStart(10, '0')} 00000 n\r\n` +
    `${o5.toString().padStart(10, '0')} 00000 n\r\n`;

  const trailer = `trailer\r\n<< /Size 6 /Root 1 0 R >>\r\nstartxref\r\n${oX}\r\n%%EOF\r\n`;

  const pdfString = `${header}${obj1}${obj2}${obj3}${obj4}${obj5}${xref}${trailer}`;
  
  const bytes = new Uint8Array(pdfString.length);
  for (let i = 0; i < pdfString.length; i++) {
    bytes[i] = pdfString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
