import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Wallet,
  AlertCircle, BookOpen, ShoppingBag, Clock, ArrowRight,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { StatCard, Card, Badge, Button } from '../../components/ui';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useAdminDashboard();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-or-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium text-sm">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
          <p className="text-red-600 dark:text-red-400 font-semibold">{error || 'Données indisponibles'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-semibold text-or-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold gradient-bleu-or-text">Tableau de Bord</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Aperçu stratégique de l'EIEF | Bienvenue, Administrateur !
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Effectif Élèves"
          value={data.totalStudents.toString()}
          subtitle="Inscrits cette année"
          icon={<GraduationCap />}
          color="bleu"
        />
        <StatCard
          title="Corps Enseignant"
          value={data.totalTeachers.toString()}
          subtitle="Personnel actif"
          icon={<Users />}
          color="vert"
        />
        <StatCard
          title="Recettes Totales"
          value={formatCurrency(data.totalRevenue)}
          subtitle="Encaissements cumulés"
          icon={<Wallet />}
          color="or"
          trend={{
            value: formatCurrency(data.netResult),
            direction: data.netResult >= 0 ? "up" : "down"
          }}
        />
        <StatCard
          title="Paiements en Attente"
          value={data.pendingPayments.toString()}
          subtitle="À traiter"
          icon={<AlertCircle />}
          color="rouge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-2 space-y-6">

          {/* RÉPARTITION DES RECETTES */}
          <Card className="border-none shadow-soft p-0 overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-transparent">
              <h3 className="font-semibold gradient-bleu-or-text flex items-center gap-2">
                <Clock className="text-bleu-600 dark:text-bleu-400" size={20} />
                Répartition des Recettes
              </h3>
              <Button variant="outline" className="text-[10px] font-semibold px-3 py-1.5 h-auto dark:border-white/10 dark:text-white">
                Voir tout
              </Button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-transparent">
              {[
                { label: 'Scolarité', montant: data.tuitionRevenue },
                { label: 'Cafétéria', montant: data.cafeteriaRevenue },
                { label: 'Transport', montant: data.transportRevenue },
                { label: 'Boutique', montant: data.storeRevenue },
              ].map((item, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-vert-100 dark:group-hover:bg-vert-900/30 group-hover:text-vert-600 dark:group-hover:text-vert-400 transition-colors">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Recette par catégorie</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(item.montant)}</p>
                    <Badge variant="success" className="text-[9px] py-0 px-2 font-semibold">Validé</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* RÉSULTAT NET */}
          <Card className="border-none shadow-soft p-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-or-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 text-left">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 gradient-bleu-or-text">
                <ShoppingBag className="text-or-400" size={24} />
                Synthèse Financière
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Recettes Totales', valeur: data.totalRevenue, sous: 'Tous flux confondus' },
                  { label: 'Dépenses Totales', valeur: data.totalExpenses, sous: 'Charges cumulées' },
                  { label: 'Résultat Net', valeur: data.netResult, sous: 'Recettes - Dépenses' },
                  { label: 'Prêts Actifs', valeur: data.activeLoans, sous: 'En cours', isCount: true },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5 group-hover:text-or-400 transition-colors">{item.label}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{item.sous}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-or-400">
                        {item.isCount ? item.valeur : formatCurrency(item.valeur)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
            <h3 className="font-semibold gradient-bleu-or-text mb-6">Raccourcis Stratégiques</h3>
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
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </Card>

          {/* ÉTAT PLATEFORME */}
          <Card variant="glass" className="p-6 border-bleu-100/50 dark:border-white/5 dark:bg-gray-900/50">
            <h3 className="text-[10px] font-semibold gradient-bleu-or-text mb-6">État de la plateforme</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-semibold text-gray-400">
                  <span>Intégrité des données</span>
                  <span className="text-vert-600">100% stable</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-vert-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-semibold text-gray-400">
                  <span>Recouvrement vs Objectif</span>
                  <span className="text-or-600">
                    {data.totalRevenue > 0
                      ? Math.min(Math.round((data.totalRevenue / (data.totalRevenue + data.pendingPayments || 1)) * 100), 100)
                      : 0}% atteint
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-or-500 shadow-[0_0_10px_rgba(249,168,37,0.3)] transition-all duration-700"
                    style={{
                      width: `${data.totalRevenue > 0
                        ? Math.min(Math.round((data.totalRevenue / (data.totalRevenue + data.pendingPayments || 1)) * 100), 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-semibold text-gray-400">
                  <span>Messages non lus</span>
                  <span className="text-bleu-600">{data.unreadMessages} message(s)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bleu-500 transition-all duration-700"
                    style={{ width: data.unreadMessages > 0 ? '50%' : '0%' }}
                  />
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