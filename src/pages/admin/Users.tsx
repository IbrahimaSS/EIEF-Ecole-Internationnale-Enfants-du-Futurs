// src/pages/admin/AdminUsers.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon, GraduationCap, UserPlus, Search,
  MoreVertical, Eye, Edit, Trash2, X, CheckCircle2, AlertCircle,
  Loader2, UserCheck, Briefcase, Phone, Mail, Calendar, Hash,
  BookOpen, Building2, Shield, ChevronLeft, User,
} from 'lucide-react';
import { Table, Badge, Avatar, Button, Card, Modal, Input, Select } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useUsers } from '../../hooks/useUsers';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { userService } from '../../services/userService';
import type {
  StudentRequest, TeacherRequest,
  ParentRequest, ParentResponse,
  EmployeeRequest, EmployeeResponse,
} from '../../services/userService';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'eleves' | 'enseignants' | 'parents' | 'employes';
type NotifKind = 'success' | 'error';
interface Notif { kind: NotifKind; message: string }

// ─── Constantes ────────────────────────────────────────────────────────────────

const EMPLOYEE_ROLES = [
  { value: 'ADMIN',      label: 'Administrateur' },
  { value: 'STAFF',      label: 'Personnel' },
  { value: 'ACCOUNTANT', label: 'Comptable' },
];

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
};

const emptyStudent  = (): StudentRequest  => ({ email: '', password: '', firstName: '', lastName: '', phone: '', registrationNumber: '', birthDate: '', gender: '', classId: '', parentId: '' });
const emptyTeacher  = (): TeacherRequest  => ({ email: '', password: '', firstName: '', lastName: '', phone: '', employeeNumber: '', specialty: '', hireDate: '' });
const emptyParent   = (): ParentRequest   => ({ email: '', password: '', firstName: '', lastName: '', phone: '', roleName: 'PARENT' });
const emptyEmployee = (): EmployeeRequest => ({ email: '', password: '', firstName: '', lastName: '', phone: '', roleName: 'STAFF' });

// ─── Sous-composant : panneau "Voir le profil" ─────────────────────────────────

interface DetailRowProps { icon: React.ReactNode; label: string; value?: string | null }
const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-white/5 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-bleu-50 dark:bg-bleu-900/20 flex items-center justify-center text-bleu-600 dark:text-bleu-400 flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-all">{value || <span className="text-gray-300 dark:text-gray-600 italic text-xs">Non renseigné</span>}</p>
    </div>
  </div>
);

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: any;
  activeTab: TabId;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}
