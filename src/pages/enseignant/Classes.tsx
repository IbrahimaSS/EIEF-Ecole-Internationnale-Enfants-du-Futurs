import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Search,
  MapPin,
  TrendingUp,
  ChevronRight,
  Activity,
  FileSpreadsheet,
  Award,
  Calendar,
} from "lucide-react";
import {
  Card,
  Input,
  Button,
  Badge,
  Modal,
  Avatar,
} from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { teacherService } from "../../services/teacherService";
import {
  TeacherClassDetailResponse,
  TeacherStudentResponse,
} from "../../types/academic";

const EnseignantClasses: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<TeacherClassDetailResponse[]>([]);
  const [students, setStudents] = useState<TeacherStudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (token && user?.id) {
        try {
          const data = await teacherService.getClasses(user.id);
          setClasses(data);
        } catch (error) {
          console.error("Erreur lors du chargement des classes:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClasses();
  }, [token, user?.id]);

  const handleFetchStudents = async (classId: string, subjectId: string) => {
    setSelectedClass(classId);
    setIsLoadingStudents(true);
    try {
      const data = await teacherService.getClassStudents(classId, subjectId);
      setStudents(data);
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedClassData = classes.find((c) => c.classId === selectedClass);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8 text-left"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <Users size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">
              Mes Classes
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Gérez vos listes et suivez vos groupes d'élèves
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une classe..."
            className="w-full pl-10 h-12 rounded-2xl bg-white dark:bg-gray-900/50 border-gray-100 dark:border-white/5 font-semibold text-sm"
          />
        </div>
      </div>

      {/* CLASSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold">
            Chargement de vos classes...
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <Card
              key={`${cls.classId}-${cls.subjectId}`}
              className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft dark:bg-gray-900/50 hover:shadow-lg transition-all group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-bleu-50 text-bleu-700 dark:bg-bleu-900/30 dark:text-bleu-400 border-none font-bold text-[10px]">
                    {cls.level || "Niveau"}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <MapPin size={12} /> {cls.room || "N/A"}
                  </div>
                </div>

                <div className="mb-6 text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {cls.className}
                  </h3>
                  <p className="text-sm font-semibold text-or-600 dark:text-or-400">
                    {cls.subjectName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-left">
                    <p className="text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <Users size={12} /> Effectif
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      {cls.studentCount}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-left">
                    <p className="text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <TrendingUp size={12} /> Moyenne
                    </p>
                    <p className="text-lg font-black text-bleu-600 dark:text-bleu-400">
                      {cls.classAverage}
                      <span className="text-[10px] text-gray-400 font-semibold">
                        /20
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 p-3 bg-gray-50 dark:bg-white/5 grid grid-cols-1 gap-2">
                <Button
                  onClick={() => handleFetchStudents(cls.classId, cls.subjectId)}
                  variant="outline"
                  className="w-full h-10 text-[11px] font-bold rounded-xl border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800"
                >
                  Liste des élèves
                </Button>
                <Button
                  onClick={() => navigate("/enseignant/notes")}
                  className="w-full h-10 text-[11px] font-bold rounded-xl bg-bleu-600 text-white border-none shadow-md shadow-bleu-500/20 hover:scale-[1.02]"
                >
                  Saisir les notes
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {!isLoading && filteredClasses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
            <Search size={32} className="text-gray-300 dark:text-white/20" />
          </div>
          <p className="text-lg font-bold text-gray-500">
            Aucune classe trouvée
          </p>
          <p className="text-sm font-semibold text-gray-400">
            Essayez de modifier votre recherche.
          </p>
        </div>
      )}

      {/* MODAL LISTE D'ÉLÈVES */}
      <Modal
        isOpen={selectedClass !== null}
        onClose={() => setSelectedClass(null)}
        size="xl"
        title={
          selectedClassData ? (
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-or-100 dark:bg-or-900/30 rounded-2xl text-or-600 shadow-inner">
                <BookOpen size={24} />
              </div>
              <div className="text-left font-bold tracking-tight">
                <h2 className="text-xl gradient-bleu-or-text">
                  {selectedClassData.className}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">
                    {selectedClassData.subjectName}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span className="text-[12px] text-gray-500 font-semibold">
                    {selectedClassData.studentCount} Élèves
                  </span>
                </div>
              </div>
            </div>
          ) : (
            "Détails de la classe"
          )
        }
      >
        <div className="space-y-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-bleu-50 dark:bg-bleu-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400 uppercase tracking-widest mb-1">
                Moyenne Classe
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {selectedClassData?.classAverage}
                <span className="text-sm text-gray-400">/20</span>
              </p>
            </Card>
            <Card className="p-4 bg-vert-50 dark:bg-vert-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-vert-600 dark:text-vert-400 uppercase tracking-widest mb-1">
                Taux Présence
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                96<span className="text-sm text-gray-400">%</span>
              </p>
            </Card>
            <Card className="p-4 bg-rouge-50 dark:bg-rouge-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-rouge-600 dark:text-rouge-400 uppercase tracking-widest mb-1">
                Devoirs en retard
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                0<span className="text-sm text-gray-400"></span>
              </p>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg text-left">
              Liste des élèves
            </h3>
            <Button className="h-9 px-4 text-[11px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center gap-2">
              <FileSpreadsheet size={14} className="text-green-600" /> Exporter
              (Excel)
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-gray-900/50">
            {isLoadingStudents ? (
              <div className="py-20 text-center text-gray-400 font-bold">
                Chargement de la liste...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Élève
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Moyenne
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Absences
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {students.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} size="sm" />
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-black ${student.average < 10 ? "text-rouge-500" : "text-gray-900 dark:text-white"}`}
                        >
                          {student.average}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-[12px] font-bold ${student.absenceCount > 3 ? "text-rouge-500 bg-rouge-50 dark:bg-rouge-500/10 px-2 py-1 rounded-md" : "text-gray-500"}`}
                        >
                          {student.absenceCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {student.average >= 16 && (
                          <Badge
                            variant="success"
                            className="text-[10px] font-bold border-none"
                          >
                            <Award size={10} className="mr-1" /> Excellent
                          </Badge>
                        )}
                        {student.average >= 12 && student.average < 16 && (
                          <Badge className="bg-bleu-50 text-bleu-600 text-[10px] font-bold border-none">
                            Bon niveau
                          </Badge>
                        )}
                        {student.average >= 10 && student.average < 12 && (
                          <Badge className="bg-gray-100 text-gray-600 text-[10px] font-bold border-none">
                            Moyen
                          </Badge>
                        )}
                        {student.average < 10 && (
                          <Badge
                            variant="error"
                            className="text-[10px] font-bold border-none"
                          >
                            <Activity size={10} className="mr-1" /> En
                            difficulté
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default EnseignantClasses;
