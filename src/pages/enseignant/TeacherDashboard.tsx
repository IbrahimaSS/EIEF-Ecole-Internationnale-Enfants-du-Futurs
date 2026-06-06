import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  CheckSquare,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { Card, StatCard, Badge, Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { teacherService } from "../../services/teacherService";
import { TeacherDashboardResponse } from "../../types/academic";

const EnseignantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<TeacherDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !user?.id) return;
      try {
        const data = await teacherService.getDashboard(user.id);
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchDashboardData();
  }, [token, user?.id]);

  const quickActions = useMemo(
    () => [
      {
        id: "ressource",
        title: "Ajouter une ressource",
        desc: "Publier un support ou un document pour vos classes",
        actionLabel: "Ouvrir ressources",
        onClick: () => navigate("/enseignant/ressources"),
        color: "bg-or-500 shadow-lg shadow-or-500/20",
        icon: <PlusCircle size={16} />,
      },
      {
        id: "communication",
        title: "Message au parent",
        desc: "Accéder à la communication pour envoyer votre message",
        actionLabel: "Ouvrir communication",
        onClick: () => navigate("/enseignant/communication"),
        color: "bg-indigo-500 shadow-lg shadow-indigo-500/20",
        icon: <MessageSquare size={16} />,
      },
    ],
    [navigate],
  );

  const unreadMessages = quickActions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 text-left"
    >
      {/* ── Hero bienvenue ─────────────────────────────────────────────────── */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-bleu-900 via-indigo-900 to-purple-900 p-8 sm:p-10 shadow-2xl">
        {/* Décorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-bleu-400/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-5">
              <Sparkles size={13} className="text-or-400" />
              <span className="text-[11px] font-bold tracking-wide">Espace Enseignant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
              Bonjour, {user?.firstName} ! 👋
            </h1>
            <p className="text-sm font-semibold text-white/75 max-w-lg leading-relaxed">
              Bienvenue sur votre tableau de bord. Retrouvez vos classes, votre emploi du temps et communicez avec les familles depuis cet espace.
            </p>
          </div>

          {/* Mini stats hero */}
          <div className="flex gap-3 shrink-0">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-5 py-4 text-center min-w-[100px]">
              <p className="text-2xl font-black text-or-400">
                {isLoading ? "…" : stats?.classCount ?? 0}
              </p>
              <p className="text-[10px] font-bold text-white/70 mt-1">Classes</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-5 py-4 text-center min-w-[100px]">
              <p className="text-2xl font-black text-vert-400">
                {isLoading ? "…" : stats?.totalStudents ?? 0}
              </p>
              <p className="text-[10px] font-bold text-white/70 mt-1">Élèves</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-5 py-4 text-center min-w-[100px]">
              <p className="text-2xl font-black text-cyan-400">
                {isLoading ? "…" : `${stats?.hoursThisWeek ?? 0}h`}
              </p>
              <p className="text-[10px] font-bold text-white/70 mt-1">Cette semaine</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI StatCards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Classes & Groupes"
          value={isLoading ? "..." : stats?.classCount.toString() || "0"}
          icon={<Users size={24} />}
          trend={{ value: "+0%", direction: "up" }}
          subtitle="Classes actives"
          color="bleu"
        />
        <StatCard
          title="Total Élèves"
          value={isLoading ? "..." : stats?.totalStudents.toString() || "0"}
          icon={<BookOpen size={24} />}
          trend={{ value: "+0%", direction: "up" }}
          subtitle="Élèves suivis"
          color="or"
        />
        <StatCard
          title="Moyenne Générale"
          value={isLoading ? "..." : stats?.averageGrade.toFixed(1) || "0.0"}
          icon={<TrendingUp size={24} />}
          trend={{ value: "+0%", direction: "up" }}
          subtitle="Données du service"
          color="vert"
        />
        <StatCard
          title="Heures cette semaine"
          value={isLoading ? "..." : `${stats?.hoursThisWeek || 0}h`}
          icon={<Clock size={24} />}
          trend={{ value: "+0h", direction: "up" }}
          subtitle="Charge planifiée"
          color="rouge"
        />
      </div>

      {/* ── Emploi du temps + Actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Emploi du temps du jour */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-or-500" size={18} /> Mon emploi du temps
            </h2>
            <p className="text-[11px] font-semibold text-gray-400">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <div className="p-20 text-center text-gray-400 font-bold">
                  Chargement de l'emploi du temps…
                </div>
              ) : stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                stats.todaySchedule.map((course) => (
                  <div
                    key={course.id}
                    className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors group cursor-pointer ${
                      course.status === "current"
                        ? "bg-bleu-50/50 dark:bg-bleu-900/10"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[120px] border ${
                          course.status === "current"
                            ? "bg-bleu-100 border-bleu-200 text-bleu-700 dark:bg-bleu-900/30 dark:border-bleu-800"
                            : "bg-white border-gray-100 text-gray-900 dark:bg-gray-800 dark:border-white/10 dark:text-gray-300"
                        }`}
                      >
                        <span className="text-[12px] font-bold">
                          {course.startTime} - {course.endTime}
                        </span>
                      </div>

                      <div className="text-left font-bold">
                        <h3
                          className={`text-lg tracking-tight ${
                            course.status === "current"
                              ? "text-bleu-600 dark:text-bleu-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {course.subjectName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-gray-500 font-semibold">
                            {course.className}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span className="text-[11px] text-or-600 dark:text-or-400 font-semibold">
                            {course.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {course.status === "current" ? (
                        <Button
                          onClick={() => navigate("/enseignant/classes")}
                          className="bg-bleu-600 text-white h-10 px-6 text-[11px] font-bold border-none shadow-lg shadow-bleu-500/20 rounded-xl"
                        >
                          Faire l'appel
                        </Button>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 text-[10px] font-semibold border-none dark:bg-white/10">
                          Programmé
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-gray-400 font-bold">
                  Aucun cours prévu pour aujourd'hui.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Actions rapides + messagerie */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-bleu-500" size={18} /> Actions rapides
          </h2>

          <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
            <div className="divide-y divide-gray-50 dark:divide-white/5 p-2">
              {quickActions.map((task) => (
                <div
                  key={task.id}
                  onClick={task.onClick}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl text-white ${task.color}`}>
                        {task.icon}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                          {task.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400">
                      {task.actionLabel}
                    </span>
                    <span className="text-or-600 dark:text-or-400 group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-bleu-900 to-indigo-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <MessageSquare size={120} className="-mr-6 -mt-6" />
            </div>
            <div className="relative z-10 text-left">
              <h3 className="text-sm font-bold mb-1 opacity-90">
                Messages Non Lus
              </h3>
              <p className="text-3xl font-black tracking-tight mb-4 text-or-400">
                {unreadMessages}
              </p>
              <Button
                onClick={() => navigate("/enseignant/communication")}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-none font-bold text-[11px] h-10 shadow-none backdrop-blur-md"
              >
                Ouvrir la messagerie
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default EnseignantDashboard;
