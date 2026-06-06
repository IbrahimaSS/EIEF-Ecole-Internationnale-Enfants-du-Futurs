import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
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
  QrCode,
  IdCard,
  ChevronLeft,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Card, StatCard, Badge, Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { teacherService } from "../../services/teacherService";
import { TeacherDashboardResponse } from "../../types/academic";
import {
  teacherCardService,
  TeacherCardData,
  TeacherMonthlyStats,
  buildTeacherCardPointageUrl,
} from "../../services/teacherCardService";

const MONTH_NAMES_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const EnseignantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<TeacherDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Ma carte professeur ────────────────────────────────────────────────────
  const [card, setCard]         = useState<TeacherCardData | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // ── Stats mensuelles ────────────────────────────────────────────────────────
  const now = new Date();
  const [statsYear,  setStatsYear]  = useState(now.getFullYear());
  const [statsMonth, setStatsMonth] = useState(now.getMonth() + 1); // 1-based
  const [monthlyStats, setMonthlyStats] = useState<TeacherMonthlyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

  // Charger la carte du prof connecté
  useEffect(() => {
    if (!user?.id) return;
    setCardLoading(true);
    teacherCardService.getMyCard(user.id)
      .then(setCard)
      .catch(() => setCard(null))
      .finally(() => setCardLoading(false));
  }, [user?.id]);

  // Générer le QR data-url quand le token change
  useEffect(() => {
    if (!card?.generated || !card.qrToken) { setQrDataUrl(null); return; }
    let cancelled = false;
    void QRCode.toDataURL(buildTeacherCardPointageUrl(card.qrToken), {
      width: 180, margin: 1, errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [card?.generated, card?.qrToken]);

  // Charger les stats du mois sélectionné
  const loadMonthlyStats = useCallback(async (uid: string, year: number, month: number) => {
    setStatsLoading(true);
    try {
      const data = await teacherCardService.getMyMonthlyStats(uid, year, month);
      setMonthlyStats(data);
    } catch {
      setMonthlyStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    void loadMonthlyStats(user.id, statsYear, statsMonth);
  }, [user?.id, statsYear, statsMonth, loadMonthlyStats]);

  const prevMonth = () => {
    if (statsMonth === 1) { setStatsYear(y => y - 1); setStatsMonth(12); }
    else setStatsMonth(m => m - 1);
  };
  const nextMonth = () => {
    const today = new Date();
    if (statsYear > today.getFullYear() || (statsYear === today.getFullYear() && statsMonth >= today.getMonth() + 1)) return;
    if (statsMonth === 12) { setStatsYear(y => y + 1); setStatsMonth(1); }
    else setStatsMonth(m => m + 1);
  };
  const isCurrentMonth = statsYear === now.getFullYear() && statsMonth === now.getMonth() + 1;

  const dashboardTasks = useMemo(
    () => [
      {
        id: "appel",
        title: "Faire l'appel",
        desc:
          stats?.todaySchedule && stats.todaySchedule.length > 0
            ? `${stats.todaySchedule.length} cours planifie(s) aujourd'hui`
            : "Choisir la classe ou vous voulez faire l'appel",
        actionLabel: "Aller dans les classes",
        onClick: () => navigate("/enseignant/classes"),
        color: "bg-bleu-500 shadow-lg shadow-bleu-500/20",
        icon: <CheckSquare size={16} />,
      },
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
        desc: "Acceder a la communication pour envoyer votre message",
        actionLabel: "Ouvrir communication",
        onClick: () => navigate("/enseignant/communication"),
        color: "bg-indigo-500 shadow-lg shadow-indigo-500/20",
        icon: <MessageSquare size={16} />,
      },
    ],
    [navigate, stats?.todaySchedule],
  );

  const unreadMessages = dashboardTasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 text-left"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <BookOpen size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">
              Espace Enseignant
            </h1>
            <p className="text-[14px] text-gray-600 dark:text-gray-300 font-bold mt-1">
              Bonjour, {user?.firstName} !
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/enseignant/classes")}
            className="bg-gradient-to-r from-or-600 to-or-400 text-gray-900 shadow-lg shadow-or-500/20 text-[12px] font-bold px-8 h-12 rounded-[1rem] hover:scale-[1.02] flex items-center gap-2 border-none"
          >
            <CheckSquare size={16} /> Faire l'appel rapide
          </Button>
        </div>
      </div>

      {/* ── Ma carte professeur ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        {/* Carte visuelle */}
        <div className="rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-700 text-white shadow-2xl shadow-purple-900/20">
          {cardLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-white/50">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Chargement de votre carte…</span>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4">
                <img src="/logo_eief.jpeg" alt="EIEF" className="w-12 h-12 rounded-full object-contain bg-white/90 p-1.5" onError={e => (e.currentTarget.style.display = "none")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-purple-200 font-bold">Ma carte professeur</p>
                  <h3 className="text-xl font-black truncate">{user?.firstName} {user?.lastName}</h3>
                </div>
                <Badge variant={card?.generated ? "success" : "default"} className="shrink-0">
                  {card?.generated ? "QR actif" : "À générer"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-6 px-6 py-5">
                <div className="flex gap-5">
                  {/* Avatar */}
                  <div className="w-24 h-28 rounded-3xl overflow-hidden border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                    {card?.avatarUrl || user?.avatarUrl
                      ? <img src={card?.avatarUrl ?? user?.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl font-black text-white/40">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                    }
                  </div>
                  {/* Infos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Matricule</div>
                      <div className="text-sm font-bold mt-1">{card?.employeeNumber ?? "—"}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Matière</div>
                      <div className="text-sm font-bold mt-1">{card?.specialty ?? "—"}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Téléphone</div>
                      <div className="text-sm font-bold mt-1">{card?.phone ?? user?.telephone ?? "—"}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold">Depuis</div>
                      <div className="text-sm font-bold mt-1">
                        {card?.hireDate ? new Date(card.hireDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR code */}
                <div className="rounded-[24px] bg-white flex flex-col items-center justify-center gap-2 px-4 py-4 min-h-[180px]">
                  {card?.generated && qrDataUrl ? (
                    <>
                      <img src={qrDataUrl} alt="QR" className="w-36 h-36 object-contain" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 text-center">Scanner pour pointer</span>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 space-y-2">
                      <QrCode size={38} className="mx-auto opacity-25" />
                      <p className="text-xs font-semibold text-slate-500">QR non généré</p>
                      <p className="text-[10px] text-slate-400">Contactez l'administration</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats mensuelles */}
        <Card className="p-5 border-none shadow-soft dark:bg-gray-900/50 flex flex-col gap-4">
          {/* Sélecteur de mois */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-500">Présences</p>
              <h4 className="text-base font-black text-gray-900 dark:text-white">
                {MONTH_NAMES_FR[statsMonth - 1]} {statsYear}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={nextMonth} disabled={isCurrentMonth}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex-1 flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" /> <span className="text-sm">Chargement…</span>
            </div>
          ) : monthlyStats ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Présents", value: monthlyStats.daysPresent, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
                  { label: "Absences", value: monthlyStats.daysAbsent,  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
                  { label: "Taux",     value: `${monthlyStats.attendanceRate}%`, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
                ].map(k => (
                  <div key={k.label} className={`rounded-2xl px-3 py-3 text-center ${k.color}`}>
                    <div className="text-xl font-black">{k.value}</div>
                    <div className="text-[9px] uppercase tracking-widest font-bold opacity-70 mt-0.5">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Barre de progression */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <span>{monthlyStats.daysPresent} / {monthlyStats.workingDaysInMonth} jours</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{monthlyStats.attendanceRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${monthlyStats.attendanceRate}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  />
                </div>
              </div>

              {/* Mini historique (5 derniers) */}
              {monthlyStats.logs.length > 0 && (
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                  {[...monthlyStats.logs].reverse().slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-center justify-between rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/5 text-xs">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        {new Date(log.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
                      </span>
                      <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {log.checkInTime ? log.checkInTime.slice(0,5) : "—"}
                        </span>
                        <span>→</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {log.checkOutTime ? log.checkOutTime.slice(0,5) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3 text-gray-400">
              <BarChart3 size={32} className="opacity-20" />
              <span className="text-sm font-semibold">Aucun pointage ce mois.</span>
            </div>
          )}
        </Card>
      </div>

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
          title="Total Eleves"
          value={isLoading ? "..." : stats?.totalStudents.toString() || "0"}
          icon={<BookOpen size={24} />}
          trend={{ value: "+0%", direction: "up" }}
          subtitle="Eleves suivis"
          color="or"
        />
        <StatCard
          title="Moyenne Generale"
          value={isLoading ? "..." : stats?.averageGrade.toFixed(1) || "0.0"}
          icon={<TrendingUp size={24} />}
          trend={{ value: "+0%", direction: "up" }}
          subtitle="Donnees du service"
          color="vert"
        />
        <StatCard
          title="Heures cette semaine"
          value={isLoading ? "..." : `${stats?.hoursThisWeek || 0}h`}
          icon={<Clock size={24} />}
          trend={{ value: "+0h", direction: "up" }}
          subtitle="Charge planifiee"
          color="rouge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
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
                  Chargement de l'emploi du temps...
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
                          Programme
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-gray-400 font-bold">
                  Aucun cours prevu pour aujourd'hui.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-bleu-500" size={18} /> Taches & Rappels
          </h2>

          <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
            <div className="divide-y divide-gray-50 dark:divide-white/5 p-2">
              {dashboardTasks.map((task) => (
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
