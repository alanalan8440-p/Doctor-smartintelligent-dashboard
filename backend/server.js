import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const AI_API_URL = 'http://localhost:8000';

// Real-time generator variables
let patientVitals = {
  bpSystolic: 120,
  bpDiastolic: 80,
  sugar: 100,
  heartRate: 75,
  oxygen: 98,
  riskLevel: 'Normal',
  status: 'Live Connected ✅'
};

const MEDICATION = [
  { id: 1, name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', status: 'Taken ✅' },
  { id: 2, name: 'Metformin', dosage: '500mg', time: '01:00 PM', status: 'Missed ❌' },
  { id: 3, name: 'Aspirin', dosage: '81mg', time: '08:00 PM', status: 'Pending ⏳' }
];

const HISTORY = [
  { id: 1, date: '2026-01-10', event: 'Hypertension Diagnosed' },
  { id: 2, date: '2026-03-15', event: 'Blood Sugar Spike Incident' }
];

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.emit('vitals', patientVitals);
  socket.emit('medication', MEDICATION);
  socket.emit('timeline', HISTORY);

  // Send status update continuously to ensure "Live" indicator is valid
  const interval = setInterval(async () => {
    // Random walk for vitals
    patientVitals.bpSystolic += Math.floor(Math.random() * 5) - 2;
    patientVitals.bpDiastolic += Math.floor(Math.random() * 3) - 1;
    patientVitals.sugar += Math.floor(Math.random() * 5) - 2;
    patientVitals.heartRate += Math.floor(Math.random() * 5) - 2;
    
    // Ensure bounds
    if(patientVitals.sugar < 70) patientVitals.sugar = 70;
    if(patientVitals.sugar > 200) patientVitals.sugar = Math.min(250, patientVitals.sugar);

    // Call AI to get current risk based on new vitals
    try {
      const riskResponse = await axios.post(`${AI_API_URL}/analyze-risk`, {
        bp: patientVitals.bpSystolic,
        sugar: patientVitals.sugar,
        age: 65,
        diseaseFactor: 0.8
      });
      patientVitals.riskLevel = riskResponse.data.level;
    } catch(err) {
      console.log('AI Service not running yet or error');
    }

    patientVitals.updatedAt = new Date().toISOString();
    socket.emit('vitals', patientVitals);

    // Alert thresholds
    if (patientVitals.bpSystolic > 160) io.emit('alert', { type: '🔴 Critical', msg: 'BP Critical!' });
    else if (patientVitals.sugar > 180) io.emit('alert', { type: '🔴 Critical', msg: 'Sugar Spike!' });

  }, 3000);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    clearInterval(interval);
  });
});

// Proxy routes for AI
app.post('/api/surgery-analyzer', async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_API_URL}/surgery-analyzer`, req.body);
    res.json(aiRes.data);
  } catch(err) {
    res.status(500).json({ error: 'AI engine unavailable' });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
