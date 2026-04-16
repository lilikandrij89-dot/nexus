import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Key, Mail, User, AlertCircle, CheckCircle2, ChevronLeft, Copy, Check, Lock, Zap } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); 
  const [step, setStep] = useState(1); // 1 - ввід даних, 2 - ввід коду (для рег)
  const [formData, setFormData] = useState({ 
    login: '', password: '', email: '', recovery_key: '', newPassword: '' 
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    try {
      // --- ЛОГІКА ВХОДУ ---
      if (mode === 'login') {
        const res = await axios.post('/api/auth/login', {
          login: formData.login,
          password: formData.password
        }, { withCredentials: true });
        onLoginSuccess(res.data.user);
      } 
      
      // --- ЛОГІКА РЕЄСТРАЦІЇ (КРОК 1: ЗАПИТ) ---
      else if (mode === 'register' && step === 1) {
        await axios.post('/api/auth/register-request', formData);
        setStep(2);
        setStatus({ type: 'success', msg: 'Код авторизації відправлено на пошту' });
      }

      // --- ЛОГІКА РЕЄСТРАЦІЇ (КРОК 2: ПІДТВЕРДЖЕННЯ) ---
      else if (mode === 'register' && step === 2) {
        const res = await axios.post('/api/auth/confirm-register', {
          email: formData.email,
          code: verificationCode
        }, { withCredentials: true });
        
        setGeneratedKey(res.data.recoveryKey);
        setShowKeyModal(true);
      }

      // --- ЛОГІКА СКИНУТТЯ ---
      else if (mode === 'reset') {
        await axios.post('/api/reset-password', formData);
        setStatus({ type: 'success', msg: 'СИСТЕМУ ОНОВЛЕНО. Увійдіть з новим ключем.' });
        setMode('login');
      }

    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Помилка доступу' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 font-['Inter']">
      
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/5 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Master Key</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8 font-bold leading-relaxed px-4">
              Збережіть цей код для відновлення доступу.
            </p>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between mb-8 group">
              <code className="text-cyan-400 font-mono text-sm font-bold tracking-widest truncate mr-2">
                {generatedKey}
              </code>
              <button onClick={copyKey} className="text-slate-500 hover:text-white transition-colors">
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
            <button 
              onClick={() => onLoginSuccess({ login: formData.login })}
              className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all active:scale-95"
            >
              Confirm Access
            </button>
          </div>
        </div>
      )}

      <main className={`w-full max-w-[440px] transition-all duration-500 ${showKeyModal ? 'blur-xl' : ''}`}>
        <div className="bg-[#0a0a0a] p-10 sm:p-14 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
              NEXUS<span className="text-cyan-500">OS</span>
            </h1>
            <div className="text-[9px] font-black text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5 tracking-widest uppercase">v.4.0.2</div>
          </div>

          {mode !== 'reset' && step === 1 && (
            <div className="flex space-x-8 mb-10 border-b border-white/5">
              <button onClick={() => setMode('login')} className={`pb-4 text-[10px] uppercase tracking-widest font-black transition-all relative ${mode === 'login' ? 'text-white' : 'text-slate-600'}`}>
                LOGIN
                {mode === 'login' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>}
              </button>
              <button onClick={() => {setMode('register'); setStep(1);}} className={`pb-4 text-[10px] uppercase tracking-widest font-black transition-all relative ${mode === 'register' ? 'text-white' : 'text-slate-600'}`}>
                REGISTER
                {mode === 'register' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>}
              </button>
            </div>
          )}

          {status.msg && (
            <div className={`mb-8 p-4 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 animate-in fade-in duration-500 ${
              status.type === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
            }`}>
              {status.type === 'error' ? <AlertCircle size={14} /> : <Zap size={14} />}
              <span>{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'login' && (
              <>
                <input type="text" name="login" required value={formData.login} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 outline-none focus:border-cyan-500/50 text-sm text-white placeholder:text-slate-700 transition-all font-medium" placeholder="ID_OPERATOR" />
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 outline-none focus:border-cyan-500/50 text-sm text-white placeholder:text-slate-700 transition-all font-medium" placeholder="ACCESS_KEY" />
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-black transition-all active:scale-[0.98] mt-4">Initialize</button>
                <div className="text-center mt-6">
                  <button type="button" onClick={() => setMode('reset')} className="text-[9px] text-slate-600 hover:text-white transition-all font-black uppercase tracking-[0.2em]">Lost access key?</button>
                </div>
              </>
            )}

            {mode === 'register' && step === 1 && (
              <>
                <div className="space-y-3">
                  <input type="text" name="login" required value={formData.login} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white outline-none focus:border-cyan-500/50" placeholder="NEW OPERATOR ID" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white outline-none focus:border-cyan-500/50" placeholder="EMAIL NODE" />
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white outline-none focus:border-cyan-500/50" placeholder="CREATE ACCESS KEY" />
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-black transition-all mt-6">Authorize Node</button>
              </>
            )}

            {mode === 'register' && step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Verification Required</p>
                    <p className="text-[8px] text-slate-500 uppercase">Код надіслано на {formData.email}</p>
                </div>
                <input 
                  type="text" 
                  required 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  className="w-full p-6 rounded-2xl bg-white/[0.03] border border-cyan-500/30 text-center text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                  placeholder="000000" 
                />
                <button type="submit" className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-cyan-500 transition-all">Confirm Identity</button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-[8px] text-slate-600 uppercase font-black tracking-widest hover:text-white transition-all">Back to data entry</button>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-3">
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="EMAIL NODE" className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white outline-none" />
                <input type="text" name="recovery_key" required value={formData.recovery_key} onChange={handleChange} placeholder="MASTER RECOVERY KEY" className="w-full p-5 rounded-2xl font-mono text-sm bg-white/[0.03] border border-white/5 text-cyan-400 outline-none" />
                <input type="password" name="newPassword" required value={formData.newPassword} onChange={handleChange} placeholder="NEW SECRET KEY" className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white outline-none" />
                <button type="submit" className="w-full bg-orange-600 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-orange-600/20 mt-4 transition-all">Override System</button>
                <button type="button" onClick={() => setMode('login')} className="w-full text-[9px] text-slate-600 uppercase tracking-widest font-black flex items-center justify-center pt-4 hover:text-white transition-all">
                  <ChevronLeft size={12} className="mr-1"/> Return
                </button>
              </div>
            )}
          </form>

          <div className="mt-14 pt-8 border-t border-white/5 flex flex-col items-center">
             <p className="text-[8px] tracking-[0.6em] uppercase font-black text-white/10">Nexus Secure Protocol</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;