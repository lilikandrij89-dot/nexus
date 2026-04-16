import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, ShieldAlert, Save, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';

const Profile = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    newLogin: user.login || '',
    newEmail: user.email || '',
    oldPassword: '', // Обов'язково для перевірки на сервері
    newPassword: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    // Перевірка, чи введено старий пароль перед відправкою
    if (!formData.oldPassword) {
      setStatus({ type: 'error', msg: 'Current Access Key Required' });
      return;
    }

    console.log("SENDING PROFILE UPDATE:", formData);

    try {
      // Зверни увагу на URL: якщо ти на хостингу, заміни localhost на свій домен
      const res = await axios.post('/api/update-profile', formData, { 
        withCredentials: true 
      });

      console.log("UPDATE SUCCESS:", res.data);
      setStatus({ type: 'success', msg: 'System configuration updated successfully' });
      
      if (onUpdateUser) onUpdateUser(res.data.user);
      
      // Очищаємо поля паролів після успіху
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
      
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err.response?.data || err.message);
      
      // Виводимо конкретну причину від сервера (наприклад, "Wrong password")
      const errorMsg = err.response?.data?.error || 'Update failed: Verify current key';
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter'] p-6 md:p-12 relative overflow-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-4xl mx-auto relative z-10">
        
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">
              Operator <span className="text-cyan-500">Profile</span>
            </h1>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] ml-1">
              Nexus Terminal // Identification Node
            </p>
          </div>
          <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-md">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Session</p>
            <p className="text-cyan-500 font-mono text-xs font-bold tracking-widest uppercase">{user.login}</p>
          </div>
        </div>

        {status.msg && (
          <div className={`mb-10 p-5 rounded-[1.5rem] border animate-in slide-in-from-top duration-300 ${
            status.type === 'success' 
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
              : 'border-red-500/20 bg-red-500/5 text-red-400'
          } text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center`}>
            <Zap size={14} className="mr-3" /> {status.msg}
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-3 text-left">
                <label className="text-[9px] text-slate-500 uppercase font-black ml-2 tracking-[0.2em] flex items-center">
                  <User size={12} className="mr-2 text-cyan-500" /> Operator ID
                </label>
                <input 
                  type="text" 
                  name="newLogin" 
                  value={formData.newLogin} 
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-cyan-500/30 transition-all"
                />
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[9px] text-slate-500 uppercase font-black ml-2 tracking-[0.2em] flex items-center">
                  <Mail size={12} className="mr-2 text-cyan-500" /> Email Node
                </label>
                <input 
                  type="email" 
                  name="newEmail" 
                  value={formData.newEmail} 
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-cyan-500/30 transition-all"
                />
              </div>
            </div>

            <div className="pt-12 border-t border-white/5">
              <div className="flex items-center space-x-4 mb-10 text-left">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic text-white tracking-tighter">Security Protocol</h3>
                  <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Access Key Rotation</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10 text-left">
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-500 uppercase font-black ml-2 tracking-widest">Current Access Key</label>
                  <input 
                    type="password" 
                    name="oldPassword" 
                    value={formData.oldPassword}
                    placeholder="REQUIRED FOR OVERRIDE" 
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-red-500/30 placeholder:text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] text-slate-500 uppercase font-black ml-2 tracking-widest">New Access Key</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={formData.newPassword}
                    placeholder="LEAVE BLANK TO KEEP" 
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-cyan-500/30 placeholder:text-slate-800 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-cyan-500 hover:text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center group"
              >
                <Save size={16} className="mr-3 transition-transform group-hover:scale-110" /> 
                Update Configuration Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;