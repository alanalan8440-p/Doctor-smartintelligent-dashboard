import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Heart, 
  Droplet, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  LogOut, 
  Phone, 
  User,
  MessageSquare,
  ShieldCheck,
  FileUp,
  File
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function PatientPage() {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState({
    bpSystolic: 120, bpDiastolic: 80, sugar: 90, heartRate: 72, oxygen: 98,
    riskLevel: 'Normal', updatedAt: new Date().toISOString()
  });
  const [history, setHistory] = useState([]);
  const [medications, setMedications] = useState([
    { id: 1, name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', taken: true },
    { id: 2, name: 'Metformin', dosage: '500mg', time: '01:00 PM', taken: false },
    { id: 3, name: 'Aspirin', dosage: '81mg', time: '08:00 PM', taken: false },
  ]);
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Blood_Test_Results.pdf', date: 'Oct 15, 2023' }
  ]);

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setDocuments(prev => [...prev, { id: Date.now(), name: file.name, date: new Date().toLocaleDateString() }]);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('vitals', (data) => {
      setVitals(data);
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString().slice(0, 5), hr: data.heartRate }].slice(-10));
    });
    return () => socket.disconnect();
  }, []);

  const toggleMed = (id) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="patient-dashboard">
      <nav className="patient-nav">
        <div className="logo-section">
          <ShieldCheck size={28} color="#3b82f6" />
          <span>PatientCare AI</span>
        </div>
        <div className="nav-actions" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <button className="btn outline" onClick={() => navigate('/dashboard')} style={{padding: '8px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', background: 'white', color: '#3b82f6', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 600}}>
            Go to Dashboard
          </button>
          <button className="icon-btn" onClick={() => navigate('/login')} title="Logout"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="patient-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="welcome-text">
            <h1>Good Morning, John! 👋</h1>
            <p>Your health is looking great today. You've completed 1/3 of your daily goals.</p>
          </div>
          <div className="health-badge">
            <ShieldCheck size={24} color="#10b981" />
            <span>Health Secured</span>
          </div>
        </section>

        <div className="patient-grid">
          {/* Live Vitals */}
          <section className="vitals-column">
            <h2 className="section-title">Live Health Status</h2>
            <div className="vitals-cards">
              <div className="p-card vital">
                <div className="card-icon heart"><Heart size={20} /></div>
                <div className="card-data">
                  <span className="label">Heart Rate</span>
                  <span className="value">{vitals.heartRate} <small>bpm</small></span>
                </div>
              </div>
              <div className="p-card vital">
                <div className="card-icon blood"><Activity size={20} /></div>
                <div className="card-data">
                  <span className="label">Blood Pressure</span>
                  <span className="value">{vitals.bpSystolic}/{vitals.bpDiastolic} <small>mmHg</small></span>
                </div>
              </div>
              <div className="p-card vital">
                <div className="card-icon sugar"><Droplet size={20} /></div>
                <div className="card-data">
                  <span className="label">Glucose</span>
                  <span className="value">{vitals.sugar} <small>mg/dL</small></span>
                </div>
              </div>
            </div>

            <div className="p-card mini-graph">
              <h3>Heart Rate Trend</h3>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Daily Routine */}
          <section className="routine-column">
            <h2 className="section-title">Daily Medications</h2>
            <div className="meds-list">
              {medications.map(med => (
                <div key={med.id} className={`p-card med-item ${med.taken ? 'done' : ''}`} onClick={() => toggleMed(med.id)}>
                  <div className="med-info">
                    <Clock size={18} className="med-clock" />
                    <div>
                      <strong>{med.name}</strong>
                      <p>{med.dosage} &middot; {med.time}</p>
                    </div>
                  </div>
                  {med.taken ? <CheckCircle size={22} color="#10b981" /> : <div className="circle-check"></div>}
                </div>
              ))}
            </div>

            <div className="p-card appointment-card">
              <div className="apt-header">
                <Calendar size={20} color="#3b82f6" />
                <span>Next Appointment</span>
              </div>
              <div className="apt-body">
                <h3>Dr. Sarah Jenkins</h3>
                <p>Cardiologist &middot; Tomorrow, 10:30 AM</p>
              </div>
              <button className="btn-primary">View Instructions</button>
            </div>
          </section>

          {/* AI Helper & Support */}
          <section className="support-column">
            <h2 className="section-title">AI Health Assistant</h2>
            <div className="p-card ai-assistant">
              <div className="ai-chat">
                <div className="bot-msg">
                  "I've noticed your sugar levels are slightly lower than yesterday. Try having a fruit snack soon."
                </div>
              </div>
              <div className="chat-input-area">
                <input type="text" placeholder="Ask me about your symptoms..." />
                <button><MessageSquare size={18} /></button>
              </div>
            </div>

            <div className="p-card documents-card">
              <h3>Lab Reports & Documents</h3>
              <div className="docs-list" style={{margin: '15px 0'}}>
                {documents.map(doc => (
                  <div key={doc.id} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0'}}>
                    <File size={18} color="#3b82f6" />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '13px', fontWeight: 600}}>{doc.name}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{doc.date}</div>
                    </div>
                  </div>
                ))}
              </div>
              <label className="doc-upload-box" style={{display: 'block'}}>
                <input type="file" style={{display:'none'}} onChange={handleFileUpload} />
                <FileUp size={24} style={{marginBottom: '10px', display: 'block', margin: '0 auto'}} />
                <span style={{fontSize: '13px', fontWeight: 500}}>Click to Upload Result</span>
              </label>
            </div>

            <div className="emergency-card">
              <div className="sos-icon"><AlertCircle size={32} /></div>
              <h3>Emergency SOS</h3>
              <p>Immediately notify your doctor and family.</p>
              <button className="sos-btn">ACTIVATE SOS</button>
            </div>

            <div className="p-card doctor-contact">
              <h3>Your Doctor</h3>
              <div className="doc-item">
                <div className="doc-avatar">SJ</div>
                <div className="doc-detail">
                  <strong>Dr. Sarah Jenkins</strong>
                  <p>In Clinic</p>
                </div>
                <button className="call-btn"><Phone size={16} /></button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .patient-dashboard {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
        }

        .patient-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.2rem;
          color: #3b82f6;
        }

        .patient-main {
          padding: 2rem 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .welcome-text h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .welcome-text p {
          color: #64748b;
        }

        .health-badge {
          background: #dcfce7;
          color: #166534;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .patient-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .patient-grid {
            grid-template-columns: 1fr;
          }
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #475569;
        }

        .p-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
          margin-bottom: 1.5rem;
          transition: transform 0.2s;
        }

        .p-card:hover {
          transform: translateY(-5px);
        }

        .vitals-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .p-card.vital {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon.heart { background: #fef2f2; color: #ef4444; }
        .card-icon.blood { background: #eff6ff; color: #3b82f6; }
        .card-icon.sugar { background: #fff7ed; color: #f97316; }

        .card-data {
          display: flex;
          flex-direction: column;
        }

        .card-data .label {
          font-size: 0.9rem;
          color: #64748b;
        }

        .card-data .value {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .meds-list {
          display: flex;
          flex-direction: column;
        }

        .med-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .med-item.done {
          background: #f8fafc;
          border-color: #e2e8f0;
          opacity: 0.7;
        }

        .med-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .med-clock { color: #3b82f6; }

        .circle-check {
          width: 22px;
          height: 22px;
          border: 2px solid #e2e8f0;
          border-radius: 50%;
        }

        .appointment-card {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }

        .apt-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .apt-header span { font-weight: 500; font-size: 0.9rem; }

        .btn-primary {
          width: 100%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          margin-top: 1rem;
          cursor: pointer;
        }

        .ai-assistant {
          background: #1e293b;
          color: white;
        }

        .bot-msg {
          background: #334155;
          padding: 1rem;
          border-radius: 15px 15px 15px 0;
          line-height: 1.5;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        .chat-input-area {
          display: flex;
          gap: 10px;
        }

        .chat-input-area input {
          flex: 1;
          background: #0f172a;
          border: 1px solid #334155;
          padding: 0.75rem;
          border-radius: 10px;
          color: white;
          outline: none;
        }

        .chat-input-area button {
          background: #3b82f6;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          color: white;
          cursor: pointer;
        }

        .emergency-card {
          background: #ef4444;
          color: white;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .sos-btn {
          width: 100%;
          background: white;
          color: #ef4444;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 800;
          margin-top: 1rem;
          cursor: pointer;
          letter-spacing: 1px;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .doc-avatar {
          width: 40px;
          height: 40px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
        }

        .call-btn {
          margin-left: auto;
          background: #f1f5f9;
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          color: #3b82f6;
          cursor: pointer;
        }

        .icon-btn {
          background: #f1f5f9;
          border: none;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
