import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Phone, AlertTriangle, Syringe, Clock, Activity, Heart, Droplet, CheckCircle, XCircle, LogOut, User, Printer, BrainCircuit, Users, PieChart as PieIcon, Moon, Sun, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard() {
  const navigate = useNavigate();
  const loggedDoctor = localStorage.getItem('loggedDoctor') || 'Dr. House';

  const [vitals, setVitals] = useState({
    bpSystolic: 120, bpDiastolic: 80, sugar: 90, heartRate: 72, oxygen: 98,
    riskLevel: 'Normal', status: 'Connecting...', updatedAt: new Date().toISOString()
  });
  
  const [alerts, setAlerts] = useState([]);
  const [medication, setMedication] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const prevVitalsRef = useRef(null);
  const [notes, setNotes] = useState([
    { id: 1, author: 'Dr. House', text: 'Started observation. Patient stable.', time: '09:00 AM' }
  ]);
  const [newNote, setNewNote] = useState('');

  const [surgeryRisk, setSurgeryRisk] = useState(null);
  const [selectedVitals, setSelectedVitals] = useState(['bp']);
  
  const toggleVital = (id) => {
    setSelectedVitals(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(v => v !== id) : prev) 
        : [...prev, id]
    );
  };

  const getVitalConfig = (id) => {
    switch(id) {
      case 'bp':
        return { name: 'Blood Pressure', dataKey: 'bp', stroke: '#3b82f6', fill: '#3b82f6', risk: vitals.bpSystolic > 140 ? 'High Risk' : 'Normal', color: vitals.bpSystolic > 140 ? '#ef4444' : '#10b981', unit: 'mmHg' };
      case 'sugar':
        return { name: 'Blood Sugar', dataKey: 'sugar', stroke: '#f97316', fill: '#f97316', risk: vitals.sugar > 140 ? 'Risk' : 'Normal', color: vitals.sugar > 140 ? '#ef4444' : '#10b981', unit: 'mg/dL' };
      case 'hr':
        return { name: 'Heart Rate', dataKey: 'hr', stroke: '#ec4899', fill: '#ec4899', risk: vitals.heartRate > 100 ? 'High Risk' : 'Normal', color: vitals.heartRate > 100 ? '#ef4444' : '#10b981', unit: 'bpm' };
      case 'oxygen':
        return { name: 'Oxygen Level', dataKey: 'oxygen', stroke: '#06b6d4', fill: '#06b6d4', risk: vitals.oxygen < 95 ? 'Risk' : 'Normal', color: vitals.oxygen < 95 ? '#ef4444' : '#10b981', unit: '%' };
      default: return {};
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [surgeryType, setSurgeryType] = useState('Cataract Surgery');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Health Assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Dark Mode
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  // Prescription State
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescMeds, setPrescMeds] = useState([{ name: '', dosage: '', frequency: '' }]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setIsConnected(true);
      setVitals(prev => ({ ...prev, status: 'Live Connected ✅' }));
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setVitals(prev => ({ ...prev, status: 'Disconnected ❌', riskLevel: 'Unknown' }));
    });

    socket.on('vitals', (data) => {
      if(prevVitalsRef.current) {
        if(Math.abs(data.bpSystolic - prevVitalsRef.current.bpSystolic) >= 15) {
           setAlerts(prev => [{id: Date.now(), msg: `ANOMALY: BP sudden jump from ${prevVitalsRef.current.bpSystolic} to ${data.bpSystolic}`, type: 'CRITICAL'}, ...prev].slice(0, 5));
        }
      }
      prevVitalsRef.current = data;

      setVitals(data);
      setGraphData(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString().substring(0, 5), 
          bp: data.bpSystolic, 
          sugar: data.sugar,
          hr: data.heartRate,
          oxygen: data.oxygen
        }];
        return newData.slice(-15);
      });
    });

    socket.on('alert', (alert) => {
      setAlerts(prev => [{ id: Date.now(), ...alert }, ...prev].slice(0, 5));
      if (Notification.permission === 'granted') {
        new Notification('Health Alert: ' + alert.type, { body: alert.msg, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') new Notification('Health Alert: ' + alert.type, { body: alert.msg });
        });
      }
    });

    socket.on('medication', setMedication);
    socket.on('timeline', (srvTimeline) => setTimeline(srvTimeline));

    return () => socket.disconnect();
  }, []);

  const handleSurgeryAnalyze = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setSurgeryRisk(null);
    try {
      const res = await fetch(`${SOCKET_URL}/api/surgery-analyzer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: 65, bp: vitals.bpSystolic, sugar: vitals.sugar, disease: surgeryType, history: []
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setSurgeryRisk(data);
        setIsAnalyzing(false);
      }, 500);
    } catch(err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const confirmSchedule = () => {
    if(!scheduleDate) return alert("Please select a date.");
    const newEvent = {
        id: Date.now(),
        date: scheduleDate,
        event: `${surgeryType} scheduled by ${loggedDoctor}`
    };
    setTimeline([newEvent, ...timeline]);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedDoctor');
    navigate('/login');
  };

  const addNote = () => {
    if(!newNote.trim()) return;
    setNotes(prev => [{ id: Date.now(), author: loggedDoctor, text: newNote, time: new Date().toLocaleTimeString().substring(0, 5) }, ...prev]);
    setNewNote('');
  };

  // Health Score Calculation Breakdown
  const bpComponent = Math.abs(vitals.bpSystolic - 120) * 0.4;
  const sugarComponent = Math.abs(vitals.sugar - 100) * 0.3;
  const hrComponent = Math.abs(vitals.heartRate - 75) * 0.3;
  
  const healthScore = Math.max(0, Math.floor(100 - bpComponent - sugarComponent - hrComponent));
  const healthStatus = healthScore > 80 ? 'Good' : healthScore > 50 ? 'Moderate Risk' : 'Critical';

  // CDSS Logic
  const getSuggestions = () => {
    let suggestions = [];
    if(vitals.bpSystolic > 160) suggestions.push('Hypertension Stage 2 detected. Recommend ECG and immediate BP-lowering protocols.');
    if(vitals.sugar > 180) suggestions.push('Hyperglycemia. Recommend checking hemoglobin A1C and insulin adjustment.');
    if(vitals.oxygen < 95) suggestions.push('SpO2 drops continuously. Consider supplemental oxygen (2L/min).');
    if(vitals.bpSystolic > 140 && vitals.sugar > 150) {
      suggestions.push('CORRELATION: High BP and Sugar. Elevated stroke/cardiovascular risk. Multi-parameter observation required.');
    }
    
    // Lifestyle recommendations
    if(vitals.sugar > 140) suggestions.push('LIFESTYLE: Reduce carb intake and monitor activity levels.');
    if(vitals.bpSystolic > 130) suggestions.push('LIFESTYLE: Lower sodium intake and consider daily 20min brisk walk.');

    if(suggestions.length === 0) suggestions.push('Vitals are stabilizing in optimal ranges. Medicine appears to be working.');
    return suggestions;
  };

  const isEmergency = vitals.riskLevel === 'High' || healthScore < 50;

  const sendChatMessage = async () => {
    if(!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${SOCKET_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          context: { vitals, healthScore }
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch(err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {isEmergency && <div className="emergency-overlay"></div>}
      <div className={`dashboard-container ${isEmergency ? 'emergency-content' : ''}`}>
        
        {/* Header */}
        <div className="header-area">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div className="avatar"><UserIcon /></div>
            <div className="patient-info">
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                John Doe 
                <span className={`status-badge ${isConnected ? 'live' : 'offline'}`}>{isConnected ? 'LIVE CONNECTED' : 'OFFLINE'}</span>
              </h1>
              <p>65 Years &middot; Male &middot; <span style={{color: '#3b82f6', fontWeight: 500}}>Type 2 Diabetes, Hypertension</span></p>
            </div>
          </div>
          <div className="action-buttons">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: 600}}>
               <User size={16}/> {loggedDoctor}
            </div>
            <span className="risk-score-badge" style={{border: 'none', color: healthScore > 80 ? '#10b981' : healthScore > 50 ? '#d97706' : '#ef4444', background: healthScore > 80 ? '#dcfce7' : healthScore > 50 ? '#fffbeb' : '#fef2f2'}}>
              Health Score: {healthScore} ({healthStatus})
            </span>
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Logout"><LogOut size={18}/></button>
          </div>
        </div>

        {/* Emergency Alert & Quick Actions */}
        <div className="quick-actions" style={{justifyContent: isEmergency ? 'center' : 'flex-start'}}>
          {isEmergency && (
            <div className="emergency-actions fade-in">
              <button className="btn solid-red" style={{padding: '12px 25px', fontSize: '16px', fontWeight: 800, animation: 'pulse 1.5s infinite'}}>
                <Phone size={20}/> CALL AMBULANCE NOW
              </button>
              <button className="btn outline danger" style={{background:'white'}}>
                <Activity size={20}/> Alert Nearest Hospital
              </button>
            </div>
          )}
          {!isEmergency && (
            <>
              <button className="btn outline" onClick={() => setShowPrescription(true)}><FileText size={16}/> Create Prescription</button>
              <button className="btn outline" onClick={() => window.print()}><Printer size={16}/> Export Report</button>
              <button className="btn outline warning" onClick={() => setIsModalOpen(true)}><Syringe size={16}/> Schedule Surgery</button>
              <button className="btn outline success" onClick={() => navigate('/history')}><Clock size={16}/> Disease History</button>
            </>
          )}
        </div>

        {/* Metrics Row */}
        <div className="metrics-area">
          <div className={`metric-card ${selectedVitals.includes('bp') ? 'active' : ''}`} onClick={() => toggleVital('bp')}>
            <div className="metric-header">
              <div className="icon-box blue"><Activity size={18} /></div>
              <span className={`small-badge ${vitals.bpSystolic > 140 ? 'danger' : 'success'}`}>{vitals.bpSystolic > 140 ? 'RISK' : 'NORMAL'}</span>
            </div>
            <div className="title">Blood Pressure</div>
            <div className="value">{vitals.bpSystolic}/{vitals.bpDiastolic} <span className="unit">mmHg</span></div>
          </div>

          <div className={`metric-card ${selectedVitals.includes('sugar') ? 'active' : ''}`} onClick={() => toggleVital('sugar')}>
            <div className="metric-header">
              <div className="icon-box orange"><Droplet size={18} /></div>
              <span className={`small-badge ${vitals.sugar > 140 ? 'danger' : 'success'}`}>{vitals.sugar > 140 ? 'RISK' : 'NORMAL'}</span>
            </div>
            <div className="title">Blood Sugar</div>
            <div className="value">{vitals.sugar} <span className="unit">mg/dL</span></div>
          </div>

          <div className={`metric-card ${selectedVitals.includes('hr') ? 'active' : ''}`} onClick={() => toggleVital('hr')}>
            <div className="metric-header">
              <div className="icon-box pink"><Heart size={18} /></div>
              <span className={`small-badge ${vitals.heartRate > 100 ? 'danger' : 'success'}`}>{vitals.heartRate > 100 ? 'RISK' : 'NORMAL'}</span>
            </div>
            <div className="title">Heart Rate</div>
            <div className="value">{vitals.heartRate} <span className="unit">bpm</span></div>
          </div>

          <div className={`metric-card ${selectedVitals.includes('oxygen') ? 'active' : ''}`} onClick={() => toggleVital('oxygen')}>
            <div className="metric-header">
              <div className="icon-box cyan"><AlertTriangle size={18} /></div>
              <span className={`small-badge ${vitals.oxygen < 95 ? 'danger' : 'success'}`}>{vitals.oxygen < 95 ? 'RISK' : 'NORMAL'}</span>
            </div>
            <div className="title">Oxygen Level</div>
            <div className="value">{vitals.oxygen} <span className="unit">%</span></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content-grid">
          <div className="glass-panel graph-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3>Comparison Trend & Forecast</h3>
                <p className="subtitle" style={{marginBottom: '5px'}}>Correlation between {selectedVitals.join(', ')}</p>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px'}}>
                  {selectedVitals.map(v => {
                    const cfg = getVitalConfig(v);
                    return (
                      <span key={v} style={{fontSize: '11px', color: cfg.stroke, border: `1px solid ${cfg.stroke}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 600}}>
                        {cfg.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {selectedVitals.map(v => {
                    const cfg = getVitalConfig(v);
                    return (
                      <linearGradient key={`grad-${v}`} id={`color-${v}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.fill} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={cfg.fill} stopOpacity={0}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} dy={10} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                {selectedVitals.map(v => {
                  const cfg = getVitalConfig(v);
                  return (
                    <Area key={v} type="monotone" dataKey={cfg.dataKey} stroke={cfg.stroke} strokeWidth={3} fillOpacity={1} fill={`url(#color-${v})`} name={cfg.name} activeDot={{r: 6}} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
            
            {/* CDSS Panel */}
            <div className="cdss-panel">
              <h4><BrainCircuit size={16} color="#3b82f6"/> AI Clinical Decision Support (CDSS) & Correlation</h4>
              {getSuggestions().map((s, i) => <div key={i} className="cdss-item">&bull; {s}</div>)}
            </div>
          </div>

          <div className="side-panels">
            {/* Health Score Breakdown */}
            <div className="glass-panel" style={{marginBottom: '20px'}}>
              <h3 style={{display:'flex', gap:'8px', alignItems:'center'}}><PieIcon size={18} color="#3b82f6"/> Health Score Breakdown</h3>
              <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <div className="score-row">
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:600}}>
                    <span>Blood Pressure (40%)</span>
                    <span>{Math.round(40 - bpComponent)}/40</span>
                  </div>
                  <div className="score-bar"><div className="score-fill" style={{width: `${((40 - bpComponent)/40)*100}%`, background: '#3b82f6'}}></div></div>
                </div>
                <div className="score-row">
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:600}}>
                    <span>Blood Sugar (30%)</span>
                    <span>{Math.round(30 - sugarComponent)}/30</span>
                  </div>
                  <div className="score-bar"><div className="score-fill" style={{width: `${((30 - sugarComponent)/30)*100}%`, background: '#f97316'}}></div></div>
                </div>
                <div className="score-row">
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:600}}>
                    <span>Heart Rate (30%)</span>
                    <span>{Math.round(30 - hrComponent)}/30</span>
                  </div>
                  <div className="score-bar"><div className="score-fill" style={{width: `${((30 - hrComponent)/30)*100}%`, background: '#ec4899'}}></div></div>
                </div>
              </div>
            </div>

            {/* Smart Alerts */}
            <div className="glass-panel alerts-panel" style={{marginBottom: '20px'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><AlertTriangle size={18} color="#ef4444"/> Smart Alerts</h3>
              <div className="alerts-list">
                {alerts.length === 0 ? <p className="subtitle">No alerts.</p> : null}
                {alerts.map(a => (
                  <div key={a.id} className="alert-box fade-in" style={{borderColor: a.type==='CRITICAL'?'#ef4444':'#f59e0b'}}>
                    <div className="alert-icon" style={{color: a.type==='CRITICAL'?'#ef4444':'#f59e0b', borderColor: a.type==='CRITICAL'?'#ef4444':'#f59e0b'}}>!</div>
                    <div>
                      <strong>{a.type || 'WARNING'}</strong>
                      <div style={{color: '#64748b', fontSize: '13px'}}>{a.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaborative Notes */}
            {!isEmergency && (
              <div className="glass-panel">
                <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Users size={18} color="#3b82f6" /> Case Discussion</h3>
                <div className="notes-list" style={{maxHeight:'150px'}}>
                  {notes.map(n => (
                    <div key={n.id} className="note-item">
                      <div className="note-header">
                        <span style={{color: n.author===loggedDoctor?'#3b82f6':'#64748b'}}>{n.author}</span>
                        <span>{n.time}</span>
                      </div>
                      <div className="note-text">{n.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input type="text" placeholder="Add observation..." value={newNote} onChange={e=>setNewNote(e.target.value)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize:'13px'}} onKeyDown={(e) => e.key === 'Enter' && addNote()} />
                  <button className="btn outline" style={{padding: '10px 15px'}} onClick={addNote}>Post</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Trackers & Surgery Analyzer */}
        {!isEmergency && (
          <div className="bottom-grid">
            <div className="glass-panel">
              <h3>Medical Timeline</h3>
              <div style={{maxHeight:'300px', overflowY:'auto', paddingRight:'10px'}}>
                {timeline.map(t => (
                  <div className="timeline-item fade-in" key={t.id}>
                    <div className="dot"></div>
                    <div>
                      <div className="timeline-date">{t.date}</div>
                      <div className="timeline-msg">{t.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel">
              <h3>Medication Tracker</h3>
              {medication.map(m => (
                <div className="medication-item" key={m.id}>
                  <div className="med-info">
                    <span className={`med-icon ${m.status.includes('Taken') ? 'success' : 'warning'}`}>
                      {m.status.includes('Taken') ? <CheckCircle size={16}/> : <Clock size={16}/>}
                    </span>
                    <div>
                      <strong>{m.name}</strong>
                      <div className="subtitle" style={{marginBottom: 0}}>{m.dosage} &middot; {m.time}</div>
                    </div>
                  </div>
                  <span className={`med-status ${m.status.includes('Taken') ? 'success' : 'warning'}`}>
                    {m.status.includes('Taken') ? 'TAKEN' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>

            <div className="surgery-panel">
              <h3><Syringe size={18} /> Surgery Analyzer</h3>
              <div className="input-group">
                <label>SURGERY TYPE</label>
                <input 
                  type="text" 
                  list="surgery-options"
                  value={surgeryType} 
                  onChange={e => setSurgeryType(e.target.value)}
                  style={{width: '100%', padding: '14px', borderRadius: '12px', background: '#3b4252', color: 'white', border: '1px solid #4c566a', outline: 'none', marginBottom: '20px'}}
                />
                <datalist id="surgery-options">
                  <option value="Cataract Surgery" />
                  <option value="Cardiac Bypass" />
                  <option value="Knee Replacement" />
                  <option value="Appendectomy" />
                  <option value="Gallbladder Removal" />
                </datalist>
              </div>
              <button className="btn solid-blue" onClick={handleSurgeryAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? 'Running AI...' : 'Run Analysis'}
              </button>
              
              {surgeryRisk && !isAnalyzing && (
                <div className="surgery-results fade-in">
                  <div className="result-row">
                    <span>Success Rate</span>
                    <span className="rate-value blue">{surgeryRisk.successRate}%</span>
                  </div>
                  <div className="result-row">
                    <span>Risk Level</span>
                    <span className="rate-value green">{surgeryRisk.riskLevel}</span>
                  </div>
                  <div className="risk-factors">
                    <label>KEY RISK FACTORS</label>
                    <ul>
                      {surgeryRisk.keyRiskFactors.map((kf, i) => <li key={i}>{kf}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Schedule Patient Surgery</h3>
              <div className="input-group" style={{marginBottom: '15px'}}>
                <label>Surgery Type</label>
                <input 
                  type="text" 
                  list="surgery-options"
                  value={surgeryType}
                  onChange={e => setSurgeryType(e.target.value)}
                  style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#1e293b'}}
                />
              </div>
              <div className="input-group">
                <label>Select Date</label>
                <input 
                  type="date" 
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#1e293b'}}
                />
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={() => setIsModalOpen(false)} style={{color: '#64748b'}}>Cancel</button>
                <button className="btn outline success" onClick={confirmSchedule} style={{background: '#10b981', color: 'white'}}>Confirm Schedule</button>
              </div>
            </div>
          </div>
        )}

        {/* Prescription Modal Overlay */}
        <div className={`prescription-overlay ${showPrescription ? 'active' : ''}`}>
          <div className="presc-header">
            <div>
              <h2 style={{color: '#3b82f6', marginBottom: '5px'}}>Dr. House Clinic</h2>
              <p>123 Medical Drive, Health City</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <h2>PRESCRIPTION</h2>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="presc-body">
            <h3 style={{borderBottom: '1px solid #e2e8f0', paddingBottom:'10px', marginBottom:'15px'}}>Patient Information</h3>
            <p><strong>Name:</strong> John Doe &nbsp;&nbsp;&nbsp; <strong>Age/Sex:</strong> 65/M</p>
            <p><strong>Diagnosis:</strong> {surgeryType}</p>
            
            <h3 style={{borderBottom: '1px solid #e2e8f0', paddingBottom:'10px', margin:'25px 0 15px'}}>Rx (Medications)</h3>
            {prescMeds.map((med, idx) => (
              <div key={idx} style={{display:'flex', gap:'10px', marginBottom:'10px'}} className="presc-actions">
                <input type="text" placeholder="Medication Name" value={med.name} onChange={e => {
                  let arr = [...prescMeds]; arr[idx].name = e.target.value; setPrescMeds(arr);
                }} style={{flex: 2, padding: '10px'}} />
                <input type="text" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => {
                  let arr = [...prescMeds]; arr[idx].dosage = e.target.value; setPrescMeds(arr);
                }} style={{flex: 1, padding: '10px'}} />
                <input type="text" placeholder="Frequency (e.g. 1-0-1)" value={med.frequency} onChange={e => {
                  let arr = [...prescMeds]; arr[idx].frequency = e.target.value; setPrescMeds(arr);
                }} style={{flex: 1, padding: '10px'}} />
              </div>
            ))}
            <div className="presc-actions" style={{marginTop:'10px'}}>
              <button className="btn outline" onClick={() => setPrescMeds([...prescMeds, {name: '', dosage: '', frequency: ''}])}>+ Add Medication</button>
            </div>

            <div style={{display:'none'}} className="print-view-meds">
              {prescMeds.map((m,i)=> <p key={i}><strong>{i+1}. {m.name}</strong> - {m.dosage} - {m.frequency}</p>)}
            </div>

            <div style={{marginTop: '60px', borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop:'10px'}}>
              <strong>Signature</strong><br/>{loggedDoctor}
            </div>
          </div>

          <div className="presc-actions" style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            <button className="btn outline" onClick={() => setShowPrescription(false)}>Cancel / Close</button>
            <button className="btn solid-blue" onClick={() => window.print()} style={{width:'auto'}}>🖨️ Print Prescription</button>
          </div>
        </div>
        {/* AI Chatbot Floating Button */}
        <button className="chat-toggle" onClick={() => setIsChatOpen(!isChatOpen)}>
          <BrainCircuit size={24} />
        </button>

        {isChatOpen && (
          <div className="chat-window fade-in">
            <div className="chat-header">
              <span>AI Health Assistant</span>
              <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>×</button>
            </div>
            <div className="chat-body" id="chat-body">
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>
                  {m.text}
                </div>
              ))}
              {isTyping && <div className="chat-bubble assistant typing">...</div>}
            </div>
            <div className="chat-footer">
              <input 
                type="text" 
                placeholder="Ask about your health..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              />
              <button onClick={sendChatMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function UserIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#3b82f6"/>
      <path d="M24 24C27.3137 24 30 21.3137 30 18C30 14.6863 27.3137 12 24 12C20.6863 12 18 14.6863 18 18C18 21.3137 20.6863 24 24 24Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 36C34 31.5817 30.4183 28 26 28H22C17.5817 28 14 31.5817 14 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
