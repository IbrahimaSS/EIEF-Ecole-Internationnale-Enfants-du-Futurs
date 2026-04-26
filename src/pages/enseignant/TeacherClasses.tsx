import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Search,
  MapPin,
  Activity,
  FileSpreadsheet,
  CheckSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, Input, Button, Badge, Modal, Avatar } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { attendanceService } from "../../services/attendanceService";
import { scheduleService } from "../../services/scheduleService";
import { teacherService } from "../../services/teacherService";
import {
  AttendanceRequest,
  AttendanceResponse,
  TeacherClassDetailResponse,
  TeacherStudentResponse,
} from "../../types/academic";
import { ScheduleResponse } from "../../types/schedule";

type AttendanceStatus = AttendanceRequest["status"];

interface StudentFollowUpRow {
  studentId: string;
  name: string;
  absenceCount: number;
  attendanceRate: number;
  difficultyCount: number;
  status: AttendanceStatus;
  difficultyNote: string;
  attendanceId?: string;
}

const TODAY = new Date().toISOString().split("T")[0];
const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Retard" },
  { value: "EXCUSED", label: "Excuse" },
];

const getStatusStyles = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return "text-vert-600 bg-vert-50 dark:bg-vert-900/10 border-vert-200";
    case "ABSENT":
      return "text-rouge-500 bg-rouge-50 dark:bg-rouge-900/10 border-rouge-200";
    case "LATE":
      return "text-or-600 bg-or-50 dark:bg-or-900/10 border-or-200";
    case "EXCUSED":
      return "text-bleu-600 bg-bleu-50 dark:bg-bleu-900/10 border-bleu-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const computeAttendanceRate = (entries: AttendanceResponse[]) => {
  if (entries.length === 0) {
    return 100;
  }

  const presentLikeCount = entries.filter(
    (entry) =>
      entry.status === "PRESENT" ||
      entry.status === "LATE" ||
      entry.status === "EXCUSED",
  ).length;

  return Math.round((presentLikeCount / entries.length) * 100);
};

