// src/pages/admin/AdminUsers.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon, GraduationCap, UserPlus, Search,
  MoreVertical, Eye, Edit, Trash2, AlertCircle,
  Loader2, UserCheck, Briefcase, Phone, Mail, Calendar, Hash,
  BookOpen, Shield, User, FileText, CheckCircle2, XCircle,
  RefreshCw, ClipboardList, ChevronRight, Map as MapIcon,
} from 'lucide-react';
import { Table, Badge, Avatar, Button, Card, Modal, Input, Select } from '../../components/ui';
import NotificationToast from '../../components/shared/NotificationToast';
import { useNotif } from '../../hooks/useNotif';
import { cn } from '../../utils/cn';
import { useUsers } from '../../hooks/useUsers';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { userService } from '../../services/userService';
import type {
  StudentRequest, TeacherRequest,
  ParentRequest, ParentResponse,
  EmployeeRequest, EmployeeResponse,
  PreEnrollmentResponse, PreEnrollmentStatus,
  StudentResponse,
} from '../../services/userService';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Familles remplace l'ancien onglet "parents" pour s'aligner sur le modèle backend Family. */
type TabId = 'eleves' | 'enseignants' | 'familles' | 'employes';

/** Sous-onglets dédiés aux élèves : pré-inscription publique, réinscription, inscription directe. */
type EleveSubTab = 'preinscription' | 'reinscription' | 'inscription';

// ─── Constantes ────────────────────────────────────────────────────────────────

const EMPLOYEE_ROLES = [
  { value: 'ADMIN',      label: 'Administrateur' },
  { value: 'STAFF',      label: 'Manager' },
  { value: 'COMPTABLE', label: 'Comptable' },
];

const getToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch { return null; }
};

