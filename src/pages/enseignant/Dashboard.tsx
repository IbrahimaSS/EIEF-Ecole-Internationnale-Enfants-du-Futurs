import React, { useState, useEffect } from "react";
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
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  Card,
  StatCard,
  Badge,
  Button,
  Avatar,
  Modal,
} from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { teacherService } from "../../services/teacherService";
import { TeacherDashboardResponse } from "../../types/academic";

const EnseignantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isAppelModalOpen, setIsAppelModalOpen] = useState(false);
  const [stats, setStats] = useState<TeacherDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pendingTasks = [
    {
      id: 1,
      title: "Saisie des notes",
      desc: "Devoir de Physique (1ère S2)",
      deadline: "Aujourd'hui",
      priority: "high",
    },
    {
      id: 2,
      title: "Faire l'appel",
      desc: "Cours en cours (1ère S2)",
      deadline: "Maintenant",
      priority: "urgent",
    },
    {
      id: 3,
      title: "Message au parent",
      desc: "Concernant l'absence de Diallo",
      deadline: "Demain",
      priority: "medium",
    },
  ];

  // Fausse liste d'élèves pour l'appel
  const [students, setStudents] = useState([
    { id: 1, name: "Amadou Diallo", status: "present" },
    { id: 2, name: "Aïssatou Barry", status: "present" },
    { id: 3, name: "Mamadou Sow", status: "absent" },
    { id: 4, name: "Fatoumata Camara", status: "late" },
    { id: 5, name: "Ibrahim Sylla", status: "present" },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (token && user?.id) {
        try {
          const data = await teacherService.getDashboard(user.id);
          setStats(data);
        } catch (error) {
          console.error("Erreur lors du chargement du dashboard:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [token, user?.id]);

  const updateStudentStatus = (id: number, status: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleValidationAppel = () => {
    setIsAppelModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 text-left"
    >
      {/* HEADER SECTION */}
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
            onClick={() => setIsAppelModalOpen(true)}
            className="bg-gradient-to-r from-or-600 to-or-400 text-gray-900 shadow-lg shadow-or-500/20 text-[12px] font-bold px-8 h-12 rounded-[1rem] hover:scale-[1.02] flex items-center gap-2 border-none"
          >
            <CheckSquare size={16} /> Faire l'appel rapide
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
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
          trend={{ value: "+2%", direction: "up" }}
          subtitle="Présence moy."
          color="or"
        />
        <StatCard
          title="Moyenne Générale"
          value={isLoading ? "..." : stats?.averageGrade.toFixed(1) || "0.0"}
          icon={<TrendingUp size={24} />}
          trend={{ value: "+5%", direction: "up" }}
          subtitle="vs Semestre 1"
          color="vert"
        />
        <StatCard
          title="Heures cette semaine"
          value={isLoading ? "..." : `${stats?.hoursThisWeek || 0}h`}
          icon={<Clock size={24} />}
          trend={{ value: "-4h", direction: "down" }}
          subtitle="Sur le planning"
          color="rouge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* SCHEDULE SECTION (Left 2 cols) */}
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
                    className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors group cursor-pointer 
                        ${course.status === "current" ? "bg-bleu-50/50 dark:bg-bleu-900/10" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
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
                          className={`text-lg tracking-tight ${course.status === "current" ? "text-bleu-600 dark:text-bleu-400" : "text-gray-900 dark:text-white"}`}
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
                      {course.status === "current" && (
                        <Button
                          onClick={() => setIsAppelModalOpen(true)}
                          className="bg-bleu-600 text-white h-10 px-6 text-[11px] font-bold border-none shadow-lg shadow-bleu-500/20 rounded-xl"
                        >
                          Faire l'appel
                        </Button>
                      )}
                      {course.status !== "current" && (
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

        {/* TASKS & QUICK ACTIONS (Right col) */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-bleu-500" size={18} /> Tâches & Rappels
          </h2>

          <Card className="p-0 overflow-hidden border-none shadow-soft dark:bg-gray-900/50">
            <div className="divide-y divide-gray-50 dark:divide-white/5 p-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2.5 rounded-xl text-white ${
                          task.priority === "urgent"
                            ? "bg-rouge-500 shadow-lg shadow-rouge-500/20"
                            : task.priority === "high"
                              ? "bg-or-500 shadow-lg shadow-or-500/20"
                              : "bg-bleu-500 shadow-lg shadow-bleu-500/20"
                        }`}
                      >
                        {task.priority === "urgent" ? (
                          <AlertCircle size={16} />
                        ) : (
                          <CheckSquare size={16} />
                        )}
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
                      {task.deadline}
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
                3
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

      {/* MODAL FAIRE L'APPEL */}
      <Modal
        isOpen={isAppelModalOpen}
        onClose={() => setIsAppelModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl text-bleu-600 shadow-inner">
              <UserCheck size={24} />
            </div>
            <div className="text-left font-bold tracking-tight">
              <h2 className="text-xl gradient-bleu-or-text">Faire l'appel</h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">
                Physique • 1ère S2 • Aujourd'hui
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Effectif total: 5 Élèves
            </span>
            <div className="flex gap-4 text-[11px] font-bold">
              <span className="text-vert-600">
                {students.filter((s) => s.status === "present").length} Présents
              </span>
              <span className="text-rouge-600">
                {students.filter((s) => s.status === "absent").length} Absents
              </span>
              <span className="text-or-600">
                {students.filter((s) => s.status === "late").length} Retards
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl hover:border-bleu-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} size="sm" />
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {student.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStudentStatus(student.id, "present")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${student.status === "present" ? "bg-vert-100 text-vert-700 border border-vert-300 shadow-sm" : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent"}`}
                  >
                    Présent
                  </button>
                  <button
                    onClick={() => updateStudentStatus(student.id, "late")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${student.status === "late" ? "bg-or-100 text-or-700 border border-or-300 shadow-sm" : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent"}`}
                  >
                    Retard
                  </button>
                  <button
                    onClick={() => updateStudentStatus(student.id, "absent")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${student.status === "absent" ? "bg-rouge-100 text-rouge-700 border border-rouge-300 shadow-sm" : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent"}`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAppelModalOpen(false)}
              className="flex-1 h-12 text-[12px] font-bold rounded-[1rem]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidationAppel}
              className="flex-1 h-12 bg-bleu-600 text-white shadow-lg shadow-bleu-500/20 text-[12px] font-bold rounded-[1rem] border-none hover:scale-[1.02]"
            >
              Valider l'appel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default EnseignantDashboard;