const EnseignantClasses: React.FC = () => {
  const { user, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [classes, setClasses] = useState<TeacherClassDetailResponse[]>([]);
  const [students, setStudents] = useState<TeacherStudentResponse[]>([]);
  const [classSchedules, setClassSchedules] = useState<ScheduleResponse[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [followUpRows, setFollowUpRows] = useState<StudentFollowUpRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!token || !user?.id) {
        return;
      }

      try {
        const data = await teacherService.getClasses(user.id);
        setClasses(data);
      } catch (error) {
        console.error("Erreur lors du chargement des classes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchClasses();
  }, [token, user?.id]);

  const handleFetchStudents = async (classId: string, subjectId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId(subjectId);
    setSelectedDate(TODAY);
    setIsLoadingStudents(true);

    try {
      const [studentsData, schedulesData] = await Promise.all([
        teacherService.getClassStudents(classId, subjectId),
        scheduleService.getByClass(classId),
      ]);
      const matchingSchedules = schedulesData.filter(
        (schedule) => schedule.subjectId === subjectId,
      );

      setStudents(studentsData);
      setClassSchedules(matchingSchedules);
      setSelectedScheduleId(matchingSchedules[0]?.id ?? "");
      setFollowUpRows(
        studentsData.map((student) => ({
          studentId: student.studentId,
          name: student.name,
          absenceCount: student.absenceCount,
          attendanceRate: 100,
          difficultyCount: 0,
          status: "PRESENT",
          difficultyNote: "",
        })),
      );
    } catch (error) {
      console.error("Erreur lors du chargement des eleves:", error);
      setStudents([]);
      setClassSchedules([]);
      setSelectedScheduleId("");
      setFollowUpRows([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClassId || !selectedScheduleId || students.length === 0) {
        return;
      }

      setIsLoadingAttendance(true);
      try {
        const entries = await attendanceService.getByScheduleAndDate(
          selectedScheduleId,
          selectedDate,
        );
        const attendanceMap = new Map<string, AttendanceResponse>();
        entries.forEach((entry) => {
          attendanceMap.set(entry.studentId, entry);
        });

        setFollowUpRows((prev) =>
          students.map((student) => {
            const existing = attendanceMap.get(student.studentId);
            const previousRow = prev.find(
              (row) => row.studentId === student.studentId,
            );
            return {
              studentId: student.studentId,
              name: student.name,
              absenceCount: student.absenceCount,
              attendanceRate: previousRow?.attendanceRate ?? 100,
              difficultyCount: previousRow?.difficultyCount ?? 0,
              status: (existing?.status as AttendanceStatus) || "PRESENT",
              difficultyNote: existing?.note || "",
              attendanceId: existing?.id,
            };
          }),
        );
      } catch (error) {
        console.error("Erreur lors du chargement de l'appel:", error);
        setFollowUpRows((prev) =>
          students.map((student) => {
            const previousRow = prev.find(
              (row) => row.studentId === student.studentId,
            );
            return {
              studentId: student.studentId,
              name: student.name,
              absenceCount: student.absenceCount,
              attendanceRate: previousRow?.attendanceRate ?? 100,
              difficultyCount: previousRow?.difficultyCount ?? 0,
              status: "PRESENT",
              difficultyNote: "",
            };
          }),
        );
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    void fetchAttendance();
  }, [selectedClassId, selectedDate, selectedScheduleId, students]);

  useEffect(() => {
    const fetchStudentMetrics = async () => {
      if (students.length === 0) {
        return;
      }

      try {
        const histories = await Promise.all(
          students.map((student) =>
            attendanceService.getByStudent(student.studentId),
          ),
        );

        setFollowUpRows((prev) =>
          prev.map((row) => {
            const index = students.findIndex(
              (student) => student.studentId === row.studentId,
            );
            const history = index >= 0 ? histories[index] : [];
            return {
              ...row,
              attendanceRate: computeAttendanceRate(history),
              difficultyCount: history.filter(
                (entry) => (entry.note || "").trim().length > 0,
              ).length,
            };
          }),
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des statistiques eleves:",
          error,
        );
      }
    };

    void fetchStudentMetrics();
  }, [students]);

  const handleFollowUpChange = (
    studentId: string,
    field: "status" | "difficultyNote",
    value: string,
  ) => {
    setFollowUpRows((prev) =>
      prev.map((row) =>
        row.studentId === studentId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleBulkStatus = (status: AttendanceStatus) => {
    setFollowUpRows((prev) =>
      prev.map((row) => ({
        ...row,
        status,
      })),
    );
  };

  const handleExport = () => {
    if (!selectedClassData || followUpRows.length === 0) {
      return;
    }

    const rows = [
      [
        "Eleve",
        "Presence",
        "Absences cumulees",
        "Pourcentage presence",
        "Difficultes observees",
        "Historique difficultes",
      ],
      ...followUpRows.map((row) => [
        row.name,
        row.status,
        String(row.absenceCount),
        `${row.attendanceRate}%`,
        row.difficultyNote,
        String(row.difficultyCount),
      ]),
    ];

    const csv = rows.map((row) => row.join(";")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `suivi_${selectedClassData.className.replace(/\s+/g, "_")}_${selectedDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAttendance = async () => {
    if (!selectedScheduleId) {
      return;
    }

    setIsSavingAttendance(true);
    try {
      await Promise.all(
        followUpRows.map((row) => {
          const payload: AttendanceRequest = {
            studentId: row.studentId,
            scheduleId: selectedScheduleId,
            date: selectedDate,
            status: row.status,
            note: row.difficultyNote || undefined,
          };

          if (row.attendanceId) {
            return attendanceService.update(row.attendanceId, payload);
          }

          return attendanceService.create(payload);
        }),
      );

      const refreshed = await attendanceService.getByScheduleAndDate(
        selectedScheduleId,
        selectedDate,
      );
      const attendanceMap = new Map<string, AttendanceResponse>();
      refreshed.forEach((entry) => {
        attendanceMap.set(entry.studentId, entry);
      });

      setFollowUpRows((prev) =>
        prev.map((row) => ({
          ...row,
          attendanceId: attendanceMap.get(row.studentId)?.id || row.attendanceId,
        })),
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'appel:", error);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedClassData = classes.find(
    (c) =>
      c.classId === selectedClassId && c.subjectId === selectedSubjectId,
  );

  const displayedRows = followUpRows.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const presentCount = followUpRows.filter(
    (row) =>
      row.status === "PRESENT" ||
      row.status === "LATE" ||
      row.status === "EXCUSED",
  ).length;
  const absentCount = followUpRows.filter((row) => row.status === "ABSENT").length;
  const classAttendanceRate = followUpRows.length
    ? Math.round((presentCount / followUpRows.length) * 100)
    : 0;
  const difficultyCount = followUpRows.filter(
    (row) => row.difficultyNote.trim().length > 0 || row.absenceCount >= 3,
  ).length;

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
            <Users size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">
              Mes Classes
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Faites l'appel, marquez les absences et suivez les difficultes des eleves
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
            placeholder="Rechercher une classe ou un eleve..."
            className="w-full pl-10 h-12 rounded-2xl bg-white dark:bg-gray-900/50 border-gray-100 dark:border-white/5 font-semibold text-sm"
          />
        </div>
      </div>

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
                      <CheckSquare size={12} /> Suivi
                    </p>
                    <p className="text-sm font-black text-bleu-600 dark:text-bleu-400">
                      Appel & presences
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
                  Faire l'appel et suivre la classe
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
            Aucune classe trouvee
          </p>
          <p className="text-sm font-semibold text-gray-400">
            Essayez de modifier votre recherche.
          </p>
        </div>
      )}

      <Modal
        isOpen={selectedClassId !== null}
        onClose={() => {
          setSelectedClassId(null);
          setSelectedSubjectId(null);
          setStudents([]);
          setClassSchedules([]);
          setSelectedScheduleId("");
          setFollowUpRows([]);
          setSelectedDate(TODAY);
        }}
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
                    {selectedClassData.studentCount} eleves
                  </span>
                </div>
              </div>
            </div>
          ) : (
            "Suivi de la classe"
          )
        }
      >
        <div className="space-y-6 pt-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-bleu-50 dark:bg-bleu-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400 uppercase tracking-widest mb-1">
                Appel du jour
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {followUpRows.length}
              </p>
            </Card>
            <Card className="p-4 bg-vert-50 dark:bg-vert-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-vert-600 dark:text-vert-400 uppercase tracking-widest mb-1">
                Taux de presence
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {classAttendanceRate}
                <span className="text-sm text-gray-400">%</span>
              </p>
            </Card>
            <Card className="p-4 bg-rouge-50 dark:bg-rouge-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-rouge-600 dark:text-rouge-400 uppercase tracking-widest mb-1">
                Absents
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {absentCount}
              </p>
            </Card>
            <Card className="p-4 bg-or-50 dark:bg-or-900/10 border-none text-left">
              <p className="text-[10px] font-bold text-or-600 dark:text-or-400 uppercase tracking-widest mb-1">
                Difficultes relevees
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {difficultyCount}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Date de l'appel
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Creneau
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full h-11 rounded-xl px-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white"
              >
                <option value="">Selectionner un creneau</option>
                {classSchedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.startTime} - {schedule.endTime}
                    {schedule.room ? ` • ${schedule.room}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <Button
                onClick={handleSaveAttendance}
                disabled={
                  !selectedScheduleId ||
                  isSavingAttendance ||
                  isLoadingAttendance ||
                  isLoadingStudents
                }
                className="h-11 px-5 text-[11px] font-bold bg-bleu-600 text-white border-none shadow-md shadow-bleu-500/20 flex items-center gap-2"
              >
                {isSavingAttendance ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckSquare size={15} />
                )}
                Enregistrer l'appel
              </Button>
              <Button
                onClick={handleExport}
                className="h-11 px-4 text-[11px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center gap-2"
              >
                <FileSpreadsheet size={14} className="text-green-600" /> Exporter
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleBulkStatus("PRESENT")}
              className="h-10 text-[11px] font-bold"
            >
              Tout marquer present
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkStatus("ABSENT")}
              className="h-10 text-[11px] font-bold"
            >
              Tout marquer absent
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkStatus("LATE")}
              className="h-10 text-[11px] font-bold"
            >
              Tout marquer en retard
            </Button>
          </div>

          {!selectedScheduleId && !isLoadingStudents && (
            <div className="flex items-center gap-2 rounded-2xl border border-or-200 bg-or-50 dark:bg-or-900/10 px-4 py-3 text-or-700 dark:text-or-300 text-sm font-semibold">
              <AlertCircle size={16} />
              Aucun creneau associe a cette classe et cette matiere pour l'appel.
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg text-left">
              Liste des eleves
            </h3>
            <div className="text-[11px] font-semibold text-gray-500">
              Presence, absences et difficultes observees
            </div>
          </div>

          <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-gray-900/50">
            {isLoadingStudents || isLoadingAttendance ? (
              <div className="py-20 text-center text-gray-400 font-bold">
                Chargement du suivi de classe...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Eleve
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Presence %
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Presence
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      Absences cumulees
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Difficultes observees
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Suivi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {displayedRows.map((student) => (
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
                          className={`text-[12px] font-black ${
                            student.attendanceRate < 75
                              ? "text-rouge-500"
                              : student.attendanceRate < 90
                                ? "text-or-600"
                                : "text-vert-600"
                          }`}
                        >
                          {student.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={student.status}
                          onChange={(e) =>
                            handleFollowUpChange(
                              student.studentId,
                              "status",
                              e.target.value,
                            )
                          }
                          className={`h-10 rounded-xl px-3 border text-[12px] font-bold ${getStatusStyles(student.status)}`}
                        >
                          {ATTENDANCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-[12px] font-bold ${student.absenceCount > 3 ? "text-rouge-500 bg-rouge-50 dark:bg-rouge-500/10 px-2 py-1 rounded-md" : "text-gray-500"}`}
                        >
                          {student.absenceCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={student.difficultyNote}
                          onChange={(e) =>
                            handleFollowUpChange(
                              student.studentId,
                              "difficultyNote",
                              e.target.value,
                            )
                          }
                          placeholder="Concentration, lecture, retard, participation..."
                          className="h-10 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {student.difficultyNote.trim().length > 0 ? (
                          <Badge
                            variant="error"
                            className="text-[10px] font-bold border-none"
                          >
                            <Activity size={10} className="mr-1" /> A suivre
                          </Badge>
                        ) : student.status === "ABSENT" ? (
                          <Badge
                            variant="error"
                            className="text-[10px] font-bold border-none"
                          >
                            Absent
                          </Badge>
                        ) : student.absenceCount >= 3 ? (
                          <Badge className="bg-or-50 text-or-600 text-[10px] font-bold border-none">
                            Vigilance
                          </Badge>
                        ) : student.attendanceRate < 75 ? (
                          <Badge
                            variant="error"
                            className="text-[10px] font-bold border-none"
                          >
                            Presence faible
                          </Badge>
                        ) : (
                          <Badge
                            variant="success"
                            className="text-[10px] font-bold border-none"
                          >
                            Stable
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
