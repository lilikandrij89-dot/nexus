import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend 
} from 'chart.js';
import { Plus, BarChart3, LayoutGrid, Wallet, Layers, Copy, Check, X, Bell, Zap, Shield } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const Dashboard = ({ user, rates, recoveryKeyFromServer }) => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null });
  
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [masterKey, setMasterKey] = useState(recoveryKeyFromServer || '');
  const [copied, setCopied] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '', source: 'TG', client: '', deadline: '', price: '', currency: 'USD'
  });

  useEffect(() => {
    if (recoveryKeyFromServer) {
      setMasterKey(recoveryKeyFromServer);
      setShowKeyAlert(true);
    }
    fetchData();
  }, [recoveryKeyFromServer]);

  const fetchData = async () => {
    try {
      const res = await axios.get('https://reversion-grueling-reviving.ngrok-free.dev/api/projects', { withCredentials: true });
      const statsRes = await axios.get('https://reversion-grueling-reviving.ngrok-free.dev/api/stats', { withCredentials: true });
      setProjects(res.data.projects || []);
      setStats(statsRes.data || []);
      setLoading(false);
    } catch (err) { 
      console.error("Sync Error:", err); 
      setLoading(false); 
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://reversion-grueling-reviving.ngrok-free.dev/api/projects/${deleteModal.projectId}`, { withCredentials: true });
      setDeleteModal({ isOpen: false, projectId: null });
      fetchData();
    } catch (err) { console.error("Error:", err); }
  };

  const calculateTotalEarned = () => {
    return projects.reduce((acc, p) => {
      const isDone = ['Готово', 'Оплачено', 'Deployed', 'Finalized'].includes(p.status);
      if (isDone) {
        const parts = p.price.trim().split(' ');
        const val = parseFloat(parts[0]) || 0;
        const curr = parts[1] ? parts[1].toUpperCase() : 'USD';
        const rate = rates?.[curr] || (curr === 'UAH' ? 41.5 : 1);
        if (curr === 'UAH') return acc + (val / rate);
        if (curr === 'BTC') return acc + (val * (rates?.BTC || 65000));
        if (curr === 'ETH') return acc + (val * (rates?.ETH || 3500));
        return acc + val;
      }
      return acc;
    }, 0);
  };

  const sortedProjects = useMemo(() => {
    return [...projects]
      .filter(p => p.status !== 'Архів' && (filter === 'all' || p.status === filter))
      .sort((a, b) => {
        const isDone = (s) => ['Готово', 'Оплачено', 'Deployed', 'Finalized'].includes(s);
        if (isDone(a.status) && !isDone(b.status)) return 1;
        if (!isDone(a.status) && isDone(b.status)) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
  }, [projects, filter]);

  const chartData = useMemo(() => ({
    labels: stats.length > 1 ? stats.map(s => s.date) : ['Phase 01', 'Phase 02'],
    datasets: [{
      fill: true,
      data: stats.length > 1 ? stats.map(s => s.daily_profit) : [0, 0],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    }]
  }), [stats]);

  const handleAddProject = async (e) => {
  e.preventDefault(); // ЦЕ ОБОВ'ЯЗКОВО, щоб сторінка не перезавантажувалась
  console.log("Attempting to authorize mission...", newProject); // Перевірка в консолі

  try {
    const res = await axios.post('https://reversion-grueling-reviving.ngrok-free.dev/api/projects', newProject, { withCredentials: true });
    console.log("Server response:", res.data);
    
    // Очищаємо форму та закриваємо модалку
    setNewProject({ title: '', source: 'TG', client: '', deadline: '', price: '', currency: 'USD' });
    setIsModalOpen(false);
    fetchData(); // Оновлюємо список проектів
  } catch (err) {
    console.error("Critical deployment error:", err.response?.data || err.message);
    alert("System Error: Check console for logs");
  }
};

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-cyan-500 font-black text-[8px] uppercase tracking-[0.4em]">Establishing Link...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-400 font-['Inter'] pb-20 selection:bg-cyan-500 selection:text-black">
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[120px]"></div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-red-500/20 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500"><X size={32} /></div>
            <h3 className="text-white text-xl font-black uppercase italic tracking-tighter mb-2">Terminate?</h3>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-8">This operation cannot be undone</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteModal({ isOpen: false, projectId: null })} className="py-4 bg-white/5 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Cancel</button>
              <button onClick={confirmDelete} className="py-4 bg-red-600 rounded-2xl font-black uppercase text-[9px] tracking-widest text-white shadow-lg shadow-red-600/20 active:scale-95 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-white font-black uppercase tracking-tighter text-2xl leading-none">NEXUS<span className="text-cyan-500">.</span></h1>
            <p className="text-[8px] font-black text-cyan-500/50 tracking-[0.3em] uppercase mt-1">Command Center</p>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden md:block text-right border-r border-white/10 pr-8">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Revenue</p>
             <p className="text-white font-black italic text-lg tracking-tighter">${calculateTotalEarned().toLocaleString()}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-black h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all active:scale-95 shadow-xl">
            + DEPLOY
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-12 relative z-10">
        
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 h-[350px] relative group overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center">
                 <BarChart3 size={14} className="mr-2" /> Performance trajectory
               </h3>
               <div className="flex space-x-2">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-cyan-500/20"></div>
               </div>
            </div>
            <div className="h-[200px] relative z-10">
              <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#334155', font: { size: 9, weight: 'bold' } } } } }} />
            </div>
          </div>

          <div className="bg-cyan-500 rounded-[3rem] p-10 flex flex-col justify-between text-black shadow-2xl shadow-cyan-500/20 group relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Wallet size={160} />
             </div>
             <Zap size={32} fill="black" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Current Yield</p>
               <p className="text-5xl font-black tracking-tighter leading-none">${calculateTotalEarned().toLocaleString()}</p>
             </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/5"><LayoutGrid size={18} className="text-cyan-500" /></div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Active Operations</h2>
            </div>
            <div className="flex bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              {['all', 'В роботі'].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-widest ${filter === f ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                  {f === 'all' ? 'All Units' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sortedProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdateStatus={async (id, status) => { await axios.patch(`https://reversion-grueling-reviving.ngrok-free.dev/api/projects/${id}`, { status }, { withCredentials: true }); fetchData(); }}
                onDelete={() => setDeleteModal({ isOpen: true, projectId: project.id })}
                onArchive={async (id) => { await axios.patch(`https://reversion-grueling-reviving.ngrok-free.dev/api/projects/${id}`, { status: 'Архів' }, { withCredentials: true }); fetchData(); }}
              />
            ))}
          </div>
        </section>
      </main>

      {/* MODAL WINDOW WITH FIXED INPUTS */}
{isModalOpen && (
  <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
    <div className="bg-[#0a0a0a] border border-white/5 w-full max-w-xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[95vh] animate-zoom-in">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      <button 
        onClick={() => setIsModalOpen(false)} 
        className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2"
      >
        <X size={28} />
      </button>
      
      <div className="mb-10">
         <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
           Initial <span className="text-cyan-500">Deployment</span>
         </h2>
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-3 flex items-center">
           <Shield size={10} className="mr-2 text-cyan-500" /> Authorized Admin Session
         </p>
      </div>

      <form onSubmit={handleAddProject} className="space-y-5">
        {/* Mission Title */}
        <div className="space-y-2 text-left">
           <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Mission Title</label>
           <input 
             type="text" 
             placeholder="Designate target..." 
             required 
             className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500/50 text-white transition-all text-sm font-bold placeholder:text-slate-800" 
             value={newProject.title} 
             onChange={e => setNewProject({...newProject, title: e.target.value})} 
           />
        </div>

        {/* Client & Source Channel */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Client / Node</label>
    <input 
      type="text" 
      placeholder="Entity name..." 
      required 
      className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500/50 text-white text-sm font-bold placeholder:text-slate-800 transition-all h-[60px]" 
      value={newProject.client} 
      onChange={e => setNewProject({...newProject, client: e.target.value})} 
    />
  </div>
  
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Source Channel</label>
    <div className="relative h-[60px]">
      <select 
        style={{ 
          colorScheme: 'dark',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1.25rem center',
          backgroundSize: '1rem'
        }} 
        className="w-full h-full bg-white/[0.03] border border-white/10 px-5 rounded-2xl text-white outline-none cursor-pointer text-sm font-bold appearance-none focus:border-cyan-500/50 transition-all pr-12" 
        value={newProject.source} 
        onChange={e => setNewProject({...newProject, source: e.target.value})}
      >
        <option value="TG" className="bg-[#0a0a0a] text-white py-4">TELEGRAM</option>
        <option value="Upwork" className="bg-[#0a0a0a] text-white py-4">UPWORK</option>
        <option value="Mail" className="bg-[#0a0a0a] text-white py-4">EMAIL</option>
      </select>
    </div>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
  {/* Блок Value / Price */}
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Value / Price</label>
    <div className="relative h-[60px] flex items-center bg-white/[0.03] border border-white/10 rounded-2xl focus-within:border-cyan-500/50 transition-all overflow-hidden">
      <input 
        type="number" 
        placeholder="0.00" 
        required 
        className="flex-1 bg-transparent pl-5 pr-16 outline-none text-white text-sm font-bold placeholder:text-slate-800 h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
        value={newProject.price} 
        onChange={e => setNewProject({...newProject, price: e.target.value})} 
      />
      {/* Селект валюти з повним скиданням стилів стрілки */}
      <div className="absolute right-0 top-0 h-full flex items-center">
        <select 
          style={{ colorScheme: 'dark' }} 
          className="h-full bg-white/5 border-l border-white/10 px-4 text-cyan-500 outline-none cursor-pointer text-[10px] font-black uppercase appearance-none hover:bg-white/10 transition-colors text-center min-w-[70px]" 
          value={newProject.currency} 
          onChange={e => setNewProject({...newProject, currency: e.target.value})}
        >
          <option value="USD" className="bg-[#0a0a0a] text-white">USD</option>
          <option value="UAH" className="bg-[#0a0a0a] text-white">UAH</option>
          <option value="BTC" className="bg-[#0a0a0a] text-white">BTC</option>
        </select>
      </div>
    </div>
  </div>

  {/* Блок Final Deadline */}
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Final Deadline</label>
    <div className="h-[60px]">
      <input 
        type="date" 
        required 
        className="w-full h-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500/50 text-white [color-scheme:dark] text-sm font-bold transition-all" 
        value={newProject.deadline} 
        onChange={e => setNewProject({...newProject, deadline: e.target.value})} 
      />
    </div>
  </div>
</div>

        <button 
          type="submit" 
          className="w-full bg-cyan-500 hover:bg-cyan-400 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] text-black mt-4 shadow-2xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          Authorize Mission
        </button>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default Dashboard;