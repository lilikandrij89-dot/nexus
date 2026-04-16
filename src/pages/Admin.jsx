import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Key, Lock, Save, RefreshCcw, Database, Terminal } from 'lucide-react';

const Admin = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overrideData, setOverrideData] = useState({});

  const fetchUsers = async () => {
    try {
      // Axios автоматично використовує baseURL та withCredentials
      const res = await axios.get('/api/admin/users');
      setAllUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Access Denied: Terminal connection failed", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOverride = async (userId) => {
    const newPassword = overrideData[userId];
    if (!newPassword) return;

    try {
      // Використовуємо короткий шлях
      await axios.post('/api/admin/update-user', { userId, newPassword });
      
      setOverrideData({ ...overrideData, [userId]: '' });
      fetchUsers(); // Оновлюємо дані, щоб побачити зміни
    } catch (err) {
      console.error("Override failed: Root authority rejected", err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-red-500 font-black text-[8px] uppercase tracking-[0.4em]">Establishing Root Connection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] bg-[#020617] text-slate-400 font-['Inter'] relative overflow-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="text-left">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                Master <span className="text-red-500">Terminal</span>
              </h2>
            </div>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] ml-1">
              Root Access // Secure Database Override Protocol
            </p>
          </div>

          <div className="flex space-x-4">
            <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-md">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Nodes</p>
              <p className="text-white font-mono text-xs font-bold tracking-widest uppercase">{allUsers.length} Operators</p>
            </div>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black border-b border-white/5">
                <tr>
                  <th className="p-8 italic"># UID</th>
                  <th className="p-8">Operator Login</th>
                  <th className="p-8 text-center px-4">Encryption</th>
                  <th className="p-8">Recovery Token</th>
                  <th className="p-8 text-right">System Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-red-500/[0.03] transition-all">
                    <td className="p-8 font-mono text-slate-700 text-[10px] italic">0x00{u.id}</td>
                    <td className="p-8 text-left">
                      <div>
                        <p className="text-white font-black uppercase italic tracking-tight text-base leading-none mb-1">{u.login}</p>
                        <p className="text-[10px] text-slate-600 font-medium">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                       <div className="flex justify-center">
                         <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                           <Lock size={12} className="text-orange-500 opacity-50" />
                         </div>
                       </div>
                    </td>
                    <td className="p-8 text-left">
                      <code className="font-mono text-[10px] blur-sm hover:blur-none transition-all duration-500 cursor-crosshair tracking-widest text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-white/5">
                        {u.recovery_key}
                      </code>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <input 
                          type="text" 
                          placeholder="NEW KEY..." 
                          className="w-32 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:border-red-500/50 outline-none text-white placeholder:text-slate-800 transition-all"
                          value={overrideData[u.id] || ''}
                          onChange={(e) => setOverrideData({ ...overrideData, [u.id]: e.target.value })}
                        />
                        <button 
                          onClick={() => handleOverride(u.id)}
                          className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all group"
                        >
                          <RefreshCcw size={16} className="group-active:rotate-180 transition-transform duration-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center opacity-10">
            <div className="h-px bg-red-500 flex-1 mr-4"></div>
            <p className="text-[8px] tracking-[1em] uppercase font-black text-red-500">Root Level Authorization Required</p>
            <div className="h-px bg-red-500 flex-1 ml-4"></div>
        </div>
      </main>
    </div>
  );
};

export default Admin;