import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();

  const mockHistory = [
    { date: '2025-12-10', condition: 'Diagnosed with Type 2 Diabetes', notes: 'Prescribed Metformin 500mg, recommended dietary changes.' },
    { date: '2026-01-15', condition: 'Started Hypertension Medication', notes: 'BP elevated (150/95). Started Lisinopril 10mg daily.' },
    { date: '2026-03-01', condition: 'Routine Checkup - Stable', notes: 'Glucose levels stabilizing. Heart rate normal.' },
    { date: '2026-03-20', condition: 'Mild Arrhythmia Episode', notes: 'Patient reported palpitations. ECG ordered, results benign.' },
  ];

  return (
    <div style={{ background: '#f4f7fe', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button className="btn outline" onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h2 style={{ color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock color="#3b82f6" /> Patient Medical History
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mockHistory.map((item, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>{item.date}</div>
              <h3 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '10px' }}>{item.condition}</h3>
              <p style={{ color: '#334155', lineHeight: '1.6' }}>{item.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
