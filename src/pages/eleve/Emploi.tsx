import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Download,
  ChevronRight,
  ChevronLeft,
  Bell,
  AlarmClock
} from 'lucide-react';
import { Card, Badge, Button, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';

const EleveEmploi: React.FC = () => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Mock schedule data
  const schedule = [
    { day: 'Lundi', start: '08:00', end: '10:00', subject: 'Mathématiques', teacher: 'Pr. Diallo', room: 'S. 402', color: 'blue' },
    { day: 'Lundi', start: '10:15', end: '12:15', subject: 'Physique-Chimie', teacher: 'Dr. Condé', room: 'Lab B', color: 'indigo' },
    { day: 'Mardi', start: '08:00', end: '10:00', subject: 'Français', teacher: 'Mme Camara', room: 'S. 205', color: 'violet' },
    { day: 'Mardi', start: '10:15', end: '11:15', subject: 'Histoire-Géo', teacher: 'M. Sylla', room: 'S. 110', color: 'amber' },
    { day: 'Mercredi', start: '08:30', end: '10:30', subject: 'Anglais', teacher: 'Mme Smith', room: 'S. 201', color: 'emerald' },
    { day: 'Jeudi', start: '14:00', end: '16:00', subject: 'SVT', teacher: 'Pr. Barry', room: 'Lab A', color: 'emerald' },
    { day: 'Vendredi', start: '10:00', end: '12:00', subject: 'Philosophie', teacher: 'Dr. Keïta', room: 'S. 301', color: 'rose' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-bleu-50/50 dark:bg-bleu-900/20 border-bleu-200 dark:border-bleu-800 text-bleu-700 dark:text-bleu-400';
      case 'indigo': return 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400';
      case 'violet': return 'bg-violet-50/50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400';
      case 'amber': return 'bg-or-50/50 dark:bg-or-900/20 border-or-200 dark:border-or-800 text-or-700 dark:text-or-400';
      case 'emerald': return 'bg-vert-50/50 dark:bg-vert-900/20 border-vert-200 dark:border-vert-800 text-vert-700 dark:text-vert-400';
      case 'rose': return 'bg-rouge-50/50 dark:bg-rouge-900/20 border-rouge-200 dark:border-rouge-800 text-rouge-700 dark:text-rouge-400';
      default: return 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-or-100 dark:bg-or-900/30 rounded-2xl shadow-inner text-or-600">
            <Calendar size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Emploi du Temps</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Gère ton planning hebdomadaire et tes cours</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
           <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
              <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-[10px] font-black uppercase tracking-widest px-4 text-gray-500">Semaine 24</span>
              <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
           </div>
           <Button className="h-10 px-4 bg-white dark:bg-gray-800 border-none shadow-soft text-gray-700 dark:text-white font-bold text-xs rounded-xl">
             <Download size={14} className="mr-2" /> PDF
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         {/* GRID SCHEDULE */}
         <Card className="xl:col-span-3 p-0 border-none shadow-soft overflow-hidden bg-white dark:bg-gray-900/50">
            <div className="overflow-x-auto">
               <div className="min-w-[800px]">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                     <div className="p-4 border-r border-gray-100 dark:border-white/5" />
                     {days.map(day => (
                       <div key={day} className="p-4 text-center border-r border-gray-100 dark:border-white/5">
                          <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{day}</p>
                       </div>
                     ))}
                  </div>

                  {/* Hours Rows */}
                  <div className="relative">
                     {hours.map((hour, idx) => (
                       <div key={hour} className="grid grid-cols-7 min-h-[80px] border-b border-gray-50 dark:border-white/5">
                          <div className="p-4 border-r border-gray-100 dark:border-white/5 flex flex-col justify-start">
                             <span className="text-[10px] font-black text-gray-400">{hour}</span>
                          </div>
                          {days.map(day => (
                             <div key={day} className="border-r border-gray-50 dark:border-white/5 relative group" />
                          ))}
                       </div>
                     ))}

                     {/* Overlay items (Absolutes) - Just a few examples for UI representation */}
                     {schedule.map((item, idx) => {
                       const dayIdx = days.indexOf(item.day);
                       if (dayIdx === -1) return null;
                       
                       const startTime = item.start.split(':');
                       const startHour = parseInt(startTime[0]) - 8;
                       const startMin = parseInt(startTime[1]) / 60;
                       const endTime = item.end.split(':');
                       const duration = (parseInt(endTime[0]) - parseInt(startTime[0])) + (parseInt(endTime[1]) - parseInt(startTime[1])) / 60;

                       return (
                         <div 
                           key={idx}
                           className={cn(
                             "absolute inset-y-0 p-1 mx-1 transition-all hover:scale-[1.02] cursor-pointer",
                             getColorClasses(item.color)
                           )}
                           style={{
                             left: `${(dayIdx + 1) * (100/7)}%`,
                             width: `${100/7}%`,
                             top: `${(startHour + startMin) * 80}px`,
                             height: `${duration * 80}px`,
                             zIndex: 10
                           }}
                         >
                            <div className="p-2 border-l-2 border-current h-full flex flex-col justify-between overflow-hidden">
                               <div>
                                  <p className="text-[10px] font-black leading-tight line-clamp-1">{item.subject}</p>
                                  <p className="text-[9px] font-bold opacity-60 mt-1 flex items-center gap-1"><MapPin size={8} />{item.room}</p>
                                </div>
                                <p className="text-[8px] font-bold opacity-80 flex items-center gap-1"><User size={8} />{item.teacher}</p>
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
         </Card>

         {/* SIDEBAR: NEXT CLASS & ALERTS */}
         <div className="space-y-6">
            <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-or-500 to-or-600 text-white relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <AlarmClock size={120} />
               </div>
               <div className="relative z-10">
                  <Badge className="bg-white/20 text-white border-none font-black text-[9px] px-2 mb-4">COURS ACTUEL</Badge>
                  <h3 className="text-xl font-black mb-1">Anglais</h3>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-90 mb-4">
                     <Clock size={12} /> 08:30 - 10:30 (S. 201)
                  </div>
                  <div className="pt-4 border-t border-white/20">
                     <p className="text-[10px] font-bold opacity-70 mb-2 uppercase tracking-widest text-left">Prochain cours</p>
                     <p className="text-sm font-black text-left">Pas de cours l'après-midi</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50">
               <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell size={16} className="text-bleu-500" /> Notifications cours
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-3 text-left">
                     <div className="w-1 h-8 bg-vert-500 rounded-full flex-shrink-0" />
                     <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">Salle modifiée</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Français (Jeudi) passe en S. 102</p>
                     </div>
                  </div>
                  <div className="flex gap-3 text-left opacity-60">
                     <div className="w-1 h-8 bg-rouge-500 rounded-full flex-shrink-0" />
                     <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">Professeur absent</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">SVT vendredi annulé</p>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </motion.div>
  );
};

export default EleveEmploi;
