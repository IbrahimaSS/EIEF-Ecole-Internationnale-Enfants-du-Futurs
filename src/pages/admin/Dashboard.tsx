import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  BookOpen, 
  ShoppingBag, 
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '../../components/ui';

// Importation des données pour calculs réels
import elevesData from '../../data/eleves.json';
import enseignantsData from '../../data/enseignants.json';
import paiementsData from '../../data/paiements.json';
import produitsData from '../../data/produits.json';

const AdminDashboard: React.FC = () => {
  // Calculs dynamiques
  const totalEleves = elevesData.length;
  const totalEnseignants = enseignantsData.length;
  const totalRecettes = paiementsData.reduce((acc, curr) => acc + curr.montantPaye, 0);
  const stockCritique = produitsData.filter(p => p.stock <= p.stockMin).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER DE PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black gradient-bleu-or-text uppercase tracking-tighter">Tableau de Bord</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aperçu stratégique de l'EIEF | Bienvenue, Ibrahima</p>
        </div>
      </div>

      {/* SECTION KPIs PRINCIPAUX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Effectif Élèves"
          value={totalEleves.toString()}
          subtitle="Inscrits cette année"
          icon={<GraduationCap />}
          color="bleu"
          trend={{ value: "+2", direction: "up" }}
        />
        <StatCard
          title="Corps Enseignant"
          value={totalEnseignants.toString()}
          subtitle="Personnel actif"
          icon={<Users />}
          color="vert"
        />
        <StatCard
          title="Recettes (Mars)"
          value={formatCurrency(totalRecettes)}
          subtitle="Encaissements"
          icon={<Wallet />}
          color="or"
          trend={{ value: "87%", direction: "up" }}
        />
        <StatCard
          title="Alertes Stock"
          value={stockCritique.toString()}
          subtitle="Articles à commander"
          icon={<AlertCircle />}
          color="rouge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE: ACTIVITÉS RÉCENTES */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-soft p-0 overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-transparent">
              <h3 className="font-black gradient-bleu-or-text uppercase tracking-tight flex items-center gap-2">
                <Clock className="text-bleu-600 dark:text-bleu-400" size={20} />
                Derniers Flux Financiers
              </h3>
              <Button variant="outline" className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 h-auto dark:border-white/10 dark:text-white">Voir tout</Button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent">
              {paiementsData.slice(0, 4).map((p, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-vert-100 dark:group-hover:bg-vert-900/30 group-hover:text-vert-600 dark:group-hover:text-vert-400 transition-colors">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{p.eleveNom}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tight">{p.service} • {p.methode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 dark:text-white text-sm">{formatCurrency(p.montantPaye)}</p>
                    <Badge variant="success" className="text-[9px] py-0 px-2 font-black uppercase">Validé</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* VUE RAPIDE STOCK CRITIQUE */}
          <Card className="border-none shadow-soft p-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-or-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 text-left">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 gradient-bleu-or-text">
                <ShoppingBag className="text-or-400" size={24} />
                Réapprovisionnement Urgent
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {produitsData.filter(p => p.stock <= p.stockMin).slice(0, 4).map((p, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div>
                      <p className="text-sm font-black text-white mb-0.5 group-hover:text-or-400 transition-colors">{p.nom}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{p.categorie}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-or-400">{p.stock} unités</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Seuil: {p.stockMin}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* COLONNE DROITE: ACTIONS & ETAT SYSTEME */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
            <h3 className="font-black gradient-bleu-or-text uppercase tracking-tight mb-6">Raccourcis Stratégiques</h3>
            <div className="space-y-3">
              {[
                { label: "Nouveau Dossier Élève", icon: GraduationCap, color: "bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600 dark:text-bleu-400" },
                { label: "Émettre Facture Scolarité", icon: Wallet, color: "bg-vert-100 dark:bg-vert-900/30 text-vert-600 dark:text-vert-400" },
                { label: "Rapport Bibliothèque", icon: BookOpen, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
                { label: "Annonce aux Parents", icon: AlertCircle, color: "bg-or-100 dark:bg-or-900/30 text-or-600 dark:text-or-400" },
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${action.color}`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{action.label}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </Card>

          <Card variant="glass" className="p-6 border-bleu-100/50 dark:border-white/5 dark:bg-gray-900/50">
            <h3 className="text-[10px] font-black gradient-bleu-or-text uppercase tracking-[0.2em] mb-6">État de la plateforme</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-black uppercase text-gray-400 tracking-wider">
                  <span>Intégrité des données</span>
                  <span className="text-vert-600">100% stable</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-vert-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-black uppercase text-gray-400 tracking-wider">
                  <span>Recouvrement vs Objectif</span>
                  <span className="text-or-600">87% atteint</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[87%] h-full bg-or-500 shadow-[0_0_10px_rgba(249,168,37,0.3)]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
