import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Stethoscope } from 'lucide-react';
import { supabase } from './supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if(email && password) {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // If login fails, we'll alert but also let you bypass for dev purposes if needed
          // Remove the bypass if you want strict authentication
          alert(`Supabase Auth Error: ${error.message}\n(Make sure to create this user in Supabase Authentication!)`);
        } else {
          localStorage.setItem('loggedDoctor', email);
          navigate('/dashboard');
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ 
        background: '#FFFFFF', 
        padding: '50px 40px', 
        borderRadius: '30px', 
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', 
        width: '100%', 
        maxWidth: '420px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        
        {/* Top Icon with Blue Glow */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div style={{
            position: 'absolute',
            top: '10px', left: '-5px', right: '-5px', bottom: '-10px',
            background: 'rgba(56, 189, 248, 0.4)', // Soft blueish ambient glow
            filter: 'blur(15px)',
            borderRadius: '20px',
            zIndex: 0
          }}></div>
          <div style={{ 
            background: '#F04C92', // Vibrant Pink
            width: '68px', height: '68px', 
            borderRadius: '20px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            color: 'white',
            position: 'relative',
            zIndex: 1
          }}>
            <Stethoscope size={32} strokeWidth={2}/>
          </div>
        </div>

        {/* Titles */}
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Health Intelligence</h2>
        <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '35px', fontWeight: 500 }}>Sign in to your dashboard</p>
        
        {/* Toggle Bar */}
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          background: '#F1F5F9', // light gray background
          borderRadius: '14px', 
          padding: '5px', 
          marginBottom: '30px' 
        }}>
          <button 
            type="button" 
            onClick={() => setRole('Doctor')}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '10px', 
              background: role === 'Doctor' ? '#F04C92' : 'transparent', // Pink active
              color: role === 'Doctor' ? '#ffffff' : '#94A3B8', // Gray inactive
              border: 'none',
              boxShadow: role === 'Doctor' ? '0 4px 6px -1px rgba(240, 76, 146, 0.2)' : 'none',
              fontWeight: 700, 
              fontSize: '15px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Doctor
          </button>
          <button 
            type="button" 
            onClick={() => setRole('Patient')}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '10px', 
              background: role === 'Patient' ? '#F04C92' : 'transparent', 
              color: role === 'Patient' ? '#ffffff' : '#94A3B8', 
              border: 'none',
              boxShadow: role === 'Patient' ? '0 4px 6px -1px rgba(240, 76, 146, 0.2)' : 'none',
              fontWeight: 700, 
              fontSize: '15px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Patient
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="doctor@hospital.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', padding: '14px 14px 14px 45px', 
                  borderRadius: '12px', border: '1px solid #E2E8F0', 
                  outline: 'none', background: '#FAFAFA', 
                  color: '#334155', fontSize: '15px',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #F04C92'}
                onBlur={(e) => e.target.style.border = '1px solid #E2E8F0'}
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', padding: '14px 14px 14px 45px', 
                  borderRadius: '12px', border: '1px solid #E2E8F0', 
                  outline: 'none', background: '#FAFAFA', 
                  color: '#334155', fontSize: '15px', letterSpacing: '2px',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #F04C92'}
                onBlur={(e) => e.target.style.border = '1px solid #E2E8F0'}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#F04C92', // Vibrant Pink
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '12px', 
              fontSize: '16px', 
              fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '15px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(240, 76, 146, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if(!loading) e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(240, 76, 146, 0.4)'; }}
            onMouseOut={(e) => { if(!loading) e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(240, 76, 146, 0.3)'; }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
