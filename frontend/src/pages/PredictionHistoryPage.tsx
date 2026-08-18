import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { format } from 'date-fns';
import { History, Shield, CheckCircle, Clock } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';

export default function PredictionHistoryPage() {
  const { predictionHistory: predictions } = useSecurity();
  const loading = false;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#FF3366';
      case 'High': return '#FFD500';
      case 'Medium': return '#3377FF';
      default: return '#00FFA3';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-[#00F0FF]" /> Prediction History
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Historical record of AI threat predictions and preventative actions
          </p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-10">
              <span className="text-[#00F0FF]">Loading history...</span>
            </div>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Time</th>
                  <th className="text-left">Threat Type</th>
                  <th className="text-left">Confidence</th>
                  <th className="text-left">Severity</th>
                  <th className="text-left">Action Taken</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p: any) => (
                  <tr key={p.id} className="border-b border-[rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/5 transition-colors">
                    <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(p.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 font-medium text-white">
                        <Shield size={14} style={{ color: getSeverityColor(p.severity) }} />
                        {p.threat_type}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${p.confidence}%`,
                              background: `linear-gradient(90deg, #00F0FF, ${getSeverityColor(p.severity)})`
                            }}
                          />
                        </div>
                        <span className="text-xs text-white">{p.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ 
                          backgroundColor: `${getSeverityColor(p.severity)}20`,
                          color: getSeverityColor(p.severity),
                          border: `1px solid ${getSeverityColor(p.severity)}40`
                        }}
                      >
                        {p.severity}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-300">
                      {p.action_taken || 'None'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" 
                           style={{ color: p.status === 'Success' ? '#00FFA3' : '#FFD500' }}>
                        {p.status === 'Success' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {p.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