const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, row, activeTab, onEdit, onDelete }) => {
  if (!row) return null;

  const fullName = `${row.firstName} ${row.lastName}`;
  const tabColorMap: Record<TabId, string> = {
    eleves:      'from-bleu-500 to-bleu-600',
    enseignants: 'from-or-500 to-or-600',
    parents:     'from-vert-500 to-vert-600',
    employes:    'from-purple-500 to-purple-600',
  };
  const tabLabelMap: Record<TabId, string> = {
    eleves:      'Élève',
    enseignants: 'Enseignant',
    parents:     'Parent',
    employes:    'Employé',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600 dark:text-bleu-300">
            <User size={22} />
          </div>
          <span className="font-bold gradient-bleu-or-text tracking-tight">Profil Utilisateur</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6 py-2" onClick={e => e.stopPropagation()}>
        {/* Header carte */}
        <div className={cn('relative rounded-2xl p-6 bg-gradient-to-br text-white overflow-hidden', tabColorMap[activeTab])}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {row.firstName?.[0]?.toUpperCase()}{row.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold opacity-75 mb-0.5">{tabLabelMap[activeTab]}</p>
              <h3 className="text-xl font-bold leading-tight">{fullName}</h3>
              <p className="text-sm opacity-80 mt-0.5">{row.email}</p>
            </div>
            <div className="ml-auto">
              <span className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold',
                row.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'
              )}>
                {row.isActive ? '● Actif' : '○ Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Détails selon le type */}
        <div className="bg-gray-50 dark:bg-white/3 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className={cn('w-1 h-3 rounded-full bg-gradient-to-b', tabColorMap[activeTab])} />
            Informations de contact
          </p>
          <DetailRow icon={<Mail size={14} />}     label="Email"     value={row.email} />
          <DetailRow icon={<Phone size={14} />}    label="Téléphone" value={row.phone} />
        </div>

        {activeTab === 'eleves' && (
          <div className="bg-gray-50 dark:bg-white/3 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-gradient-to-b from-bleu-500 to-bleu-600" />
              Informations scolaires
            </p>
            <DetailRow icon={<Hash size={14} />}      label="Matricule"       value={row.registrationNumber} />
            <DetailRow icon={<BookOpen size={14} />}  label="Classe"          value={row.className} />
            <DetailRow icon={<UserCheck size={14} />} label="Parent / Tuteur" value={row.parentName} />
            <DetailRow icon={<Calendar size={14} />}  label="Date de naissance" value={row.birthDate} />
            <DetailRow icon={<User size={14} />}      label="Genre"           value={row.gender === 'M' ? 'Masculin' : row.gender === 'F' ? 'Féminin' : row.gender} />
          </div>
        )}

        {activeTab === 'enseignants' && (
          <div className="bg-gray-50 dark:bg-white/3 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-gradient-to-b from-or-500 to-or-600" />
              Détails professionnels
            </p>
            <DetailRow icon={<Hash size={14} />}      label="N° Employé"    value={row.employeeNumber} />
            <DetailRow icon={<BookOpen size={14} />}  label="Spécialité"    value={row.specialty} />
            <DetailRow icon={<Calendar size={14} />}  label="Date d'embauche" value={row.hireDate} />
          </div>
        )}

        {activeTab === 'employes' && (
          <div className="bg-gray-50 dark:bg-white/3 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-gradient-to-b from-purple-500 to-purple-600" />
              Fonction
            </p>
            <DetailRow icon={<Shield size={14} />}    label="Rôle" value={EMPLOYEE_ROLES.find(r => r.value === row.roleName)?.label ?? row.roleName} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
          <Button
            variant="outline"
            onClick={() => { onClose(); onEdit(row); }}
            className="flex-1 h-11 gap-2 text-sm"
          >
            <Edit size={15} /> Modifier
          </Button>
          <Button
            onClick={() => { onClose(); onDelete({ id: row.id, name: fullName }); }}
            className="flex-1 h-11 gap-2 text-sm bg-red-600 hover:bg-red-700 border-none shadow-lg shadow-red-600/20"
          >
            <Trash2 size={15} /> Supprimer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────

const AdminUsers: React.FC = () => {

  // ── Hooks élèves / enseignants ─────────────────────────────────────────────
  const { refetch: refetchDashboard } = useAdminDashboard();
  const {
    students, teachers, loading: loadingUT, error: errorUT,
    addStudent, editStudent, removeStudent,
    addTeacher, editTeacher, removeTeacher,
    searchStudents, searchTeachers,
    refetch: refetchUT,
  } = useUsers(refetchDashboard);

  // ── State parents ──────────────────────────────────────────────────────────
  const [parents,   setParents]   = useState<ParentResponse[]>([]);
  const [loadingP,  setLoadingP]  = useState(false);
  const [errorP,    setErrorP]    = useState<string | null>(null);

  // ── State employés ─────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loadingE,  setLoadingE]  = useState(false);
  const [errorE,    setErrorE]    = useState<string | null>(null);

  // ── State classes ──────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<{ id: string; name: string; level: string }[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState<TabId>('eleves');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [isAddModalOpen,   setIsAddModalOpen]   = useState(false);
  const [openMenuRowId,    setOpenMenuRowId]    = useState<string | null>(null);
  const [notif,            setNotif]            = useState<Notif | null>(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [editingId,        setEditingId]        = useState<string | null>(null);
  const [deleteTarget,     setDeleteTarget]     = useState<{ id: string; name: string } | null>(null);
  const [deleting,         setDeleting]         = useState(false);
  const [profileRow,       setProfileRow]       = useState<any | null>(null);
  const [isProfileOpen,    setIsProfileOpen]    = useState(false);

  // Formulaires
  const [studentForm,  setStudentForm]  = useState<StudentRequest>(emptyStudent());
  const [teacherForm,  setTeacherForm]  = useState<TeacherRequest>(emptyTeacher());
  const [parentForm,   setParentForm]   = useState<ParentRequest>(emptyParent());
  const [employeeForm, setEmployeeForm] = useState<EmployeeRequest>(emptyEmployee());

  // ── Notification ───────────────────────────────────────────────────────────
  const notifTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const showNotif = useCallback((kind: NotifKind, message: string) => {
    clearTimeout(notifTimer.current);
    setNotif({ kind, message });
    notifTimer.current = setTimeout(() => setNotif(null), 3500);
  }, []);

  // ── Fetch parents ──────────────────────────────────────────────────────────
  const fetchParents = useCallback(async () => {
    const token = getToken();
    if (!token) { setErrorP('Token manquant.'); return; }
    setLoadingP(true);
    try {
      const data = await userService.getAllParents(token);
      setParents(data);
      setErrorP(null);
    } catch (err: any) { setErrorP(err?.message ?? 'Erreur chargement parents.'); }
    finally { setLoadingP(false); }
  }, []);

  // ── Fetch employés ─────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    const token = getToken();
    if (!token) { setErrorE('Token manquant.'); return; }
    setLoadingE(true);
    try {
      const data = await userService.getAllEmployees(token);
      setEmployees(data);
      setErrorE(null);
    } catch (err: any) { setErrorE(err?.message ?? 'Erreur chargement employés.'); }
    finally { setLoadingE(false); }
  }, []);

  // ── Fetch classes ──────────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const API_BASE = (process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');
      const res = await fetch(`${API_BASE}/courses/classes`, {
        headers: {
          'Content-Type': 'application/json',
          'enfantsfuture-auth-token': `enfantsfuture ${token}`,
        },
      });
      const payload = await res.json();
      if (res.ok) setClasses(payload.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchParents();
    fetchEmployees();
    fetchClasses();
  }, [fetchParents, fetchEmployees, fetchClasses]);

  // ── Recherche (debounce 350ms) ─────────────────────────────────────────────
  const searchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (q.trim()) {
        if (activeTab === 'eleves')      searchStudents(q);
        else if (activeTab === 'enseignants') searchTeachers(q);
      } else {
        refetchUT();
      }
    }, 350);
  };

  // ── Filtrage client-side ───────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filteredStudents  = students.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    e.registrationNumber.toLowerCase().includes(q)
  );
  const filteredTeachers  = teachers.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    (e.specialty ?? '').toLowerCase().includes(q)
  );
  const filteredParents   = parents.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    e.email.toLowerCase().includes(q)
  );
  const filteredEmployees = employees.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    e.email.toLowerCase().includes(q)
  );

  // ── Reset formulaires ──────────────────────────────────────────────────────
  const resetForms = () => {
    setStudentForm(emptyStudent());
    setTeacherForm(emptyTeacher());
    setParentForm(emptyParent());
    setEmployeeForm(emptyEmployee());
  };

  // ── Ouvrir profil ──────────────────────────────────────────────────────────
  const openProfile = (row: any) => {
    setOpenMenuRowId(null);
    setProfileRow(row);
    setIsProfileOpen(true);
  };

  // ── Ouvrir édition ────────────────────────────────────────────────────────
  const openEdit = (row: any) => {
    setOpenMenuRowId(null);
    setEditingId(row.id);
    if (activeTab === 'eleves') {
      setStudentForm({
        email:              row.email ?? '',
        password:           '',
        firstName:          row.firstName,
        lastName:           row.lastName,
        phone:              row.phone ?? '',
        registrationNumber: row.registrationNumber,
        birthDate:          row.birthDate ?? '',
        gender:             row.gender ?? '',
        classId:            '',
        parentId:           '',
      });
    } else if (activeTab === 'enseignants') {
      setTeacherForm({
        email:          row.email ?? '',
        password:       '',
        firstName:      row.firstName,
        lastName:       row.lastName,
        phone:          row.phone ?? '',
        employeeNumber: row.employeeNumber,
        specialty:      row.specialty ?? '',
        hireDate:       row.hireDate ?? '',
      });
    } else if (activeTab === 'parents') {
      setParentForm({
        email:     row.email,
        password:  '',
        firstName: row.firstName,
        lastName:  row.lastName,
        phone:     row.phone ?? '',
        roleName:  'PARENT',
      });
    } else {
      setEmployeeForm({
        email:     row.email,
        password:  '',
        firstName: row.firstName,
        lastName:  row.lastName,
        phone:     row.phone ?? '',
        roleName:  row.roleName,
      });
    }
    setIsAddModalOpen(true);
  };

  // ── Soumission formulaire ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    const token = getToken();
    if (!token) { showNotif('error', 'Token manquant.'); return; }
    setSubmitting(true);
    try {
      if (activeTab === 'eleves') {
        if (editingId) await editStudent(editingId, studentForm);
        else           await addStudent(studentForm);
      } else if (activeTab === 'enseignants') {
        if (editingId) await editTeacher(editingId, teacherForm);
        else           await addTeacher(teacherForm);
      } else if (activeTab === 'parents') {
        if (editingId) await userService.updateParent(token, editingId, parentForm);
        else           await userService.createParent(token, parentForm);
        await fetchParents();
      } else {
        if (editingId) await userService.updateEmployee(token, editingId, employeeForm);
        else           await userService.createEmployee(token, employeeForm);
        await fetchEmployees();
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      resetForms();
      showNotif('success', editingId ? 'Modification enregistrée.' : 'Utilisateur ajouté avec succès.');
    } catch (err: any) {
      showNotif('error', err?.message ?? 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = getToken();
    if (!token) { showNotif('error', 'Token manquant.'); return; }
    setDeleting(true);
    try {
      if (activeTab === 'eleves')           await removeStudent(deleteTarget.id);
      else if (activeTab === 'enseignants') await removeTeacher(deleteTarget.id);
      else if (activeTab === 'parents') {
        await userService.deleteParent(token, deleteTarget.id);
        await fetchParents();
      } else {
        await userService.deleteEmployee(token, deleteTarget.id);
        await fetchEmployees();
      }
      setDeleteTarget(null);
      showNotif('success', `${deleteTarget.name} a été supprimé avec succès.`);
    } catch (err: any) {
      showNotif('error', err?.message ?? 'La suppression a échoué.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Menu contextuel ⋮ ──────────────────────────────────────────────────────
  const renderActions = (_: any, row: any) => {
    const rowId = row.id ?? row.email;
    const isOpen = openMenuRowId === rowId;
    return (
      <div className="relative flex justify-end px-2">
        <button
          onClick={e => { e.stopPropagation(); setOpenMenuRowId(isOpen ? null : rowId); }}
          className={cn(
            'p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 focus:outline-none',
            isOpen && 'bg-gray-100 dark:bg-white/5 text-bleu-600 dark:text-or-400'
          )}
        >
          <MoreVertical size={18} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              className="absolute right-full mr-2 top-0 w-52 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.25rem] shadow-2xl border border-gray-100 dark:border-white/5 p-2 z-[60] ring-1 ring-black/5"
            >
              <div className="flex flex-col gap-1 text-left">
                {/* Voir le profil */}
                <button
                  onClick={e => { e.stopPropagation(); openProfile(row); }}
                  className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-bleu-50 dark:hover:bg-bleu-900/40 hover:text-bleu-600 rounded-xl transition-all w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-bleu-50 dark:bg-bleu-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Voir le profil</span>
                    <span className="text-[9px] font-normal text-gray-400">Consulter les détails</span>
                  </div>
                </button>

                {/* Modifier */}
                <button
                  onClick={e => { e.stopPropagation(); openEdit(row); }}
                  className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-or-50 dark:hover:bg-or-900/40 hover:text-or-600 rounded-xl transition-all w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-or-50 dark:bg-or-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Modifier</span>
                    <span className="text-[9px] font-normal text-gray-400">Éditer les informations</span>
                  </div>
                </button>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2" />

                {/* Supprimer */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setOpenMenuRowId(null);
                    setDeleteTarget({ id: row.id, name: `${row.firstName} ${row.lastName}` });
                  }}
                  className="group flex items-center gap-3 px-3 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Supprimer</span>
                    <span className="text-[9px] font-normal text-red-400">Action irréversible</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── Colonnes ───────────────────────────────────────────────────────────────
  const eleveColumns = [
    {
      key: 'lastName', label: 'Élève', sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">Matricule: {row.registrationNumber}</div>
          </div>
        </div>
      ),
    },
    { key: 'className', label: 'Classe', sortable: true },
    { key: 'isActive', label: 'Statut', render: (val: boolean) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Actif' : 'Inactif'}</Badge> },
    {
      key: 'parentName', label: 'Parent / Contact',
      render: (_: any, row: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300">{row.parentName}</div>
          <div className="text-gray-400 text-[10px]">{row.phone}</div>
        </div>
      ),
    },
    { key: 'actions', label: '', render: renderActions },
  ];

  const enseignantColumns = [
    {
      key: 'lastName', label: 'Enseignant', sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'specialty',      label: 'Spécialité', sortable: true },
    { key: 'employeeNumber', label: 'N° Employé', sortable: true },
    { key: 'isActive', label: 'Statut', render: (val: boolean) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Actif' : 'Inactif'}</Badge> },
    { key: 'actions', label: '', render: renderActions },
  ];

  const parentColumns = [
    {
      key: 'lastName', label: 'Parent', sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Téléphone', render: (val: string) => <span className="text-sm text-gray-500">{val || '—'}</span> },
    { key: 'isActive', label: 'Statut', render: (val: boolean) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Actif' : 'Inactif'}</Badge> },
    { key: 'actions', label: '', render: renderActions },
  ];

  const employeeColumns = [
    {
      key: 'lastName', label: 'Employé', sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">{row.firstName} {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roleName', label: 'Rôle',
      render: (val: string) => (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300">
          {EMPLOYEE_ROLES.find(r => r.value === val)?.label ?? val}
        </span>
      ),
    },
    { key: 'phone', label: 'Téléphone', render: (val: string) => <span className="text-sm text-gray-500">{val || '—'}</span> },
    { key: 'isActive', label: 'Statut', render: (val: boolean) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Actif' : 'Inactif'}</Badge> },
    { key: 'actions', label: '', render: renderActions },
  ];

  const tabs = [
    { id: 'eleves',      label: 'Élèves',     icon: GraduationCap, count: students.length  },
    { id: 'enseignants', label: 'Enseignants', icon: UsersIcon,     count: teachers.length  },
    { id: 'parents',     label: 'Parents',     icon: UserCheck,     count: parents.length   },
    { id: 'employes',    label: 'Employés',    icon: Briefcase,     count: employees.length },
  ] as const;

  const isLoading = activeTab === 'eleves' || activeTab === 'enseignants' ? loadingUT
                  : activeTab === 'parents' ? loadingP : loadingE;

  const currentError = activeTab === 'eleves' || activeTab === 'enseignants' ? errorUT
                     : activeTab === 'parents' ? errorP : errorE;

  const currentRefetch = activeTab === 'parents'  ? fetchParents
                       : activeTab === 'employes' ? fetchEmployees : refetchUT;

  const currentData = activeTab === 'eleves'      ? filteredStudents
                    : activeTab === 'enseignants' ? filteredTeachers
                    : activeTab === 'parents'     ? filteredParents
                    : filteredEmployees;

  const currentColumns = activeTab === 'eleves'      ? eleveColumns
                       : activeTab === 'enseignants' ? enseignantColumns
                       : activeTab === 'parents'     ? parentColumns
                       : employeeColumns;

  // ── Titre modale ajout/édition ─────────────────────────────────────────────
  const modalIconMap: Record<TabId, { Icon: any; color: string }> = {
    eleves:      { Icon: GraduationCap, color: 'bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600 dark:text-bleu-300' },
    enseignants: { Icon: UsersIcon,     color: 'bg-or-100 dark:bg-or-900/30 text-or-600 dark:text-or-300' },
    parents:     { Icon: UserCheck,     color: 'bg-vert-100 dark:bg-vert-900/30 text-vert-600 dark:text-vert-300' },
    employes:    { Icon: Briefcase,     color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' },
  };
  const modalLabels: Record<TabId, [string, string]> = {
    eleves:      ["Modifier l'Élève",      'Nouvel Élève'],
    enseignants: ["Modifier l'Enseignant", 'Nouvel Enseignant'],
    parents:     ["Modifier le Parent",    'Nouveau Parent'],
    employes:    ["Modifier l'Employé",    'Nouvel Employé'],
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuRowId(null)}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UsersIcon className="text-bleu-600 dark:text-bleu-400" size={28} />
            <h1 className="text-xl font-semibold gradient-bleu-or-text">Annuaire des Utilisateurs</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Gérez les élèves, enseignants, parents et le personnel
          </p>
        </div>
        <Button
          onClick={e => {
            e.stopPropagation();
            setEditingId(null);
            resetForms();
            setIsAddModalOpen(true);
          }}
          className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20"
        >
          <UserPlus size={18} /> Ajouter
        </Button>
      </div>

      {/* TABS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-x-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={e => { e.stopPropagation(); setActiveTab(tab.id as TabId); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-sm'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-bleu-50 dark:bg-white/20 text-bleu-600 dark:text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                    {isLoading ? '…' : tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      {/* ERREUR */}
      {currentError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={18} /> {currentError}
          <button onClick={currentRefetch} className="ml-auto text-[11px] underline">Réessayer</button>
        </div>
      )}

      {/* TABLEAU */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm font-medium">Chargement...</span>
              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <UsersIcon size={40} className="opacity-20" />
                <span className="text-sm font-medium">Aucun utilisateur trouvé</span>
              </div>
            ) : (
              <Table data={currentData as any} columns={currentColumns as any} />
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        {tabs.map(t => (
          <Card key={t.id} className="p-6 border-none bg-gradient-to-br from-bleu-500/5 to-or-500/5 dark:from-bleu-900/10 dark:to-or-900/10 backdrop-blur-sm relative overflow-hidden">
            <p className="text-gray-400 text-[10px] font-semibold mb-1">{t.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.id === 'eleves' ? students.length : t.id === 'enseignants' ? teachers.length : t.id === 'parents' ? parents.length : employees.length}
            </p>
          </Card>
        ))}
      </div>

      {/* ── MODALE PROFIL ──────────────────────────────────────────────────────── */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => { setIsProfileOpen(false); setProfileRow(null); }}
        row={profileRow}
        activeTab={activeTab}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* ── MODALE AJOUT / ÉDITION ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingId(null); }}
        title={(() => {
          const { Icon, color } = modalIconMap[activeTab];
          const [edit, create] = modalLabels[activeTab];
          return (
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-xl', color)}><Icon size={22} /></div>
              <span className="tracking-tight gradient-bleu-or-text font-bold">{editingId ? edit : create}</span>
            </div>
          );
        })()}
        size="lg"
      >
        <div className="space-y-8 text-left py-2" onClick={e => e.stopPropagation()}>

          {/* ─ Identité (commun à tous) ─ */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-bleu-500 rounded-full" /> Identité
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Prénom" placeholder="ex: Mamadou Sory"
                value={activeTab === 'eleves' ? studentForm.firstName : activeTab === 'enseignants' ? teacherForm.firstName : activeTab === 'parents' ? parentForm.firstName : employeeForm.firstName}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, firstName: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, firstName: v }));
                  else if (activeTab === 'parents')     setParentForm(f => ({ ...f, firstName: v }));
                  else                                  setEmployeeForm(f => ({ ...f, firstName: v }));
                }}
              />
              <Input label="Nom de famille" placeholder="ex: Diallo"
                value={activeTab === 'eleves' ? studentForm.lastName : activeTab === 'enseignants' ? teacherForm.lastName : activeTab === 'parents' ? parentForm.lastName : employeeForm.lastName}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, lastName: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, lastName: v }));
                  else if (activeTab === 'parents')     setParentForm(f => ({ ...f, lastName: v }));
                  else                                  setEmployeeForm(f => ({ ...f, lastName: v }));
                }}
              />
            </div>
          </div>

          {/* ─ Accès au compte (commun à tous) ─ */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-3 bg-purple-500 rounded-full" /> Accès au Compte
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Adresse Email" placeholder="utilisateur@eief.edu.gn" type="email"
                value={activeTab === 'eleves' ? studentForm.email : activeTab === 'enseignants' ? teacherForm.email : activeTab === 'parents' ? parentForm.email : employeeForm.email}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, email: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, email: v }));
                  else if (activeTab === 'parents')     setParentForm(f => ({ ...f, email: v }));
                  else                                  setEmployeeForm(f => ({ ...f, email: v }));
                }}
              />
              <Input label={editingId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} placeholder="Min. 8 caractères" type="password"
                value={activeTab === 'eleves' ? studentForm.password : activeTab === 'enseignants' ? teacherForm.password : activeTab === 'parents' ? parentForm.password : employeeForm.password}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, password: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, password: v }));
                  else if (activeTab === 'parents')     setParentForm(f => ({ ...f, password: v }));
                  else                                  setEmployeeForm(f => ({ ...f, password: v }));
                }}
              />
            </div>
          </div>

          {/* ─ Champs spécifiques élèves ─ */}
          {activeTab === 'eleves' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-or-500 rounded-full" /> Informations Scolaires
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Numéro de matricule" placeholder="EIEF2024..."
                  value={studentForm.registrationNumber}
                  onChange={e => setStudentForm(f => ({ ...f, registrationNumber: e.target.value }))}
                />
                <Input label="Date de naissance" type="date"
                  value={studentForm.birthDate ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, birthDate: e.target.value }))}
                />
                <Select label="Genre"
                  options={[
                    { value: '', label: 'Sélectionner...' },
                    { value: 'M', label: 'Masculin' },
                    { value: 'F', label: 'Féminin' },
                  ]}
                  value={studentForm.gender ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, gender: e.target.value }))}
                />
                <Input label="Téléphone" placeholder="+224 ..."
                  value={studentForm.phone ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))}
                />
                <Select
                  label="Classe"
                  options={[
                    { value: '', label: classes.length === 0 ? 'Aucune classe disponible' : 'Sélectionner une classe...' },
                    ...classes.map(c => ({
                      value: c.id,
                      label: c.level ? `${c.name} — ${c.level}` : c.name,
                    })),
                  ]}
                  value={studentForm.classId ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, classId: e.target.value }))}
                />
                <Select
                  label="Parent / Tuteur"
                  options={[
                    { value: '', label: parents.length === 0 ? 'Aucun parent disponible' : 'Sélectionner un parent...' },
                    ...parents.map(p => ({
                      value: p.id,
                      label: `${p.firstName} ${p.lastName}`,
                    })),
                  ]}
                  value={studentForm.parentId ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, parentId: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* ─ Champs spécifiques enseignants ─ */}
          {activeTab === 'enseignants' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-or-500 rounded-full" /> Détails Professionnels
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Numéro employé" placeholder="EMP2024..."
                  value={teacherForm.employeeNumber}
                  onChange={e => setTeacherForm(f => ({ ...f, employeeNumber: e.target.value }))}
                />
                <Input label="Spécialité" placeholder="ex: Mathématiques"
                  value={teacherForm.specialty ?? ''}
                  onChange={e => setTeacherForm(f => ({ ...f, specialty: e.target.value }))}
                />
                <Input label="Date d'embauche" type="date"
                  value={teacherForm.hireDate ?? ''}
                  onChange={e => setTeacherForm(f => ({ ...f, hireDate: e.target.value }))}
                />
                <Input label="Téléphone" placeholder="+224 ..."
                  value={teacherForm.phone ?? ''}
                  onChange={e => setTeacherForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* ─ Champs spécifiques parents ─ */}
          {activeTab === 'parents' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-vert-500 rounded-full" /> Contact
              </p>
              <Input label="Téléphone" placeholder="+224 ..."
                value={parentForm.phone ?? ''}
                onChange={e => setParentForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          )}

          {/* ─ Champs spécifiques employés ─ */}
          {activeTab === 'employes' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-purple-500 rounded-full" /> Fonction
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select label="Rôle"
                  options={EMPLOYEE_ROLES}
                  value={employeeForm.roleName}
                  onChange={e => setEmployeeForm(f => ({ ...f, roleName: e.target.value }))}
                />
                <Input label="Téléphone" placeholder="+224 ..."
                  value={employeeForm.phone ?? ''}
                  onChange={e => setEmployeeForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* ─ Actions ─ */}
          <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
            <Button
              variant="outline"
              onClick={() => { setIsAddModalOpen(false); setEditingId(null); }}
              className="flex-1 h-12"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-12 shadow-lg shadow-bleu-600/20 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingId ? 'Enregistrer les modifications' : "Enregistrer l'utilisateur"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE CONFIRM DELETE ─────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
              <Trash2 size={22} />
            </div>
            <span className="font-bold text-red-600">Confirmer la suppression</span>
          </div>
        }
        size="sm"
      >
        <div className="text-left space-y-6 py-2">
          {/* Icône d'avertissement */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                Supprimer <span className="text-red-600">{deleteTarget?.name}</span> ?
              </p>
              <p className="text-xs text-gray-400">
                Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement perdues.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="flex-1 h-12"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── TOAST NOTIFICATION ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'fixed bottom-10 right-10 z-[100] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[300px]',
              notif.kind === 'success'
                ? 'border border-green-100 dark:border-green-900/30'
                : 'border border-red-100 dark:border-red-900/30'
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              notif.kind === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-red-100 dark:bg-red-900/30 text-red-500'
            )}>
              {notif.kind === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {notif.kind === 'success' ? 'Opération réussie' : 'Erreur'}
              </p>
              <p className="text-xs text-gray-500">{notif.message}</p>
            </div>
            <button
              onClick={() => setNotif(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;