const emptyStudent  = (): StudentRequest  => ({ 
  email: '', 
  password: '', 
  firstName: '', 
  lastName: '', 
  phone: '', 
  registrationNumber: '', 
  birthDate: '', 
  arrivalDate: new Date().getFullYear().toString(), // On utilise ce champ pour stocker l'année
  gender: '', 
  avatarUrl: '',
  classId: '', 
  familyId: '' 
});
const emptyTeacher  = (): TeacherRequest  => ({ email: '', password: '', firstName: '', lastName: '', phone: '', employeeNumber: '', specialty: '', hireDate: '' });
const emptyParent   = (): ParentRequest   => ({ email: '', password: '', firstName: '', lastName: '', phone: '', roleName: 'PARENT', address: '', relationship: '' });
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
    familles:    'from-vert-500 to-vert-600',
    employes:    'from-purple-500 to-purple-600',
  };
  const tabLabelMap: Record<TabId, string> = {
    eleves:      'Élève',
    enseignants: 'Enseignant',
    familles:    'Famille',
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
            <DetailRow icon={<Calendar size={14} />}  label="Année d'arrivée" value={row.arrivalDate ? row.arrivalDate.substring(0, 4) : '—'} />
            <DetailRow icon={<BookOpen size={14} />}  label="Classe"          value={row.className} />
            <DetailRow icon={<UserCheck size={14} />} label="Famille"         value={row.familyId ?? row.parentName} />
            <DetailRow icon={<Calendar size={14} />}  label="Date de naissance" value={row.birthDate} />
            <DetailRow icon={<User size={14} />}      label="Genre"           value={row.gender === 'M' ? 'Masculin' : row.gender === 'F' ? 'Féminin' : row.gender} />
          </div>
        )}

        {activeTab === 'familles' && (
          <div className="bg-gray-50 dark:bg-white/3 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-gradient-to-b from-vert-500 to-vert-600" />
              Détails de la Famille
            </p>
            <DetailRow icon={<UserCheck size={14} />} label="Relation" value={row.relationship} />
            <DetailRow icon={<MapIcon size={14} />}       label="Adresse"  value={row.address} />
            
            {row.students && row.students.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Enfants rattachés</p>
                <div className="space-y-2">
                  {row.students.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">{s.firstName} {s.lastName}</span>
                        <span className="text-[10px] text-gray-400 font-medium italic">{s.registrationNumber}</span>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-bleu-50 dark:bg-bleu-900/30 text-bleu-600 dark:text-bleu-300 ring-1 ring-inset ring-bleu-600/10">
                        {s.className || 'Non classé'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

interface AdminUsersProps {
  /**
   * Si true, l'onglet "Employés" et la possibilité de créer/éditer
   * des employés sont masqués. Utile pour les rôles non-admin (ex: manager).
   */
  hideEmployeesTab?: boolean;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ hideEmployeesTab = false }) => {

  // ── Hooks élèves / enseignants ─────────────────────────────────────────────
  const { refetch: refetchDashboard } = useAdminDashboard();
  const {
    students, teachers, loading: loadingUT, error: errorUT,
    editStudent, removeStudent,
    addTeacher, editTeacher, removeTeacher,
    searchStudents, searchTeachers,
    refetch: refetchUT,
  } = useUsers(refetchDashboard);

  /** Heuristique : Génère un matricule au format EIEF_YYYY001. */
  const generateMatricule = useCallback((arrivalYear: string): string => {
    const year = arrivalYear || new Date().getFullYear().toString();
    const prefix = `EIEF_${year}`;
    
    // On filtre les élèves existants qui ont un matricule commençant par ce préfixe
    const sameYear = students.filter(s => (s.registrationNumber || '').startsWith(prefix));
    
    let max = 0;
    sameYear.forEach(s => {
      // On extrait la partie numérique
      const numPart = s.registrationNumber.substring(prefix.length);
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > max) max = num;
    });
    
    const nextNum = (max + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }, [students]);


  // ── State familles (parents = chefs de famille côté backend) ──────────────
  const [parents,   setParents]   = useState<ParentResponse[]>([]);
  const [loadingP,  setLoadingP]  = useState(false);
  const [errorP,    setErrorP]    = useState<string | null>(null);

  // ── State employés ─────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loadingE,  setLoadingE]  = useState(false);
  const [errorE,    setErrorE]    = useState<string | null>(null);

  // ── State pré-inscriptions ────────────────────────────────────────────────
  const [preEnrollments,    setPreEnrollments]    = useState<PreEnrollmentResponse[]>([]);
  const [loadingPre,        setLoadingPre]        = useState(false);
  const [errorPre,          setErrorPre]          = useState<string | null>(null);
  const [preStatusFilter,   setPreStatusFilter]   = useState<PreEnrollmentStatus | 'ALL'>('PENDING');
  const [approveTarget,     setApproveTarget]     = useState<PreEnrollmentResponse | null>(null);
  const [approveForm,       setApproveForm]       = useState({ studentEmail: '', studentPassword: '', parentTemporaryPassword: '' });
  const [rejectTarget,      setRejectTarget]      = useState<PreEnrollmentResponse | null>(null);
  const [rejectReason,      setRejectReason]      = useState('');
  const [pendingPreAction,  setPendingPreAction]  = useState(false);
  const [preDetail,         setPreDetail]         = useState<PreEnrollmentResponse | null>(null);

  // ── State réinscription ────────────────────────────────────────────────────
  const [reenrollTarget, setReenrollTarget] = useState<StudentResponse | null>(null);
  const [reenrollForm,   setReenrollForm]   = useState({ classId: '', enrollmentDate: '' });
  const [reenrolling,    setReenrolling]    = useState(false);

  // ── State classes ──────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<{ id: string; name: string; level: string }[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState<TabId>('eleves');
  const [eleveSubTab,      setEleveSubTab]      = useState<EleveSubTab>('inscription');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [isAddModalOpen,   setIsAddModalOpen]   = useState(false);
  const [openMenuRowId,    setOpenMenuRowId]    = useState<string | null>(null);
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

  /**
   * Champs additionnels pour l'inscription : Père obligatoire, Mère optionnelle.
   * Au submit on appelle registerFamilyAndStudent qui crée Famille + Père + Élève
   * en un appel atomique (pré-inscription + auto-approbation côté backend).
   */
  const [familyForm, setFamilyForm] = useState({
    fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherEmail: '', fatherProfession: '', fatherAddress: '',
    fatherTemporaryPassword: '',
    motherFirstName: '', motherLastName: '', motherPhone: '', motherEmail: '', motherProfession: '',
    familyEmail: '',
  });

  const [studentOptions, setStudentOptions] = useState({
    cantine: false,
    transport: 'NONE' as 'NONE' | 'PETIT_TRAJET' | 'LONG_TRAJET',
    tenueScolaire: false,
    tenueSport: false,
    tenueScout: false,
    tenueKarate: false,
  });

  /** Filtre par cycle pour la vue Inscriptions (style screenshot 1). */
  const [niveauFilter, setNiveauFilter] = useState<string>('TOUS');

  // ── Notification (hook partagé) ────────────────────────────────────────────
  const { notif, showNotif, closeNotif } = useNotif();

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

  // ── Fetch pré-inscriptions ────────────────────────────────────────────────
  const fetchPreEnrollments = useCallback(async () => {
    const token = getToken();
    if (!token) { setErrorPre('Token manquant.'); return; }
    setLoadingPre(true);
    try {
      const data = await userService.getAllPreEnrollments(
        token,
        preStatusFilter === 'ALL' ? undefined : preStatusFilter,
      );
      setPreEnrollments(data);
      setErrorPre(null);
    } catch (err: any) {
      setErrorPre(err?.message ?? 'Erreur chargement pré-inscriptions.');
    } finally { setLoadingPre(false); }
  }, [preStatusFilter]);

  useEffect(() => {
    fetchParents();
    if (!hideEmployeesTab) fetchEmployees();
    fetchClasses();
  }, [fetchParents, fetchEmployees, fetchClasses, hideEmployeesTab]);

  // Recharge les pré-inscriptions à chaque changement de filtre, ou à l'arrivée sur l'onglet
  useEffect(() => {
    if (activeTab === 'eleves' && eleveSubTab === 'preinscription') {
      fetchPreEnrollments();
    }
  }, [activeTab, eleveSubTab, fetchPreEnrollments]);

  // ── Recherche (debounce 350ms) ─────────────────────────────────────────────
  const searchTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (q.trim()) {
        if (activeTab === 'eleves')           searchStudents(q);
        else if (activeTab === 'enseignants') searchTeachers(q);
      } else {
        refetchUT();
      }
    }, 350);
  };

  // ── Filtrage client-side ───────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  /** Helper null-safe : gère les champs nullable du backend (registrationNumber, email, etc.). */
  const safeIncludes = (v: string | null | undefined, sub: string): boolean =>
    typeof v === 'string' && v.toLowerCase().includes(sub);

  const filteredStudents  = students.filter(e =>
    safeIncludes(`${e.firstName ?? ''} ${e.lastName ?? ''}`, q) ||
    safeIncludes(e.registrationNumber, q)
  );
  const filteredPreEnrollments = preEnrollments.filter(p =>
    safeIncludes(`${p.studentFirstName ?? ''} ${p.studentLastName ?? ''}`, q) ||
    safeIncludes(`${p.guardianFirstName ?? ''} ${p.guardianLastName ?? ''}`, q) ||
    safeIncludes(p.referenceNumber, q) ||
    safeIncludes(p.targetClassName, q),
  );

  /** Map className → niveau (Crèche / Maternelle / Primaire / Collège / Lycée) à partir des classes connues. */
  const classNameToLevel = (name: string | null | undefined): string => {
    // Garde null-safe : un élève sans classe assignée renvoie '—'.
    if (!name || typeof name !== 'string') return '—';
    const safeName = name;
    const klass = classes.find(c => {
      if (!c?.name) return false;
      if (c.name === safeName) return true;
      if (c.level && typeof c.level === 'string' && safeName.includes(c.level)) return true;
      return false;
    });
    if (klass?.level) return klass.level;
    const n = safeName.toUpperCase();
    if (n.startsWith('PS') || n.startsWith('MS') || n.startsWith('GS')) return 'Maternelle';
    if (n.startsWith('CP') || n.startsWith('CE') || n.startsWith('CM')) return 'Primaire';
    if (n.startsWith('6') || n.startsWith('5') || n.startsWith('4') || n.startsWith('3')) return 'Collège';
    if (n.includes('SECONDE') || n.includes('PREMIERE') || n.includes('TERMINALE') || n.startsWith('2NDE') || n.startsWith('1ERE') || n.startsWith('TLE')) return 'Lycée';
    if (n.includes('CRECHE')) return 'Crèche';
    if (n.includes('GARDERIE')) return 'Garderie';
    return '—';
  };

  /** Inscriptions filtrées par cycle (Tous/Crèche/.../Lycée). */
  const filteredStudentsByLevel = niveauFilter === 'TOUS'
    ? filteredStudents
    : filteredStudents.filter(s => classNameToLevel(s.className) === niveauFilter);

  // Compteurs par cycle pour les chips
  const niveauCounts: Record<string, number> = filteredStudents.reduce((acc, s) => {
    const lvl = classNameToLevel(s.className);
    acc[lvl] = (acc[lvl] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Stats globales pour le bandeau Inscriptions
  const inscriptionStats = {
    total: filteredStudents.length,
    garcons: filteredStudents.filter(s => s.gender === 'M').length,
    filles:  filteredStudents.filter(s => s.gender === 'F').length,
  };

  /**
   * Agrégation Familles : on regroupe les parents (chefs de famille) et leurs enfants
   * par nom de famille (le backend Family est encore léger — pas d'endpoint listing).
   * Heuristique : un parent + ses enfants partageant le lastName forment une famille.
   * On enrichit avec les rôles Père/Mère (sur la base du prénom le plus fréquent par
   * nom de famille — par défaut on marque le 1er parent référent comme Père).
   */
  type FamilyCard = {
    key: string;            // lastName (uppercase) or familyId
    familyId?: string;      // Actual UUID from backend
    label: string;          // ex: "FAMILLE DIALLO"
    parents: ParentResponse[];
    students: StudentResponse[];
  };

  const familyCards: FamilyCard[] = (() => {
    const map = new Map<string, FamilyCard>();
    const upper = (s: string) => (s ?? '').trim().toUpperCase();

    parents.forEach(p => {
      const k = p.familyId || upper(p.lastName);
      if (!k) return;
      if (!map.has(k)) {
        map.set(k, { key: k, familyId: p.familyId, label: `FAMILLE ${upper(p.lastName)}`, parents: [], students: [] });
      }
      const entry = map.get(k)!;
      entry.parents.push(p);
      if (!entry.familyId && p.familyId) entry.familyId = p.familyId;
    });

    students.forEach(s => {
      const k = s.familyId || upper(s.lastName);
      if (!k) return;
      if (!map.has(k)) {
        map.set(k, { key: k, familyId: s.familyId, label: `FAMILLE ${upper(s.lastName)}`, parents: [], students: [] });
      }
      const entry = map.get(k)!;
      entry.students.push(s);
      if (!entry.familyId && s.familyId) entry.familyId = s.familyId;
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  })();

  const familySearchQ = q;
  const filteredFamilyCards = familyCards.filter(fc =>
    safeIncludes(fc.label, familySearchQ) ||
    fc.parents.some(p => safeIncludes(`${p.firstName ?? ''} ${p.lastName ?? ''}`, familySearchQ) || safeIncludes(p.email, familySearchQ)) ||
    fc.students.some(s => safeIncludes(`${s.firstName ?? ''} ${s.lastName ?? ''}`, familySearchQ)),
  );

  const familyStats = {
    totalFamilles: familyCards.length,
    totalEnfants:  familyCards.reduce((acc, f) => acc + f.students.length, 0),
    fratries:      familyCards.filter(f => f.students.length > 1).length,
  };
  const filteredTeachers  = teachers.filter(e =>
    safeIncludes(`${e.firstName ?? ''} ${e.lastName ?? ''}`, q) ||
    safeIncludes(e.specialty, q)
  );
  const filteredFamilies = parents.filter(e =>
    safeIncludes(`${e.firstName ?? ''} ${e.lastName ?? ''}`, q) ||
    safeIncludes(e.email, q)
  );
  const filteredEmployees = employees.filter(e =>
    safeIncludes(`${e.firstName ?? ''} ${e.lastName ?? ''}`, q) ||
    safeIncludes(e.email, q)
  );

  // ── Supprimer Famille ──────────────────────────────────────────────────────
  const handleDeleteFamily = async (familyId: string, label: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la ${label} et tous ses membres (parents et élèves) ?`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await userService.deleteFamily(token, familyId);
      showNotif('success', `La ${label} a été supprimée.`);
      await fetchParents();
      await refetchUT();
    } catch (err: any) {
      showNotif('error', err?.message ?? 'Erreur lors de la suppression.');
    }
  };

  // ── Reset formulaires ──────────────────────────────────────────────────────
  const resetForms = () => {
    const s = emptyStudent();
    s.registrationNumber = generateMatricule(s.arrivalDate!);
    setStudentForm(s);
    setTeacherForm(emptyTeacher());
    setParentForm(emptyParent());
    setEmployeeForm(emptyEmployee());
    setFamilyForm({
      fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherEmail: '', fatherProfession: '', fatherAddress: '',
      fatherTemporaryPassword: '',
      motherFirstName: '', motherLastName: '', motherPhone: '', motherEmail: '', motherProfession: '',
      familyEmail: '',
    });
    setStudentOptions({
      cantine: false,
      transport: 'NONE',
      tenueScolaire: false,
      tenueSport: false,
      tenueScout: false,
      tenueKarate: false,
    });
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
        arrivalDate:        row.arrivalDate ? row.arrivalDate.substring(0, 4) : '',
        gender:             row.gender ?? '',
        avatarUrl:          row.avatarUrl ?? '',
        classId:            '',
        familyId:           row.familyId ?? '',
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
    } else if (activeTab === 'familles') {
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
        if (editingId) {
          // Édition : on met simplement à jour la fiche élève existante.
          await editStudent(editingId, studentForm);
        } else {
          // Création : inscription complète Famille + Père + Élève en une transaction.
          if (!studentForm.classId) {
            throw new Error('Classe obligatoire pour une inscription.');
          }
          if (!familyForm.fatherFirstName.trim() || !familyForm.fatherLastName.trim()) {
            throw new Error('Renseignez le prénom et le nom du Père.');
          }
          if (!familyForm.fatherEmail.trim() || !familyForm.fatherPhone.trim()) {
            throw new Error('Email et téléphone du Père obligatoires.');
          }
          if (!familyForm.fatherAddress.trim()) {
            throw new Error('Adresse de la famille obligatoire.');
          }
          if (!familyForm.fatherTemporaryPassword.trim() || familyForm.fatherTemporaryPassword.length < 8) {
            throw new Error('Le mot de passe du Père est obligatoire (min. 8 car.).');
          }
          if (!studentForm.birthDate) {
            throw new Error('Date de naissance de l\'élève obligatoire.');
          }
          if (!studentForm.gender) {
            throw new Error('Genre de l\'élève obligatoire.');
          }
          if (!studentForm.email.trim() || (studentForm.password ?? '').length < 8) {
            throw new Error("Email + mot de passe (≥ 8 car.) du compte élève requis.");
          }
          await userService.registerFamilyAndStudent(token, {
            studentFirstName: studentForm.firstName,
            studentLastName: studentForm.lastName,
            studentBirthDate: studentForm.birthDate,
            studentArrivalDate: studentForm.arrivalDate,
            studentGender: (studentForm.gender as 'M' | 'F' | '') || '',
            targetClassId: studentForm.classId,
            studentEmail: studentForm.email,
            studentPassword: studentForm.password,
            registrationNumber: studentForm.registrationNumber,
            studentAvatarUrl: studentForm.avatarUrl || undefined,
            fatherFirstName: familyForm.fatherFirstName,
            fatherLastName: familyForm.fatherLastName,
            fatherEmail: familyForm.fatherEmail,
            fatherPhone: familyForm.fatherPhone,
            fatherProfession: familyForm.fatherProfession,
            fatherAddress: familyForm.fatherAddress,
            fatherTemporaryPassword: familyForm.fatherTemporaryPassword,
            motherFirstName: familyForm.motherFirstName,
            motherLastName: familyForm.motherLastName,
            motherEmail: familyForm.motherEmail,
            motherPhone: familyForm.motherPhone,
            motherProfession: familyForm.motherProfession,
            familyEmail: familyForm.familyEmail,
            hasCantine: studentOptions.cantine,
            transportMode: studentOptions.transport,
            hasTenueScolaire: studentOptions.tenueScolaire,
            hasTenueSport: studentOptions.tenueSport,
            hasTenueScout: studentOptions.tenueScout,
            hasTenueKarate: studentOptions.tenueKarate,
          });
          await refetchUT();
          await fetchParents();
        }
      } else if (activeTab === 'enseignants') {
        if (editingId) await editTeacher(editingId, teacherForm);
        else           await addTeacher(teacherForm);
      } else if (activeTab === 'familles') {
        if (editingId) await userService.updateParent(token, editingId, parentForm);
        else           await userService.createParent(token, parentForm);
        await fetchParents();
      } else {
        if (editingId) await userService.updateEmployee(token, editingId, employeeForm);
        else           await userService.createEmployee(token, employeeForm);
        await fetchEmployees();
      }
      setIsAddModalOpen(false);
      const savedMatricule = studentForm.registrationNumber;
      const savedYear = studentForm.arrivalDate;
      setEditingId(null);
      resetForms();
      showNotif('success', editingId 
        ? 'Modification enregistrée.' 
        : activeTab === 'eleves' && eleveSubTab === 'inscription'
          ? `Inscription réussie pour le matricule ${savedMatricule} (année ${savedYear}).`
          : 'Enregistrement réussi.');
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
      else if (activeTab === 'familles') {
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
      key: 'familyId', label: 'Famille / Contact',
      render: (_: any, row: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300">
            {row.familyId ? `Fam. ${String(row.familyId).slice(0, 8)}…` : row.parentName ?? '—'}
          </div>
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

  const familyColumns = [
    {
      key: 'lastName', label: 'Famille', sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">Famille {row.lastName}</div>
            <div className="text-[10px] text-gray-400 font-medium">Contact : {row.firstName} {row.lastName} · {row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Téléphone', render: (val: string) => <span className="text-sm text-gray-500">{val || '—'}</span> },
    { key: 'isActive', label: 'Statut', render: (val: boolean) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Actif' : 'Inactif'}</Badge> },
    { key: 'actions', label: '', render: renderActions },
  ];

  // ─── Colonnes pré-inscriptions ────────────────────────────────────────────
  const preEnrollmentColumns = [
    {
      key: 'studentLastName', label: 'Élève', sortable: true,
      render: (_: any, row: PreEnrollmentResponse) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.studentFirstName} ${row.studentLastName}`} size="sm" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white leading-none mb-1">
              {row.studentFirstName} {row.studentLastName}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">Réf. {row.referenceNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'targetClassName', label: 'Niveau / Classe', sortable: true,
      render: (_: any, row: PreEnrollmentResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300">{row.targetClassName}</div>
          <div className="text-gray-400 text-[10px]">{row.targetLevel}</div>
        </div>
      ),
    },
    {
      key: 'guardianLastName', label: 'Parent / Tuteur',
      render: (_: any, row: PreEnrollmentResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300">{row.guardianFirstName} {row.guardianLastName}</div>
          <div className="text-gray-400 text-[10px]">{row.guardianPhone} · {row.guardianRelationship}</div>
        </div>
      ),
    },
    {
      key: 'status', label: 'Statut',
      render: (val: PreEnrollmentStatus) => {
        const map: Record<PreEnrollmentStatus, { variant: any; label: string }> = {
          PENDING:  { variant: 'warning', label: 'En attente' },
          APPROVED: { variant: 'success', label: 'Approuvée' },
          REJECTED: { variant: 'error',   label: 'Rejetée'   },
        };
        const m = map[val] ?? map.PENDING;
        return <Badge variant={m.variant}>{m.label}</Badge>;
      },
    },
    {
      key: 'actions', label: '',
      render: (_: any, row: PreEnrollmentResponse) => (
        <div className="flex items-center justify-end gap-2 px-2">
          <button
            onClick={(e) => { e.stopPropagation(); setPreDetail(row); }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-bleu-600 transition-colors"
            title="Voir le détail"
          >
            <Eye size={16} />
          </button>
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setApproveTarget(row);
                  setApproveForm({
                    studentEmail: `${row.studentFirstName}.${row.studentLastName}`.toLowerCase().replace(/\s+/g, '') + '@eief.edu.gn',
                    studentPassword: '',
                    parentTemporaryPassword: '',
                  });
                }}
                className="p-2 hover:bg-vert-50 dark:hover:bg-vert-900/30 rounded-xl text-gray-400 hover:text-vert-600 transition-colors"
                title="Approuver"
              >
                <CheckCircle2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setRejectTarget(row); setRejectReason(''); }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                title="Rejeter"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
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

  const allTabs = [
    { id: 'eleves',      label: 'Élèves',      icon: GraduationCap, count: students.length  },
    { id: 'enseignants', label: 'Enseignants', icon: UsersIcon,     count: teachers.length  },
    { id: 'familles',    label: 'Familles',    icon: UserCheck,     count: parents.length   },
    { id: 'employes',    label: 'Employés',    icon: Briefcase,     count: employees.length },
  ] as const;
  const tabs = hideEmployeesTab ? allTabs.filter(t => t.id !== 'employes') : allTabs;

  /** Sous-onglets pour la gestion des élèves (Pré-inscription / Réinscription / Inscription). */
  const eleveSubTabs: { id: EleveSubTab; label: string; icon: any; count?: number }[] = [
    { id: 'preinscription', label: 'Pré-inscription', icon: ClipboardList, count: preEnrollments.length },
    { id: 'reinscription',  label: 'Réinscription',   icon: RefreshCw,     count: students.length },
    { id: 'inscription',    label: 'Inscription',     icon: UserPlus,      count: students.length },
  ];

  // Sécurité : si on cache l'onglet Employés alors qu'il était sélectionné,
  // bascule sur l'onglet Élèves.
  useEffect(() => {
    if (hideEmployeesTab && activeTab === 'employes') {
      setActiveTab('eleves');
    }
  }, [hideEmployeesTab, activeTab]);

  /** Quand on est sur l'onglet Élèves > Pré-inscription, on dévie vers les pré-inscriptions. */
  const isPreEnrollmentView = activeTab === 'eleves' && eleveSubTab === 'preinscription';

  const isLoading = isPreEnrollmentView                                         ? loadingPre
                  : activeTab === 'eleves' || activeTab === 'enseignants'       ? loadingUT
                  : activeTab === 'familles'                                    ? loadingP
                  : loadingE;

  const currentError = isPreEnrollmentView                                       ? errorPre
                     : activeTab === 'eleves' || activeTab === 'enseignants'     ? errorUT
                     : activeTab === 'familles'                                  ? errorP
                     : errorE;

  const currentRefetch = isPreEnrollmentView         ? fetchPreEnrollments
                       : activeTab === 'familles'    ? fetchParents
                       : activeTab === 'employes'    ? fetchEmployees
                       : refetchUT;

  const currentData = isPreEnrollmentView                                         ? filteredPreEnrollments
                    : activeTab === 'eleves' && eleveSubTab === 'inscription'     ? filteredStudentsByLevel
                    : activeTab === 'eleves'                                      ? filteredStudents
                    : activeTab === 'enseignants'                                 ? filteredTeachers
                    : activeTab === 'familles'                                    ? filteredFamilies
                    : filteredEmployees;

  /** Colonnes "Réinscrire" : on réutilise eleveColumns mais on remplace le menu d'actions. */
  const reenrollmentColumns = [
    ...eleveColumns.slice(0, -1),
    {
      key: 'actions', label: '',
      render: (_: any, row: StudentResponse) => (
        <div className="flex items-center justify-end gap-2 px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReenrollTarget(row);
              setReenrollForm({ classId: '', enrollmentDate: new Date().toISOString().slice(0, 10) });
            }}
            className="px-3 h-8 rounded-lg bg-or-50 dark:bg-or-900/20 hover:bg-or-100 dark:hover:bg-or-900/40 text-or-700 dark:text-or-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            title="Réinscrire pour l'année prochaine"
          >
            <RefreshCw size={13} /> Réinscrire
          </button>
        </div>
      ),
    },
  ];

  const currentColumns = isPreEnrollmentView                                ? preEnrollmentColumns
                       : activeTab === 'eleves' && eleveSubTab === 'reinscription' ? reenrollmentColumns
                       : activeTab === 'eleves'                             ? eleveColumns
                       : activeTab === 'enseignants'                        ? enseignantColumns
                       : activeTab === 'familles'                           ? familyColumns
                       : employeeColumns;

  // ── Titre modale ajout/édition ─────────────────────────────────────────────
  const modalIconMap: Record<TabId, { Icon: any; color: string }> = {
    eleves:      { Icon: GraduationCap, color: 'bg-bleu-100 dark:bg-bleu-900/30 text-bleu-600 dark:text-bleu-300' },
    enseignants: { Icon: UsersIcon,     color: 'bg-or-100 dark:bg-or-900/30 text-or-600 dark:text-or-300' },
    familles:    { Icon: UserCheck,     color: 'bg-vert-100 dark:bg-vert-900/30 text-vert-600 dark:text-vert-300' },
    employes:    { Icon: Briefcase,     color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' },
  };
  const modalLabels: Record<TabId, [string, string]> = {
    eleves:      ["Modifier l'Élève",      'Nouvel Élève'],
    enseignants: ["Modifier l'Enseignant", 'Nouvel Enseignant'],
    familles:    ["Modifier la Famille",   'Nouvelle Famille'],
    employes:    ["Modifier l'Employé",    'Nouvel Employé'],
  };

  /* -------- Approuver / rejeter une pré-inscription -------- */
  const handleApprove = async () => {
    if (!approveTarget) return;
    if (!approveForm.studentEmail.trim() || approveForm.studentPassword.length < 8) {
      showNotif('error', 'Email élève + mot de passe (min. 8 caractères) requis.');
      return;
    }
    const token = getToken();
    if (!token) { showNotif('error', 'Token manquant.'); return; }
    setPendingPreAction(true);
    try {
      await userService.approvePreEnrollment(token, approveTarget.id, {
        studentEmail: approveForm.studentEmail.trim(),
        studentPassword: approveForm.studentPassword,
        parentTemporaryPassword: approveForm.parentTemporaryPassword?.trim() || undefined,
      });
      setApproveTarget(null);
      await fetchPreEnrollments();
      await refetchUT();
      showNotif('success', 'Pré-inscription approuvée. Comptes parent et élève créés.');
    } catch (err: any) {
      showNotif('error', err?.message ?? "L'approbation a échoué.");
    } finally { setPendingPreAction(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { showNotif('error', 'Veuillez préciser un motif.'); return; }
    const token = getToken();
    if (!token) { showNotif('error', 'Token manquant.'); return; }
    setPendingPreAction(true);
    try {
      await userService.rejectPreEnrollment(token, rejectTarget.id, { reason: rejectReason.trim() });
      setRejectTarget(null); setRejectReason('');
      await fetchPreEnrollments();
      showNotif('success', 'Pré-inscription rejetée.');
    } catch (err: any) {
      showNotif('error', err?.message ?? 'Le rejet a échoué.');
    } finally { setPendingPreAction(false); }
  };

  /* -------- Réinscription -------- */
  const handleReenroll = async () => {
    if (!reenrollTarget) return;
    if (!reenrollForm.classId) { showNotif('error', 'Veuillez choisir une classe.'); return; }
    const token = getToken();
    if (!token) { showNotif('error', 'Token manquant.'); return; }
    setReenrolling(true);
    try {
      await userService.reenrollStudent(token, reenrollTarget.id, {
        classId: reenrollForm.classId,
        enrollmentDate: reenrollForm.enrollmentDate || undefined,
      });
      setReenrollTarget(null);
      await refetchUT();
      showNotif('success', `${reenrollTarget.firstName} ${reenrollTarget.lastName} a été réinscrit(e).`);
    } catch (err: any) {
      showNotif('error', err?.message ?? 'La réinscription a échoué.');
    } finally { setReenrolling(false); }
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
            Gérez les élèves (pré-inscriptions, réinscriptions, inscriptions), enseignants, familles et le personnel.
          </p>
        </div>
        {/* Bouton "Ajouter" masqué :
            - Vue Pré-inscription (création publique uniquement)
            - Vue Réinscription (action par ligne)
            - Onglet Familles (les familles sont créées automatiquement à l'inscription d'un élève) */}
        {!(activeTab === 'eleves' && (eleveSubTab === 'preinscription' || eleveSubTab === 'reinscription')) && (
          <Button
            onClick={e => {
              e.stopPropagation();
              setEditingId(null);
              resetForms();
              setIsAddModalOpen(true);
            }}
            className="flex gap-2 bg-gradient-to-r from-bleu-600 to-bleu-500 border-none font-semibold text-[10px] h-11 px-6 shadow-lg shadow-bleu-600/20"
          >
            <UserPlus size={18} />
            {activeTab === 'eleves' ? 'Inscrire un élève' : activeTab === 'enseignants' ? 'Ajouter enseignant' : activeTab === 'familles' ? 'Ajouter une famille' : 'Ajouter employé'}
          </Button>
        )}
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

      {/* SOUS-ONGLETS ÉLÈVES (Pré-inscription / Réinscription / Inscription) */}
      {activeTab === 'eleves' && (
        <Card className="p-3 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
              {eleveSubTabs.map(sub => {
                const Icon = sub.icon;
                const isActive = eleveSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={e => { e.stopPropagation(); setEleveSubTab(sub.id); setSearchQuery(''); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-bleu-600 text-bleu-700 dark:text-white shadow-sm'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Filtre statut pour la pré-inscription */}
            {eleveSubTab === 'preinscription' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Statut :</span>
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setPreStatusFilter(s)}
                    className={cn(
                      'px-3 h-8 rounded-lg text-[10px] font-bold transition-colors',
                      preStatusFilter === s
                        ? 'bg-bleu-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10',
                    )}
                  >
                    {s === 'PENDING' ? 'En attente' : s === 'APPROVED' ? 'Approuvées' : s === 'REJECTED' ? 'Rejetées' : 'Toutes'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── BANDEAU INSCRIPTION : stats + filtres niveau (style screenshot 1) ── */}
          {eleveSubTab === 'inscription' && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="px-4 h-10 rounded-full bg-bleu-50 dark:bg-bleu-900/20 text-bleu-700 dark:text-bleu-300 text-xs font-bold flex items-center gap-2">
                  <UsersIcon size={13} /> Total : <span className="font-black">{inscriptionStats.total}</span>
                </div>
                <div className="px-4 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-2">
                  ♂ Garçons : <span className="font-black">{inscriptionStats.garcons}</span>
                </div>
                <div className="px-4 h-10 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-xs font-bold flex items-center gap-2">
                  ♀ Filles : <span className="font-black">{inscriptionStats.filles}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['TOUS', 'Crèche', 'Garderie', 'Maternelle', 'Primaire', 'Collège', 'Lycée'] as const).map(lvl => {
                  const count = lvl === 'TOUS' ? filteredStudents.length : (niveauCounts[lvl] ?? 0);
                  const isActive = niveauFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setNiveauFilter(lvl)}
                      className={cn(
                        'px-4 h-9 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2',
                        isActive
                          ? 'bg-bleu-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10',
                      )}
                    >
                      {lvl === 'TOUS' ? 'Tous' : lvl}
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px]',
                        isActive ? 'bg-white/20 text-white' : 'bg-or-100 dark:bg-or-900/30 text-or-700 dark:text-or-400',
                      )}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ERREUR */}
      {currentError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={18} /> {currentError}
          <button onClick={currentRefetch} className="ml-auto text-[11px] underline">Réessayer</button>
        </div>
      )}

      {/* ── BANDEAU STATS FAMILLES ─────────────────────────────────────────── */}
      {activeTab === 'familles' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-none bg-gradient-to-br from-bleu-50 to-white dark:from-bleu-900/20 dark:to-gray-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-bleu-100 dark:bg-bleu-900/40 flex items-center justify-center text-bleu-600 dark:text-bleu-300">
                <UserCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Familles</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{familyStats.totalFamilles}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-none bg-gradient-to-br from-vert-50 to-white dark:from-vert-900/20 dark:to-gray-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-vert-100 dark:bg-vert-900/40 flex items-center justify-center text-vert-600 dark:text-vert-300">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enfants</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{familyStats.totalEnfants}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-none bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-gray-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-300">
                <UsersIcon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fratries</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{familyStats.fratries}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TABLEAU / GRILLE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${activeTab === 'eleves' ? eleveSubTab : ''}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'familles' ? (
            // ── Grille de cartes Familles (style screenshot 2) ──
            <Card className="p-4 border-none shadow-soft dark:bg-gray-900/50 dark:backdrop-blur-md">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 size={22} className="animate-spin" />
                  <span className="text-sm font-medium">Chargement...</span>
                </div>
              ) : filteredFamilyCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <UsersIcon size={40} className="opacity-20" />
                  <span className="text-sm font-medium">Aucune famille enregistrée</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFamilyCards.map(fc => {
                    const hasFather = fc.parents.some(p => p.firstName); // au moins un parent référent
                    const hasMother = fc.parents.length > 1;             // 2e parent = mère par convention
                    const isFratrie = fc.students.length > 1;
                    const isIndividual = fc.students.length === 1;
                    return (
                      <div
                        key={fc.key}
                        onClick={() => {
                          // On affiche le profil du 1er parent comme représentant de la famille
                          if (fc.parents[0]) {
                            setProfileRow({ ...fc.parents[0], students: fc.students });
                            setIsProfileOpen(true);
                          }
                        }}
                        className={cn(
                          'group relative rounded-2xl bg-white dark:bg-gray-900 border-l-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg p-4 transition-all cursor-pointer',
                          isFratrie ? 'border-l-vert-500' : 'border-l-bleu-500',
                        )}
                      >                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bleu-50 dark:bg-bleu-900/30 flex items-center justify-center text-bleu-600 dark:text-bleu-300 shrink-0">
                            <UserCheck size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-gray-900 dark:text-white truncate">
                              {fc.label}{isIndividual ? ' INDIVIDUEL' : ''}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {fc.students.length} enfant{fc.students.length > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                // Pour la modif, on prend le 1er parent trouvé pour pré-remplir
                                // ou on pourrait ouvrir une modale dédiée.
                                const p = fc.parents[0];
                                if (p) {
                                  setEditingId(p.id);
                                  setParentForm({
                                    ...p,
                                    roleName: 'PARENT',
                                    password: ''
                                  } as ParentRequest);
                                  setIsAddModalOpen(true);
                                }                              }}
                              className="p-1.5 rounded-lg hover:bg-bleu-50 dark:hover:bg-bleu-900/30 text-gray-400 hover:text-bleu-600 transition-colors"
                              title="Modifier"
                            >
                              <Edit size={14} />
                            </button>
                             <button
                               onClick={e => {
                                 e.stopPropagation();
                                 if (fc.familyId) {
                                   handleDeleteFamily(fc.familyId, fc.label);
                                 } else {
                                   showNotif('error', 'Impossible de supprimer cette famille : ID manquant.');
                                 }
                               }}
                               className="p-1.5 rounded-lg hover:bg-rouge-50 dark:hover:bg-rouge-900/30 text-gray-400 hover:text-rouge-600 transition-colors"
                               title="Supprimer"
                             >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-bleu-500 transition-colors shrink-0" />
                          </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {hasFather && (
                            <span className="text-[10px] font-bold text-bleu-700 dark:text-bleu-300 inline-flex items-center gap-1 bg-bleu-50 dark:bg-bleu-900/30 px-2.5 py-1 rounded-full">
                              👨 Père
                            </span>
                          )}
                          {hasMother && (
                            <span className="text-[10px] font-bold text-rouge-600 dark:text-rouge-300 inline-flex items-center gap-1 bg-rouge-50 dark:bg-rouge-900/30 px-2.5 py-1 rounded-full">
                              👩 Mère
                            </span>
                          )}
                          {isFratrie && (
                            <span className="text-[10px] font-bold text-vert-700 dark:text-vert-300 inline-flex items-center gap-1 bg-vert-50 dark:bg-vert-900/30 px-2.5 py-1 rounded-full">
                              ❤️ Fratrie
                            </span>
                          )}
                        </div>

                        {fc.students.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 space-y-1">
                            {fc.students.slice(0, 3).map(s => (
                              <p key={s.id} className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                · {s.firstName} {s.lastName} <span className="text-gray-300">— {s.className || '—'}</span>
                              </p>
                            ))}
                            {fc.students.length > 3 && (
                              <p className="text-[10px] italic text-gray-400">+ {fc.students.length - 3} autre{fc.students.length - 3 > 1 ? 's' : ''}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-2 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 size={22} className="animate-spin" />
                  <span className="text-sm font-medium">Chargement...</span>
                </div>
              ) : currentData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  {isPreEnrollmentView
                    ? <ClipboardList size={40} className="opacity-20" />
                    : <UsersIcon size={40} className="opacity-20" />}
                  <span className="text-sm font-medium">
                    {isPreEnrollmentView
                      ? `Aucune pré-inscription ${preStatusFilter === 'PENDING' ? 'en attente' : preStatusFilter === 'APPROVED' ? 'approuvée' : preStatusFilter === 'REJECTED' ? 'rejetée' : ''}`
                      : 'Aucun utilisateur trouvé'}
                  </span>
                </div>
              ) : (
                <Table data={currentData as any} columns={currentColumns as any} />
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        {tabs.map(t => (
          <Card key={t.id} className="p-6 border-none bg-gradient-to-br from-bleu-500/5 to-or-500/5 dark:from-bleu-900/10 dark:to-or-900/10 backdrop-blur-sm relative overflow-hidden">
            <p className="text-gray-400 text-[10px] font-semibold mb-1">{t.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.id === 'eleves' ? students.length : t.id === 'enseignants' ? teachers.length : t.id === 'familles' ? parents.length : employees.length}
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
                value={activeTab === 'eleves' ? studentForm.firstName : activeTab === 'enseignants' ? teacherForm.firstName : activeTab === 'familles' ? parentForm.firstName : employeeForm.firstName}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, firstName: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, firstName: v }));
                  else if (activeTab === 'familles')    setParentForm(f => ({ ...f, firstName: v }));
                  else                                  setEmployeeForm(f => ({ ...f, firstName: v }));
                }}
              />
              <Input label="Nom de famille" placeholder="ex: Diallo"
                value={activeTab === 'eleves' ? studentForm.lastName : activeTab === 'enseignants' ? teacherForm.lastName : activeTab === 'familles' ? parentForm.lastName : employeeForm.lastName}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, lastName: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, lastName: v }));
                  else if (activeTab === 'familles')    setParentForm(f => ({ ...f, lastName: v }));
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
                value={activeTab === 'eleves' ? studentForm.email : activeTab === 'enseignants' ? teacherForm.email : activeTab === 'familles' ? parentForm.email : employeeForm.email}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, email: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, email: v }));
                  else if (activeTab === 'familles')    setParentForm(f => ({ ...f, email: v }));
                  else                                  setEmployeeForm(f => ({ ...f, email: v }));
                }}
              />
              <Input label={editingId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} placeholder="Min. 8 caractères" type="password"
                value={activeTab === 'eleves' ? studentForm.password : activeTab === 'enseignants' ? teacherForm.password : activeTab === 'familles' ? parentForm.password : employeeForm.password}
                onChange={e => {
                  const v = e.target.value;
                  if (activeTab === 'eleves')           setStudentForm(f => ({ ...f, password: v }));
                  else if (activeTab === 'enseignants') setTeacherForm(f => ({ ...f, password: v }));
                  else if (activeTab === 'familles')    setParentForm(f => ({ ...f, password: v }));
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
                <Input label="Année d'arrivée" type="number"
                  min="2000" max="2100"
                  value={studentForm.arrivalDate ?? ''}
                  onChange={e => {
                    const year = e.target.value;
                    const matricule = generateMatricule(year);
                    setStudentForm(f => ({ 
                      ...f, 
                      arrivalDate: year,
                      registrationNumber: editingId ? f.registrationNumber : matricule 
                    }));
                  }}
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
                <Input label="Photo élève (URL ou data URL)" placeholder="https://... ou data:image/..."
                  value={studentForm.avatarUrl ?? ''}
                  onChange={e => setStudentForm(f => ({ ...f, avatarUrl: e.target.value }))}
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
                {editingId && (
                  <Select
                    label="Famille (rattachement existant)"
                    options={[
                      { value: '', label: parents.length === 0 ? 'Aucune famille disponible' : 'Sélectionner une famille...' },
                      ...parents.map(p => ({
                        value: p.id,
                        label: `Famille ${p.lastName} (${p.firstName})`,
                      })),
                    ]}
                    value={studentForm.familyId ?? ''}
                    onChange={e => setStudentForm(f => ({ ...f, familyId: e.target.value }))}
                  />
                )}
              </div>
            </div>
          )}

          {/* ─ Père & Mère (création uniquement) ─ */}
          {activeTab === 'eleves' && !editingId && (
            <>
              <div>
                <p className="text-[10px] font-bold text-bleu-600 dark:text-bleu-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-3 bg-bleu-500 rounded-full" /> 👨 Informations du Père
                  <span className="ml-auto text-[8px] text-rouge-500 font-bold normal-case tracking-normal">obligatoire</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Prénom du père" placeholder="ex: Mamadou"
                    value={familyForm.fatherFirstName}
                    onChange={e => setFamilyForm(f => ({ ...f, fatherFirstName: e.target.value }))}
                  />
                  <Input label="Nom du père" placeholder="ex: Diallo"
                    value={familyForm.fatherLastName}
                    onChange={e => setFamilyForm(f => ({ ...f, fatherLastName: e.target.value }))}
                  />
                  <Input label="Email du père" type="email" placeholder="papa@exemple.com"
                    value={familyForm.fatherEmail}
                    onChange={e => setFamilyForm(f => ({ ...f, fatherEmail: e.target.value }))}
                  />
                  <Input label="Téléphone du père" placeholder="+224 ..."
                    value={familyForm.fatherPhone}
                    onChange={e => setFamilyForm(f => ({ ...f, fatherPhone: e.target.value }))}
                  />
                  <Input label="Profession (optionnel)" placeholder="ex: Ingénieur"
                   value={familyForm.fatherProfession}
                   onChange={e => setFamilyForm(f => ({ ...f, fatherProfession: e.target.value }))}
                  />
                  <Input label="Mot de passe du Père" type="password" placeholder="Min. 8 caractères"
                   value={familyForm.fatherTemporaryPassword}
                   onChange={e => setFamilyForm(f => ({ ...f, fatherTemporaryPassword: e.target.value }))}
                  />
                  <Input label="Adresse de la famille" placeholder="Quartier, ville"
                    value={familyForm.fatherAddress}
                    onChange={e => setFamilyForm(f => ({ ...f, fatherAddress: e.target.value }))}
                  />
                  <Input label="Email de contact général (optionnel)" placeholder="famille@exemple.com"
                    value={familyForm.familyEmail}
                    onChange={e => setFamilyForm(f => ({ ...f, familyEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-rouge-500 dark:text-rouge-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-3 bg-rouge-500 rounded-full" /> 👩 Informations de la Mère
                  <span className="ml-auto text-[8px] text-gray-400 font-bold normal-case tracking-normal">optionnel</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Prénom de la mère" placeholder="ex: Mariama"
                    value={familyForm.motherFirstName}
                    onChange={e => setFamilyForm(f => ({ ...f, motherFirstName: e.target.value }))}
                  />
                  <Input label="Nom de la mère" placeholder="ex: Diallo"
                    value={familyForm.motherLastName}
                    onChange={e => setFamilyForm(f => ({ ...f, motherLastName: e.target.value }))}
                  />
                  <Input label="Email de la mère" type="email" placeholder="maman@exemple.com"
                    value={familyForm.motherEmail}
                    onChange={e => setFamilyForm(f => ({ ...f, motherEmail: e.target.value }))}
                  />
                  <Input label="Téléphone de la mère" placeholder="+224 ..."
                    value={familyForm.motherPhone}
                    onChange={e => setFamilyForm(f => ({ ...f, motherPhone: e.target.value }))}
                  />
                  <Input label="Profession (optionnel)" placeholder="ex: Enseignante"
                    value={familyForm.motherProfession}
                    onChange={e => setFamilyForm(f => ({ ...f, motherProfession: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic mt-3">
                  La famille (Père obligatoire, Mère optionnelle) est créée automatiquement lors de l'enregistrement de l'élève.
                </p>
              </div>

              {/* ─ Options pour cet enfant ─ */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-3 bg-vert-500 rounded-full" /> ⚙️ Options pour cet enfant
                </p>
                
                <div className="space-y-4">
                  {/* Cantine */}
                  <button
                    type="button"
                    onClick={() => setStudentOptions(p => ({ ...p, cantine: !p.cantine }))}
                    className={cn(
                      'w-full text-left flex gap-4 items-start p-4 rounded-2xl border-2 transition-all',
                      studentOptions.cantine
                        ? 'bg-bleu-50 dark:bg-bleu-900/20 border-bleu-400'
                        : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-bleu-300',
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                      studentOptions.cantine ? 'bg-bleu-600 border-bleu-600' : 'border-gray-300'
                    )}>
                      {studentOptions.cantine && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className="text-xl shrink-0">🍽️</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Cantine scolaire</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 leading-tight">Repas chauds et équilibrés servis chaque jour à l'école.</p>
                      <p className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400">💰 400 000 GNF / mois</p>
                    </div>
                  </button>

                  {/* Transport */}
                  <div className={cn(
                    'p-4 rounded-2xl border-2 transition-all space-y-3',
                    studentOptions.transport !== 'NONE'
                      ? 'bg-bleu-50 dark:bg-bleu-900/20 border-bleu-400'
                      : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-bleu-300'
                  )}>
                    <div className="flex gap-4 items-start">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                        studentOptions.transport !== 'NONE' ? 'bg-bleu-600 border-bleu-600' : 'border-gray-300'
                      )}>
                        {studentOptions.transport !== 'NONE' && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-xl shrink-0">🚌</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Transport scolaire</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 leading-tight">Navette aller-retour sécurisée avec chauffeur dédié.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-9">
                      {(['PETIT_TRAJET', 'LONG_TRAJET'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setStudentOptions(p => ({ ...p, transport: p.transport === mode ? 'NONE' : mode }))}
                          className={cn(
                            'p-2 rounded-xl border text-[10px] font-bold transition-all',
                            studentOptions.transport === mode
                              ? 'bg-bleu-600 text-white border-bleu-600'
                              : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400'
                          )}
                        >
                          {mode === 'PETIT_TRAJET' ? '🚗 Petit (300k)' : '🚐 Long (350k)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Uniformes */}
                  <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-xl">👔</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Uniformes & Équipements</h4>
                        <p className="text-[10px] text-gray-400">Sélectionnez les tenues souhaitées</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'tenueScolaire', icon: '👕', title: 'Scolaire', price: '350k / 450k' },
                        { id: 'tenueSport',    icon: '🤸', title: 'Sport',    price: '100k' },
                        { id: 'tenueScout',    icon: '⚜️', title: 'Scout',    price: '250k' },
                        { id: 'tenueKarate',   icon: '🥋', title: 'Karaté',   price: '200k' },
                      ].map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setStudentOptions(p => ({ ...p, [u.id]: !(p as any)[u.id] }))}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-all',
                            (studentOptions as any)[u.id]
                              ? 'bg-white dark:bg-white/10 border-bleu-400 shadow-sm'
                              : 'bg-white dark:bg-white/5 border-gray-50 dark:border-white/5 hover:border-bleu-200',
                          )}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                            (studentOptions as any)[u.id] ? 'bg-bleu-600 border-bleu-600' : 'border-gray-300'
                          )}>
                            {(studentOptions as any)[u.id] && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{u.icon} {u.title}</p>
                            <p className="text-[9px] text-bleu-600 dark:text-bleu-400 font-bold">{u.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
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

          {/* ─ Champs spécifiques familles (chef de famille = parent référent) ─ */}
          {activeTab === 'familles' && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-vert-500 rounded-full" /> Détails de la Famille
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Téléphone" placeholder="+224 ..."
                  value={parentForm.phone ?? ''}
                  onChange={e => setParentForm(f => ({ ...f, phone: e.target.value }))}
                />
                <Input label="Adresse de la famille" placeholder="Quartier, ville"
                  value={parentForm.address ?? ''}
                  onChange={e => setParentForm(f => ({ ...f, address: e.target.value }))}
                />
                <Select label="Relation"
                  options={[
                    { value: 'Pere', label: 'Père' },
                    { value: 'Mere', label: 'Mère' },
                    { value: 'Tuteur', label: 'Tuteur/Autre' },
                  ]}
                  value={parentForm.relationship ?? ''}
                  onChange={e => setParentForm(f => ({ ...f, relationship: e.target.value }))}
                />
              </div>
              <p className="text-[10px] text-gray-400 italic mt-3">
                Une famille est représentée par un parent référent. Les enfants seront rattachés à cette famille via leur fiche élève.
              </p>
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
              {deleting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODALE DÉTAIL PRÉ-INSCRIPTION ─────────────────────────────────────── */}
      <Modal
        isOpen={!!preDetail}
        onClose={() => setPreDetail(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bleu-100 dark:bg-bleu-900/30 rounded-xl text-bleu-600">
              <ClipboardList size={22} />
            </div>
            <span className="font-bold gradient-bleu-or-text">Détail de la pré-inscription</span>
          </div>
        }
        size="lg"
      >
        {preDetail && (
          <div className="space-y-5 text-left py-2">
            <div className="bg-gradient-to-br from-bleu-500 to-bleu-600 text-white rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">Référence</p>
              <p className="text-lg font-bold">{preDetail.referenceNumber}</p>
              <p className="text-xs opacity-80 mt-1">Soumise le {new Date(preDetail.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Élève */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-bleu-500" /> Informations de l'élève
              </p>
              <DetailRow icon={<User size={14} />}     label="Nom & Prénom"      value={`${preDetail.studentFirstName} ${preDetail.studentLastName}`} />
              <DetailRow icon={<Calendar size={14} />} label="Date de naissance" value={preDetail.studentBirthDate} />
              <DetailRow icon={<User size={14} />}     label="Sexe"              value={preDetail.studentGender === 'M' ? 'Masculin' : preDetail.studentGender === 'F' ? 'Féminin' : preDetail.studentGender} />
              <DetailRow icon={<BookOpen size={14} />} label="Niveau souhaité"   value={preDetail.targetLevel} />
              <DetailRow icon={<BookOpen size={14} />} label="Classe souhaitée"  value={preDetail.targetClassName} />
            </div>

            {/* Options */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-purple-500" /> Options souhaitées
              </p>
              <DetailRow 
                icon={<span>🍽️</span>} 
                label="Cantine scolaire" 
                value={preDetail.hasCantine ? "Oui (400 000 GNF/mois)" : "Non"} 
              />
              <DetailRow 
                icon={<span>🚌</span>} 
                label="Transport scolaire" 
                value={
                  preDetail.transportMode === 'PETIT_TRAJET' ? "Oui - Petit trajet (300 000 GNF/mois)" :
                  preDetail.transportMode === 'LONG_TRAJET' ? "Oui - Long trajet (350 000 GNF/mois)" : "Non"
                } 
              />
              {(preDetail.hasTenueScolaire || preDetail.hasTenueSport || preDetail.hasTenueScout || preDetail.hasTenueKarate) && (
                <DetailRow 
                  icon={<span>👔</span>} 
                  label="Uniformes & Équipements" 
                  value={[
                    preDetail.hasTenueScolaire ? "Tenue scolaire" : null,
                    preDetail.hasTenueSport ? "Tenue de sport" : null,
                    preDetail.hasTenueScout ? "Tenue Scout" : null,
                    preDetail.hasTenueKarate ? "Tenue de Karaté" : null
                  ].filter(Boolean).join(', ')} 
                />
              )}
            </div>

            {/* Parent / Tuteur */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-vert-500" /> Parent / Tuteur
              </p>
              <DetailRow icon={<User size={14} />}      label="Nom & Prénom" value={`${preDetail.guardianFirstName} ${preDetail.guardianLastName}`} />
              <DetailRow icon={<Mail size={14} />}      label="Email"        value={preDetail.guardianEmail} />
              <DetailRow icon={<Phone size={14} />}     label="Téléphone"    value={preDetail.guardianPhone} />
              <DetailRow icon={<UserCheck size={14} />} label="Lien"         value={preDetail.guardianRelationship} />
              <DetailRow icon={<FileText size={14} />}  label="Adresse"      value={preDetail.guardianAddress} />
            </div>

            {/* Statut & décision */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 rounded-full bg-or-500" /> Décision administrative
              </p>
              <DetailRow icon={<Shield size={14} />} label="Statut" value={preDetail.status} />
              {preDetail.reviewedAt  && <DetailRow icon={<Calendar size={14} />} label="Décidé le"   value={new Date(preDetail.reviewedAt).toLocaleString('fr-FR')} />}
              {preDetail.reviewedBy  && <DetailRow icon={<User size={14} />}     label="Décidé par"  value={preDetail.reviewedBy} />}
              {preDetail.rejectionReason && <DetailRow icon={<XCircle size={14} />} label="Motif rejet" value={preDetail.rejectionReason} />}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setPreDetail(null)} className="flex-1 h-11">Fermer</Button>
              {preDetail.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => {
                      const r = preDetail;
                      setPreDetail(null);
                      setApproveTarget(r);
                      setApproveForm({
                        studentEmail: `${r.studentFirstName}.${r.studentLastName}`.toLowerCase().replace(/\s+/g, '') + '@eief.edu.gn',
                        studentPassword: '',
                        parentTemporaryPassword: '',
                      });
                    }}
                    className="flex-1 h-11 bg-vert-600 hover:bg-vert-700 border-none flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} /> Approuver
                  </Button>
                  <Button
                    onClick={() => { const r = preDetail; setPreDetail(null); setRejectTarget(r); setRejectReason(''); }}
                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 border-none flex items-center justify-center gap-2"
                  >
                    <XCircle size={15} /> Rejeter
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODALE APPROUVER PRÉ-INSCRIPTION ──────────────────────────────────── */}
      <Modal
        isOpen={!!approveTarget}
        onClose={() => !pendingPreAction && setApproveTarget(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vert-100 dark:bg-vert-900/30 rounded-xl text-vert-600">
              <CheckCircle2 size={22} />
            </div>
            <span className="font-bold text-vert-700 dark:text-vert-400">Approuver la pré-inscription</span>
          </div>
        }
        size="md"
      >
        {approveTarget && (
          <div className="space-y-5 text-left py-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-vert-50 dark:bg-vert-900/20 rounded-xl p-3">
              L'approbation crée automatiquement <strong>une famille</strong>, le compte <strong>parent</strong>
              ({approveTarget.guardianEmail}) et le compte <strong>élève</strong> rattachés à la classe « {approveTarget.targetClassName} ».
            </div>
            <Input
              label="Email du futur compte élève"
              type="email"
              value={approveForm.studentEmail}
              onChange={e => setApproveForm(f => ({ ...f, studentEmail: e.target.value }))}
              placeholder="prenom.nom@eief.edu.gn"
            />
            <Input
              label="Mot de passe initial de l'élève (min. 8 caractères)"
              type="password"
              value={approveForm.studentPassword}
              onChange={e => setApproveForm(f => ({ ...f, studentPassword: e.target.value }))}
              placeholder="••••••••"
            />
            <Input
              label="Mot de passe temporaire du parent (optionnel — sinon généré)"
              type="password"
              value={approveForm.parentTemporaryPassword ?? ''}
              onChange={e => setApproveForm(f => ({ ...f, parentTemporaryPassword: e.target.value }))}
              placeholder="Laisser vide pour génération automatique"
            />
            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={pendingPreAction} className="flex-1 h-12">Annuler</Button>
              <Button
                onClick={handleApprove}
                disabled={pendingPreAction}
                className="flex-1 h-12 bg-vert-600 hover:bg-vert-700 border-none flex items-center justify-center gap-2"
              >
                {pendingPreAction && <Loader2 size={16} className="animate-spin" />}
                Confirmer l'approbation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODALE REJETER PRÉ-INSCRIPTION ────────────────────────────────────── */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => !pendingPreAction && setRejectTarget(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
              <XCircle size={22} />
            </div>
            <span className="font-bold text-red-600">Rejeter la pré-inscription</span>
          </div>
        }
        size="md"
      >
        {rejectTarget && (
          <div className="space-y-5 text-left py-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Vous êtes sur le point de rejeter la demande pour <strong>{rejectTarget.studentFirstName} {rejectTarget.studentLastName}</strong> (Réf. {rejectTarget.referenceNumber}).
            </p>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Motif du rejet *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Précisez les raisons (dossier incomplet, classe pleine, etc.)"
                className="w-full min-h-[100px] p-3 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-red-400 rounded-xl outline-none text-sm font-medium resize-y"
              />
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={pendingPreAction} className="flex-1 h-12">Annuler</Button>
              <Button
                onClick={handleReject}
                disabled={pendingPreAction}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none flex items-center justify-center gap-2"
              >
                {pendingPreAction && <Loader2 size={16} className="animate-spin" />}
                Confirmer le rejet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!reenrollTarget}
        onClose={() => !reenrolling && setReenrollTarget(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-or-100 dark:bg-or-900/30 rounded-xl text-or-600">
              <RefreshCw size={22} />
            </div>
            <span className="font-bold gradient-bleu-or-text">Reinscrire l'eleve</span>
          </div>
        }
        size="md"
      >
        {reenrollTarget && (
          <div className="space-y-5 text-left py-2">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <Avatar name={`${reenrollTarget.firstName} ${reenrollTarget.lastName}`} size="sm" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{reenrollTarget.firstName} {reenrollTarget.lastName}</p>
                <p className="text-[11px] text-gray-400">Matricule : {reenrollTarget.registrationNumber} - Classe actuelle : {reenrollTarget.className}</p>
              </div>
            </div>

            <Select
              label="Nouvelle classe"
              options={[
                { value: '', label: classes.length === 0 ? 'Aucune classe disponible' : 'Selectionner une classe...' },
                ...classes.map(c => ({ value: c.id, label: c.level ? `${c.name} - ${c.level}` : c.name })),
              ]}
              value={reenrollForm.classId}
              onChange={e => setReenrollForm(f => ({ ...f, classId: e.target.value }))}
            />
            <Input
              label="Date d'inscription (optionnel)"
              type="date"
              value={reenrollForm.enrollmentDate}
              onChange={e => setReenrollForm(f => ({ ...f, enrollmentDate: e.target.value }))}
            />

            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              <Button variant="outline" onClick={() => setReenrollTarget(null)} disabled={reenrolling} className="flex-1 h-12">Annuler</Button>
              <Button
                onClick={handleReenroll}
                disabled={reenrolling}
                className="flex-1 h-12 bg-or-600 hover:bg-or-500 border-none text-gray-950 flex items-center justify-center gap-2"
              >
                {reenrolling && <Loader2 size={16} className="animate-spin" />}
                Confirmer la reinscription
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <NotificationToast notif={notif} onClose={closeNotif} />
    </motion.div>
  );
};

export default AdminUsers;
