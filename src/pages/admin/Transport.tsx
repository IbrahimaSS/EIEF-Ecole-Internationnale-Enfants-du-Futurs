import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Users, 
  Plus, 
  ChevronRight, 
  Map, 
  Navigation, 
  ShieldCheck, 
  History,
  TrendingUp,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Settings,
  MoreVertical,
  Navigation2,
  X,
  CheckCircle2,
  FileText,
  Activity,
  CreditCard,
  Search
} from 'lucide-react';
import { Card, Badge, StatCard, Button, Avatar, Modal, Input, Select, Popover, Table } from '../../components/ui';
import { cn } from '../../utils/cn';

// Importation des données élèves
import elevesData from '../../data/eleves.json';

  const stops = [
    { name: 'Camp Alpha Yaya', time: '07:15', status: 'passed' },
    { name: 'Cité de l\'Air', time: '07:30', status: 'passed' },
    { name: 'Nongo Contéyah', time: '07:45', status: 'current' },
    { name: 'Kipé Centre', time: '08:00', status: 'pending' },
    { name: 'Bambeto', time: '08:15', status: 'pending' },
    { name: 'Hamdallaye', time: '08:30', status: 'pending' },
    { name: 'EIEF Campus', time: '08:45', status: 'destination' },
  ];

const AdminTransport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lignes' | 'eleves'>('lignes');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation d'élèves utilisant le transport (40%)
  const elevesTransport = elevesData.filter((_, i) => i % 3 === 0);

  const lignesTransport = [
    { id: 'L1', nom: 'Ligne Nord - Ratoma/Nongo', bus: 'AG-1029-EIEF', chauffeur: 'Mamadou Touré', capacite: 32, inscrits: 28, statut: 'En route', retard: '5 min' },
    { id: 'L2', nom: 'Ligne Sud - Dixinn/Kaloum', bus: 'AG-2034-EIEF', chauffeur: 'Mohamed Kéita', capacite: 28, inscrits: 22, statut: 'Arrêt', retard: '-' },
    { id: 'L3', nom: 'Ligne Est - Matoto/Enta', bus: 'AG-4022-EIEF', chauffeur: 'Ibrahima Bangoura', capacite: 45, inscrits: 38, statut: 'Maintenance', retard: '-' },
    { id: 'L4', nom: 'Navette Spéciale - Primaire', bus: 'AG-5011-EIEF', chauffeur: 'Abdoulaye Sow', capacite: 20, inscrits: 18, statut: 'En route', retard: 'A l\'heure' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="text-left font-bold" onClick={() => setOpenMenuId(null)}>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <Bus className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Transport Scolaire</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Gestion de la flotte, des itinéraires et du ramassage</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => { setSelectedBus(null); setIsMapModalOpen(true); }}
            className="flex gap-3 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-bleu-600/5 group-hover:bg-bleu-600/10 transition-colors" />
            <Activity className="text-bleu-600 dark:text-bleu-400 animate-pulse" size={18} /> 
            Suivi GPS Live
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouvelle ligne
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Véhicules Actifs"
          value="08"
          subtitle="Bus & Mini-bus"
          icon={<Bus />}
          trend={{ value: "Tous opérationnels", direction: "up" }}
          color="bleu"
        />
        <StatCard
          title="Élèves Transportés"
          value={elevesTransport.length.toString()}
          subtitle="Abonnés enregistrés"
          icon={<Users />}
          color="or"
        />
        <StatCard
          title="Recettes (Mars)"
          value="850,000 FGN"
          subtitle="Abonnements perçus"
          icon={<CreditCard />}
          trend={{ value: "+12%", direction: "up" }}
          color="vert"
        />
        <StatCard
          title="État de la Flotte"
          value="92%"
          subtitle="Indice de service"
          icon={<Activity />}
          color="rouge"
        />
      </div>

      {/* TABS CONTROL */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-2">
        {[
          { id: 'lignes', label: 'Lignes & Itinéraires', icon: Navigation },
          { id: 'eleves', label: 'Passagers par Bus', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-t-2xl text-[11px] font-bold uppercase tracking-widest transition-all relative group",
              activeTab === tab.id 
                ? 'text-bleu-600 dark:text-or-400' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <tab.icon size={16} className={cn(activeTab === tab.id ? "text-bleu-600 dark:text-or-400" : "text-gray-400")} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabTransport" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-bleu-600 dark:bg-or-500 rounded-t-full shadow-[0_-2px_6px_rgba(37,99,235,0.2)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {activeTab === 'lignes' ? (
          <motion.div
            key="lignes"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {lignesTransport.map((l, i) => (
              <Card 
                key={i} 
                onClick={() => { setSelectedBus(l); setIsDetailsModalOpen(true); }}
                className="p-0 border-none shadow-soft overflow-hidden group hover:shadow-2xl transition-all duration-500 dark:bg-gray-900/50 dark:backdrop-blur-md relative cursor-pointer"
              >
                <div className={cn(
                  "p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between transition-colors",
                  l.statut === 'En route' ? 'bg-vert-50/50 dark:bg-vert-900/10' : l.statut === 'Maintenance' ? 'bg-rouge-50/50 dark:bg-rouge-900/10' : 'bg-gray-50/50 dark:bg-white/5'
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-transform group-hover:scale-110",
                      l.statut === 'En route' ? 'text-vert-600' : l.statut === 'Maintenance' ? 'text-rouge-600' : 'text-gray-400'
                    )}>
                      <Bus size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-left font-bold" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-gray-900 dark:text-white line-clamp-1 text-sm">{l.nom}</h3>
                      <p className="text-[11px] text-gray-400 font-semibold italic">{l.bus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={l.statut === 'En route' ? 'success' : l.statut === 'Maintenance' ? 'error' : 'default'} className="text-[9px] font-bold px-3 py-1 border-none shadow-sm h-6 uppercase">
                      {l.statut}
                    </Badge>
                    <Popover
                      isOpen={openMenuId === l.id}
                      onClose={() => setOpenMenuId(null)}
                      trigger={
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === l.id ? null : l.id); }}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400"
                        >
                          <MoreVertical size={16} />
                        </button>
                      }
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2 min-w-[200px] text-left">
                        <button 
                          onClick={() => { setSelectedBus(l); setIsMapModalOpen(true); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Navigation2 size={16} className="text-bleu-600" /> Géolocaliser Bus
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                          <Edit size={16} className="text-or-600" /> Modifier Ligne
                        </button>
                        <div className="h-px bg-gray-50 dark:bg-white/5 my-1 mx-2" />
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
                          <Trash2 size={16} /> Supprimer Ligne
                        </button>
                      </div>
                    </Popover>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-transparent space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                      <MapPin size={16} className="text-or-500" />
                      Arrêt principal : <span className="text-gray-900 dark:text-white ml-1">{l.id}</span>
                    </div>
                    {l.retard !== '-' && (
                      <Badge variant={l.retard === 'A l\'heure' ? 'success' : 'warning'} className="text-[8px] h-5 px-2 border-none">
                        <Clock size={10} className="mr-1" /> {l.retard}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-left font-bold">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Chauffeur assigné</p>
                      <div className="flex items-center gap-2">
                        <Avatar name={l.chauffeur} size="sm" />
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{l.chauffeur}</p>
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Taux d'occupation</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{Math.round((l.inscrits / l.capacite) * 100)}% <span className="text-[9px] text-gray-400 font-medium">({l.inscrits}/{l.capacite})</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(l.inscrits / l.capacite) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          (l.inscrits / l.capacite) > 0.9 ? 'bg-rouge-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-gradient-to-r from-bleu-600 to-bleu-400 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                        )}
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full p-4 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-bleu-600 dark:hover:text-or-400 hover:bg-bleu-50 dark:hover:bg-white/10 transition-all border-t border-gray-100 dark:border-white/5">
                  <span className="flex items-center gap-2"><History size={14} /> Historique des rotations</span>
                  <ChevronRight size={16} />
                </button>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="eleves"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {elevesTransport.map((e, i) => (
              <Card key={i} className="p-5 border-none shadow-soft flex items-center justify-between hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size="md" />
                  <div className="text-left font-bold">
                    <p className="text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-bleu-600 transition-colors">{e.firstName} {e.lastName}</p>
                    <div className="flex items-center gap-2 text-gray-400 font-semibold text-[10px] uppercase tracking-widest italic">
                      <Bus size={12} className="text-or-500" /> {lignesTransport[i % 4].nom.split('-')[1].trim()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant="info" className="text-[9px] font-bold px-2 py-0.5 border-none shadow-sm">{e.classe}</Badge>
                   <div className="text-[9px] text-vert-500 font-bold flex items-center gap-1">
                     <CheckCircle2 size={10} /> À bord
                   </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 shadow-inner">
              <Bus size={22} />
            </div>
            <span className="tracking-tight gradient-bleu-or-text text-xl">Nouvelle ligne de transport</span>
          </div>
        }
      >
        <div className="space-y-6 text-left font-bold uppercase tracking-widest">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nom de la ligne" placeholder="ex: Ligne Ouest - Kipé/Boulbinet" />
            <Input label="Immatriculation Bus" placeholder="ex: AG-6044-EIEF" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nom du Chauffeur" placeholder="Nom complet" />
            <Select 
              label="Capacité (Places)" 
              options={[20, 28, 32, 45].map(v => ({ value: v.toString(), label: `${v} Places` }))} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="px-8 h-12 rounded-xl text-[10px] font-bold">Annuler</Button>
            <Button className="bg-bleu-600 text-white px-8 h-12 rounded-xl text-[10px] font-bold" onClick={() => { setIsAddModalOpen(false); setIsSuccess(true); setTimeout(() => setIsSuccess(false), 3000); }}>Créer la ligne</Button>
          </div>
        </div>
      </Modal>

      {/* LINE DETAILS MODAL */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner">
              <Bus size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">{selectedBus?.nom || 'Détails de la ligne'}</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Identifiant : {selectedBus?.id || '-'}</p>
            </div>
          </div>
        }
      >
        <div className="space-y-8 py-2 overflow-hidden">
          {/* TOP INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-bleu-100 dark:bg-bleu-900/20 rounded-xl text-bleu-600">
                    <Users size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-bold">Chauffeur</p>
                </div>
                <div className="flex items-center gap-3">
                   <Avatar name={selectedBus?.chauffeur} size="sm" />
                   <div>
                     <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedBus?.chauffeur}</p>
                     <p className="text-[10px] text-gray-500 font-semibold italic">+224 620 XX XX XX</p>
                   </div>
                </div>
            </Card>

            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-or-100 dark:bg-or-900/20 rounded-xl text-or-600">
                    <Settings size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-bold">Véhicule</p>
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{selectedBus?.bus}</p>
                   <Badge variant="success" className="text-[8px] font-bold px-2 border-none">Conforme</Badge>
                </div>
            </Card>

            <Card className="p-4 border-none bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-vert-100 dark:bg-vert-900/20 rounded-xl text-vert-600">
                    <Activity size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-bold">Occupation</p>
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{selectedBus?.inscrits} / {selectedBus?.capacite} Élèves</p>
                   <div className="w-full h-1 bg-gray-500/10 rounded-full overflow-hidden">
                     <div className="h-full bg-vert-500" style={{ width: `${(selectedBus?.inscrits / selectedBus?.capacite) * 100}%` }} />
                   </div>
                </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5 px-1">
                 <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Plan de Route</h3>
                 <button onClick={() => { setIsDetailsModalOpen(false); setIsMapModalOpen(true); }} className="text-bleu-600 dark:text-or-400 text-[10px] font-bold flex items-center gap-2 hover:underline">
                   <MapPin size={12} /> Voir sur la carte
                 </button>
              </div>
              <div className="relative space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-2 text-left">
                 {stops.map((stop, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all group">
                     <div className="flex items-center gap-4 text-left">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold",
                          stop.status === 'passed' ? "bg-gray-100 text-gray-400" :
                          stop.status === 'current' ? "bg-bleu-100 text-bleu-600" : "bg-white dark:bg-gray-800 text-gray-400"
                        )}>
                          0{idx + 1}
                        </div>
                        <div className="text-left font-bold">
                           <p className={cn("text-xs transition-colors", stop.status === 'current' ? "text-bleu-600" : "text-gray-900 dark:text-white")}>{stop.name}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic leading-none">{stop.time}</p>
                        </div>
                     </div>
                     <div className={cn(
                        "w-2 h-2 rounded-full",
                        stop.status === 'passed' ? "bg-gray-300" : stop.status === 'current' ? "bg-bleu-600 animate-pulse" : "bg-gray-200 dark:bg-white/10"
                     )} />
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5 px-1">
                 <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Passagers Assignés</h3>
                 <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-none font-bold text-[9px]">{selectedBus?.inscrits || 0} Élèves</Badge>
              </div>
              <div className="relative space-y-3 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
                 {elevesTransport.slice(0, 5).map((e, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm group hover:border-bleu-500/30 transition-all">
                     <div className="flex items-center gap-3">
                        <Avatar name={`${e.firstName} ${e.lastName}`} size="sm" />
                        <div className="text-left font-bold">
                           <p className="text-xs text-gray-900 dark:text-white leading-tight">{e.firstName} {e.lastName}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{e.classe}</p>
                        </div>
                     </div>
                     <Badge variant="info" className="text-[8px] font-bold px-2 h-5 border-none">À bord</Badge>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
             <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => setIsDetailsModalOpen(false)}>Fermer</Button>
             <div className="flex flex-1 gap-2">
                <Button className="flex-1 h-12 bg-or-500 text-gray-900 shadow-lg shadow-or-500/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-or-600 border-none">
                  Appeler Chauffeur
                </Button>
                <Button className="h-12 w-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 rounded-2xl flex items-center justify-center p-0">
                  <FileText size={18} />
                </Button>
             </div>
          </div>
        </div>
      </Modal>

      {/* GPS TRACKING MODAL */}
      <Modal 
        isOpen={isMapModalOpen} 
        onClose={() => setIsMapModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner">
              <Navigation2 size={24} className="animate-pulse" />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Suivi GPS en temps réel</h2>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                {selectedBus ? `Ligne active : ${selectedBus.nom}` : 'Vue d\'ensemble de la flotte'}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-8 py-2">
          {/* SIMULATED MAP INTERFACE */}
          <div className="relative aspect-video rounded-[2rem] bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-white/5 shadow-2xl overflow-hidden group">
            {/* Background elements to simulate map */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-bleu-600/5 to-transparent" />
            
            {/* Simulated Path (SVG) */}
            <svg className="absolute inset-0 w-full h-full p-12" viewBox="0 0 800 400" fill="none">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
                d="M50 300 C 150 100, 350 400, 450 150 C 550 50, 750 250, 750 100" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                className="text-bleu-600/20 dark:text-bleu-400/10"
              />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.6 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                d="M50 300 C 150 100, 350 400, 450 150 C 550 50, 750 250, 750 100" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeDasharray="8 12"
                strokeLinecap="round" 
                className="text-bleu-600 dark:text-or-400"
              />
            </svg>

            {/* BUS ICON ON MAP */}
            <motion.div 
              animate={{ 
                x: [100, 150, 300, 400, 380],
                y: [280, 150, 320, 180, 160],
              }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              className="absolute z-20"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-bleu-600/30 rounded-full animate-ping" />
                <div className="bg-bleu-600 text-white p-3 rounded-2xl shadow-2xl relative border-2 border-white dark:border-gray-900 group-hover:scale-125 transition-transform">
                  <Bus size={20} />
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-lg border border-gray-100 dark:border-white/10 whitespace-nowrap">
                   <p className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">{selectedBus?.bus || 'AG-1029-EIEF'}</p>
                </div>
              </div>
            </motion.div>

            {/* MAP STOPS markers */}
            <div className="absolute inset-0 p-12 flex items-center justify-between pointer-events-none">
               <div className="absolute left-[8%] bottom-[25%] w-3 h-3 bg-white border-2 border-bleu-600 rounded-full shadow-lg" title="Station Sud" />
               <div className="absolute left-[38%] bottom-[12%] w-4 h-4 bg-bleu-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-white" title="Station Centrale" />
               <div className="absolute right-[8%] top-[20%] w-3 h-3 bg-white border-2 border-rouge-600 rounded-full shadow-lg" title="Campus EIEF" />
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-vert-500 animate-pulse" />
                <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest leading-none">
                  Vitesse : 42 km/h <span className="mx-2 opacity-30">|</span> Direction : {selectedBus?.id || 'L1'} Campus
                </p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl flex items-center gap-3 text-right">
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Prochain arrêt</p>
                  <p className="text-[10px] text-gray-900 dark:text-white font-bold uppercase tracking-widest">Kipé Centre (5 min)</p>
                </div>
              </div>
            </div>
          </div>

          {/* STOPS LIST */}
          <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
             <div className="flex items-center justify-between mb-6 px-2">
               <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Feuille de Route & Ponctualité</h3>
               <Badge className="bg-vert-100 text-vert-700 border-none font-bold text-[9px] px-3 py-1">En avance de 2 min</Badge>
             </div>
             
             <div className="flex items-center justify-between relative px-2 overflow-x-auto no-scrollbar gap-8">
                {/* Visual line in bg */}
                <div className="absolute left-10 right-10 top-5 h-0.5 bg-gray-100 dark:bg-white/5" />
                
                {stops.map((stop, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center min-w-[100px] group">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      stop.status === 'passed' ? "bg-bleu-50 text-bleu-600 border-bleu-100" :
                      stop.status === 'current' ? "bg-bleu-600 text-white border-white shadow-xl scale-110" :
                      stop.status === 'destination' ? "bg-rouge-50 text-rouge-600 border-rouge-100" :
                      "bg-white dark:bg-gray-800 text-gray-300 border-gray-100 dark:border-white/5"
                    )}>
                      {stop.status === 'passed' ? <CheckCircle2 size={16} /> :
                       stop.status === 'current' ? <MapPin size={18} className="animate-bounce" /> :
                       stop.status === 'destination' ? <Navigation2 size={16} /> :
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                    </div>
                    <div className="mt-3 text-center">
                       <p className={cn(
                         "text-[9px] font-bold uppercase tracking-tighter transition-colors mb-0.5",
                         stop.status === 'current' ? "text-bleu-600" : "text-gray-400"
                       )}>{stop.name}</p>
                       <p className="text-[10px] font-bold text-gray-900 dark:text-white">{stop.time}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-white/5">
             <Button variant="outline" className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest rounded-2xl" onClick={() => setIsMapModalOpen(false)}>Fermer l'aperçu</Button>
             <Button className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-600/20 text-[10px] font-bold uppercase tracking-widest rounded-2xl">
               Partager l'accès GPS aux parents
             </Button>
          </div>
        </div>
      </Modal>

      {/* SUCCESS MESSAGE */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-base tracking-tight">Opération accomplie !</p>
                <p className="text-[12px] text-white/80 font-semibold italic">Le plan de transport a été mis à jour.</p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminTransport;
