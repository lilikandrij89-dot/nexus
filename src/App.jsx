import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, X, Shield, Terminal as TerminalIcon, LogOut, LayoutGrid, History, User, ShieldAlert, Power } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Archive from './pages/Archive';
import Admin from './pages/Admin';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({ UAH: 41.5, BTC: 102000, ETH: 3800 });
  
  // Стан для модалки виходу
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    axios.get('/api/check-auth')
      .then(res => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Функція остаточного виходу
  const confirmLogout = async () => {
    await axios.get('/api/exit');
    setUser(null);
    setCurrentPage('dashboard');
    setShowLogoutConfirm(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-indigo-500 font-black text-[9px] uppercase tracking-[0.5em] animate-pulse">Nexus Syncing...</p>
      </div>
    </div>
  );

  if (!user) return <Login onLoginSuccess={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Inter']">
      
      {/* --- NEXUS LOGOUT MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-red-500/20 w-full max-w-[320px] rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>
            
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <Power size={32} className="animate-pulse" />
            </div>
            
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Terminate?</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-8 font-bold leading-relaxed px-4">
              Ви збираєтесь розірвати з'єднання з вузлом <span className="text-white">{user.login}</span>.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={confirmLogout}
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Confirm Shutdown
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full bg-white/5 text-slate-500 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:text-white transition-all"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADAPTIVE NAVIGATION BAR --- */}
      <nav className="h-16 md:h-20 bg-[#020617]/80 border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[100] backdrop-blur-xl">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full animate-pulse ${user.login === 'admin' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}></div>
            <h1 className="text-white font-black italic uppercase tracking-tighter text-sm md:text-xl cursor-default">
              NEXUS <span className="text-slate-600 hidden xs:inline">CRM</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-white/10 hidden lg:block"></div>
          <p className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] hidden lg:block">
            {user.login === 'admin' ? 'Root Node' : 'Operator Node'}
          </p>
        </div>

        {/* Center: Adaptive Navigation Units */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
          <button 
            onClick={() => setCurrentPage('dashboard')} 
            className={`px-3 md:px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${currentPage === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutGrid size={14} className="md:hidden" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('archive')} 
            className={`px-3 md:px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${currentPage === 'archive' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <History size={14} className="md:hidden" />
            <span className="hidden md:inline">Archive</span>
          </button>

          <button 
            onClick={() => setCurrentPage('profile')} 
            className={`px-3 md:px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${currentPage === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <User size={14} className="md:hidden" />
            <span className="hidden md:inline">Profile</span>
          </button>
          
          {user.login === 'admin' && (
            <button 
              onClick={() => setCurrentPage('admin')} 
              className={`px-3 md:px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${currentPage === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-red-500/50 hover:text-red-500'}`}
            >
              <TerminalIcon size={14} className="md:hidden" />
              <span className="hidden md:inline">Terminal</span>
            </button>
          )}
        </div>

        {/* Right: Identity & Logout */}
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="hidden xl:block text-right">
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Authenticated</p>
            <p className="text-white font-black text-[10px] uppercase tracking-tighter italic">{user.login}</p>
          </div>
          
          <button 
            onClick={() => setShowLogoutConfirm(true)} // ЗАМІСТЬ window.confirm
            className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-0 bg-red-500/10 md:bg-transparent rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-500 transition-all group"
          >
            <span className="hidden sm:inline">Terminate</span>
            <LogOut size={14} className="md:ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* --- CONTENT BUFFER --- */}
      <main className="w-full max-w-[1440px] mx-auto p-4 md:p-8 lg:p-10 transition-all duration-500">
        <div className="page-fade">
          {currentPage === 'dashboard' && <Dashboard user={user} rates={rates} />}
          {currentPage === 'archive' && <Archive rates={rates} />}
          {currentPage === 'profile' && <Profile user={user} onUpdateUser={(u) => setUser(u)} />}
          
          {currentPage === 'admin' && (
            user.login === 'admin' 
              ? <Admin /> 
              : <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4 px-6 text-center">
                  <Shield size={48} className="text-red-600 animate-bounce" />
                  <p className="text-red-500 font-black italic uppercase tracking-[0.2em] text-xs">Access Denied // Root Only</p>
                </div>
          )}
        </div>
      </main>

      <footer className="py-10 opacity-10 pointer-events-none">
        <p className="text-center text-[7px] md:text-[8px] font-black uppercase tracking-[1em]">Nexus OS // Kernel 4.0.2</p>
      </footer>
    </div>
  );
}

export default App;