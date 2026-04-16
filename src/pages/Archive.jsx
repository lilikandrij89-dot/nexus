import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, History, TrendingUp, Search, Layers, ShieldCheck } from 'lucide-react';

const Archive = ({ rates }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchArchive = async () => {
    try {
      const res = await axios.get('https://reversion-grueling-reviving.ngrok-free.dev/api/projects', { withCredentials: true });
      const archived = res.data.projects.filter(p => p.status === 'Архів');
      setProjects(archived);
      setLoading(false);
    } catch (err) {
      console.error("Archive sync error", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.patch(`https://reversion-grueling-reviving.ngrok-free.dev/api/projects/${id}`, 
        { status: 'В роботі' }, 
        { withCredentials: true }
      );
      fetchArchive(); 
      console.log("Проект успішно відновлено!");
    } catch (err) {
      console.error("Restore failed", err.response?.data || err.message);
    }
  };

  const calculateTotal = () => {
    return projects.reduce((acc, p) => {
      const parts = p.price.trim().split(' ');
      const value = parseFloat(parts[0]) || 0;
      const curr = parts[1] ? parts[1].toUpperCase() : 'USD';
      const rate = rates?.[curr] || (curr === 'UAH' ? 41.5 : 1);

      if (curr === 'UAH') return acc + (value / rate);
      if (curr === 'BTC') return acc + (value * (rates?.BTC || 65000));
      if (curr === 'ETH') return acc + (value * (rates?.ETH || 3500));
      return acc + value;
    }, 0);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-cyan-500 font-black text-[10px] animate-pulse uppercase tracking-[0.4em]">Accessing History Node...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 font-['Inter'] p-6 md:p-12 relative overflow-hidden">
      
      {/* BACKGROUND DECOR */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-5xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400">
                <History size={24} />
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                Data <span className="text-cyan-500">Archive</span>
              </h2>
            </div>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] ml-1">Historical Log // Nexus Security Protocol</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-end min-w-[280px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center space-x-3 mb-2 opacity-50">
              <ShieldCheck size={14} className="text-cyan-500" />
              <p className="font-black text-[9px] tracking-widest uppercase">Archived Liquidity</p>
            </div>
            <p className="text-4xl font-black italic text-white tracking-tighter">
              ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-12 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-slate-600 group-focus-within:text-cyan-500 transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search within archive nodes (Title or Client)..."
            className="w-full bg-[#0a0a0a] border border-white/5 p-6 pl-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-cyan-500/30 focus:bg-white/[0.02] transition-all text-white placeholder:text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* PROJECTS LIST */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-40 bg-[#0a0a0a] rounded-[3rem] border border-dashed border-white/5">
              <p className="uppercase tracking-[0.6em] text-[10px] font-black text-slate-700 italic">No records found in local database</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="bg-[#0a0a0a] p-8 rounded-[2rem] flex justify-between items-center border border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden">
                {/* Side line */}
                <div className="absolute left-0 top-0 h-full w-1 bg-white/5 group-hover:bg-cyan-500 transition-all"></div>
                
                <div className="flex items-center space-x-8 text-left">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-[8px] px-3 py-1 rounded-lg bg-white/5 text-slate-500 font-black uppercase tracking-widest border border-white/5">
                        {project.source}
                      </span>
                      <span className="text-cyan-500/50 text-[9px] font-black uppercase tracking-[0.3em] italic">
                        {project.client}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {project.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-12 text-right">
                  <div className="hidden sm:block">
                    <p className="text-white font-black italic text-2xl tracking-tighter leading-none mb-1">
                      {project.price}
                    </p>
                    <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">
                      Declassified Contract
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleRestore(project.id)}
                    className="p-5 rounded-2xl bg-white text-black hover:bg-cyan-500 hover:text-white transition-all shadow-xl active:scale-95"
                    title="Restore Operation"
                  >
                    <RotateCcw size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-center mt-16 text-white/10 text-[8px] font-black uppercase tracking-[0.8em]">
          End of historical data stream // NexusOS v4.0.2
        </p>
      </main>
    </div>
  );
};

export default Archive;