import React, { useState, useEffect } from 'react';
import { Trash2, Archive, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { jsPDF } from "jspdf";

const ProjectCard = ({ project, onUpdateStatus, onDelete, onArchive, user }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!project.deadline) return;
      const diff = new Date(project.deadline) - new Date();
      if (diff <= 0) { setTimeLeft('TERMINATED'); setIsCritical(true); return; }
      
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      
      const urgent = diff < 86400000 && project.status !== 'Готово' && project.status !== 'Оплачено';
      setIsCritical(urgent);
      setTimeLeft(`${d}D ${h}H`);
    };
    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [project.deadline, project.status]);

  // --- ФУНКЦІЯ ГЕНЕРАЦІЇ PDF ЧЕКА ---
  const generatePDFReceipt = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a6" });
    const cyan = "#06b6d4";
    const dark = "#050505";

    doc.setFillColor(dark);
    doc.rect(0, 0, 105, 148, 'F');
    doc.setDrawColor(cyan);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 95, 138);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXUS OS", 10, 20);
    
    doc.setTextColor(cyan);
    doc.setFontSize(8);
    doc.text("TRANSACTION RECEIPT", 10, 25);
    doc.setDrawColor(40, 40, 40);
    doc.line(10, 30, 95, 30);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text("TRANSACTION ID:", 10, 40);
    doc.setTextColor(255, 255, 255);
    doc.text(project.id.toString().padStart(12, '0'), 40, 40);

    doc.setTextColor(150, 150, 150);
    doc.text("DATE:", 10, 47);
    doc.setTextColor(255, 255, 255);
    doc.text(new Date().toLocaleDateString(), 40, 47);

    doc.setTextColor(150, 150, 150);
    doc.text("OPERATOR:", 10, 54);
    doc.setTextColor(255, 255, 255);
    doc.text(user?.login?.toUpperCase() || "AUTHORIZED_ADMIN", 40, 54);

    doc.setDrawColor(40, 40, 40);
    doc.line(10, 62, 95, 62);

    doc.setTextColor(cyan);
    doc.setFontSize(9);
    doc.text(project.title.toUpperCase(), 10, 72);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Client: ${project.client}`, 10, 80);
    doc.text(`Source: ${project.source}`, 10, 86);

    doc.setFillColor(10, 10, 10);
    doc.rect(10, 100, 85, 20, 'F');
    doc.setDrawColor(cyan);
    doc.rect(10, 100, 85, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("TOTAL PAID:", 15, 112);
    doc.setTextColor(cyan);
    doc.setFontSize(14);
    doc.text(project.price, 45, 113);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6);
    doc.text("ENCRYPTED DATA // SECURE TERMINAL ACCESS", 52.5, 135, { align: "center" });
    doc.save(`Receipt_${project.id}.pdf`);
  };

  const getStatusStyle = () => {
    switch (project.status) {
      case 'Оплачено': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Готово': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'Очікування': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      default: return 'text-slate-400 border-white/5 bg-white/5';
    }
  };

  const isFinalized = project.status === 'Оплачено' || project.status === 'Готово';

  return (
    <div className={`
      relative overflow-hidden bg-[#0a0a0a] border p-4 sm:p-6 rounded-[2.5rem] 
      flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 
      transition-all duration-500 
      ${isCritical 
        ? 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]' 
        : 'border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.03]'}
    `}>
      
      {/* Критичний індикатор */}
      {isCritical && (
        <div className="absolute top-0 right-10">
          <div className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-b-xl flex items-center space-x-1 animate-bounce">
            <AlertTriangle size={10} />
            <span className="tracking-widest">URGENT</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-6 w-full sm:w-auto">
        <div className={`hidden sm:block w-1.5 h-12 rounded-full transition-colors duration-500 ${
          isCritical ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' :
          project.status === 'Оплачено' ? 'bg-emerald-500' : 
          project.status === 'Готово' ? 'bg-cyan-500' : 'bg-slate-800'
        }`}></div>

        <div className="space-y-1">
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-[7px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 font-black uppercase tracking-widest">
              {project.source || 'SYS'}
            </span>
            <span className="text-cyan-500/50 text-[10px] font-black uppercase tracking-[0.2em] italic">
              {project.client}
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
            {project.title}
          </h4>

          {project.deadline && (
            <div className="pt-2">
              <span className={`text-[9px] font-mono font-black px-2 py-1 rounded-lg bg-black/40 border border-white/5 ${isCritical ? 'text-red-400' : 'text-slate-600'}`}>
                {timeLeft} REMAINING
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 sm:space-x-10">
        <div className="text-left sm:text-right">
          <p className="text-white font-black text-xl sm:text-2xl tracking-tighter mb-2 leading-none">
            {project.price}
          </p>
          
          <select 
            value={project.status}
            onChange={(e) => onUpdateStatus(project.id, e.target.value)}
            className={`block w-full sm:w-auto bg-transparent text-[9px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all px-3 py-1.5 rounded-xl border ${getStatusStyle()}`}
          >
            <option value="В роботі" className="bg-[#0a0a0c]">⚡ Processing</option>
            <option value="Очікування" className="bg-[#0a0a0c]">⏳ Pending</option>
            <option value="Готово" className="bg-[#0a0a0c]">✅ Deployed</option>
            <option value="Оплачено" className="bg-[#0a0a0c]">💰 Finalized</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* КНОПКА PDF ЧЕКА */}
          {isFinalized && (
            <button 
              onClick={generatePDFReceipt}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
              title="Download PDF Receipt"
            >
              <FileText size={18} />
            </button>
          )}

          <button 
            onClick={() => onArchive(project.id)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            title="Archive"
          >
            <Archive size={18} />
          </button>
          
          <button 
            onClick={() => onDelete(project.id)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
            title="Terminate"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;