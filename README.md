# 🩺 Health Intelligence Dashboard

A modern, full-stack medical application designed to track real-time patient vitals, predict surgical risks, and provide an AI-driven clinical decision support system (CDSS) for medical professionals.

## 🏗️ Architecture

This project is built using a modern microservices architecture:

- **Frontend (`/frontend`)**: React + Vite application with a responsive, modern UI. Interfaces directly with Supabase for secure authentication and real-time database updates.
- **Backend (`/backend`)**: Node.js + Express server. Handles data processing, interacts with the AI service, and manages secure connections to the core database.
- **AI Service (`/ai_service`)**: Python + FastAPI microservice. Computes predictive risk scores and surgical success rates based on patient vitals and medical history.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- A [Supabase](https://supabase.com/) project (for Auth & Database)

### 1. Configure Environment Variables

You will need to create two `.env` files based on your Supabase credentials:

**Inside `/frontend/.env`:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Inside `/backend/.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 2. Running Locally

The project consists of three separate servers working together. In separate terminal windows, run:

**Frontend Server:**
```bash
cd frontend
npm install
npm run dev
```

**Backend Server:**
```bash
cd backend
npm install
npm start
```

**AI Engine:**
```bash
cd ai_service
# Activate your virtual environment first (e.g., .\venv\Scripts\activate.ps1)
pip install fastapi pydantic uvicorn
python -m uvicorn main:app --reload
```

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Lucide-React, Recharts
- **Backend**: Node.js, Express, Socket.IO, Axios
- **AI Service**: Python, FastAPI
- **Database & Auth**: Supabase (PostgreSQL)
