import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  GraduationCap,
  Camera,
  Upload,
  Eye,
  Download,
  Plus,
  Trash2,
  Rocket,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils/cn';
import PublicNav from '../components/shared/PublicNav';
import PublicFooter from '../components/shared/PublicFooter';
import { apiRequest } from '../services/api';
import { userService } from '../services/userService';

/** Forme retournée par GET /courses/classes (backend public). */
interface BackendClass {
  id: string;
  name: string;
  level: string;
}

/* -------------------------------------------------------------------------- */
/*  CONSTANTES                                                                 */
/* -------------------------------------------------------------------------- */

const NIVEAUX: { value: string; label: string; classes: string[] }[] = [
  { value: 'creche', label: '🍼 Crèche', classes: ['Crèche'] },
  { value: 'garderie', label: '🧸 Garderie', classes: ['Garderie'] },
  { value: 'maternelle', label: '🌱 Maternelle', classes: ['Petite Section', 'Moyenne Section', 'Grande Section'] },
  { value: 'primaire', label: '📚 Primaire', classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { value: 'college', label: '🎒 Collège', classes: ['6ème', '5ème', '4ème', '3ème'] },
  { value: 'lycee', label: '🎓 Lycée', classes: ['Seconde', 'Première', 'Terminale'] },
];

const DOSSIER_ITEMS: string[] = [
  'Extrait de naissance',
  'Certificat de scolarité (ancienne école)',
  'Bulletins scolaires (année précédente)',
  "Photos d'identité (4 photos)",
  'Carnet de vaccination',
  'Certificat médical',
  "Pièce d'identité du parent/tuteur",
  'Justificatif de domicile',
];

const FICHES_PDF = [
  {
    title: 'FICHE DE RENSEIGNEMENT 2026 - 2027',
    filename: 'FICHE DE RENSEIGNEMENT 2026-2027.pdf',
    src: '/fichederenseignements.pdf',
  },
  {
    title: "FICHE DE RENSEIGNEMENT CLASSES D'EXAMEN",
    filename: 'FICHE DE RENSEIGNEMENT 2026-2027 - EXAMEN.pdf',
    src: '/2026-2027EXAMEN.pdf',
  },
];

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface Enfant {
  id: number;
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe: '' | 'M' | 'F';
  niveau: string;
  /** Nom de la classe (libellé affiché). */
  classe: string;
  /** UUID backend de la classe — exigé par POST /pre-enrollments. */
  classeId: string;
  options: Options;
}

interface ParentInfos {
  pereNom: string;
  perePrenom: string;
  pereProfession: string;
  perePhone: string;
  pereEmail: string;
  mereNom: string;
  merePrenom: string;
  mereProfession: string;
  merePhone: string;
  mereEmail: string;
  email: string;
  /** Adresse du foyer — requise par le backend (guardianAddress). */
  adresse: string;
}

interface Options {
  cantine: boolean;
  transport: 'NONE' | 'PETIT_TRAJET' | 'LONG_TRAJET';
  tenueScolaire: boolean;
  tenueSport: boolean;
  tenueScout: boolean;
  tenueKarate: boolean;
}

const makeEnfant = (id: number): Enfant => ({
  id,
  prenom: '',
  nom: '',
  dateNaissance: '',
  sexe: '',
  niveau: '',
  classe: '',
  classeId: '',
  options: {
    cantine: false,
    transport: 'NONE',
    tenueScolaire: false,
    tenueSport: false,
    tenueScout: false,
    tenueKarate: false,
  },
});

/* -------------------------------------------------------------------------- */
/*  COMPOSANT PRINCIPAL                                                        */
/* -------------------------------------------------------------------------- */

const PreInscription: React.FC = () => {
  const [enfants, setEnfants] = useState<Enfant[]>([makeEnfant(1)]);
  const [parent, setParent] = useState<ParentInfos>({
    pereNom: '',
    perePrenom: '',
    pereProfession: '',
    perePhone: '',
    pereEmail: '',
    mereNom: '',
    merePrenom: '',
    mereProfession: '',
    merePhone: '',
    mereEmail: '',
    email: '',
    adresse: '',
  });

  /** Classes récupérées du backend (GET /courses/classes — endpoint public). */
  const [backendClasses, setBackendClasses] = useState<BackendClass[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Charge les classes au montage. En cas d'échec, on garde la liste statique
  // de NIVEAUX comme fallback purement visuel (la soumission échouera tant
  // qu'on n'a pas de classeId réel).
  useEffect(() => {
    let cancelled = false;
    apiRequest<BackendClass[]>('/courses/classes')
      .then(data => { if (!cancelled) setBackendClasses(data ?? []); })
      .catch(() => { /* silencieux : fallback NIVEAUX statiques */ });
    return () => { cancelled = true; };
  }, []);

  /** Mappe un libellé de niveau (de NIVEAUX) → niveau backend (Crèche, Maternelle, …). */
  const niveauLabelToBackend = (niveauValue: string): string => {
    switch (niveauValue) {
      case 'creche':     return 'Crèche';
      case 'garderie':   return 'Garderie';
      case 'maternelle': return 'Maternelle';
      case 'primaire':   return 'Primaire';
      case 'college':    return 'Collège';
      case 'lycee':      return 'Lycée';
      default:           return '';
    }
  };

  /** Pour un niveau donné, retourne les classes backend correspondantes. */
  const classesPourNiveau = (niveauValue: string): BackendClass[] => {
    const target = niveauLabelToBackend(niveauValue).toLowerCase();
    if (!target) return [];
    return backendClasses.filter(c => (c.level ?? '').toLowerCase() === target);
  };

  // Documents par enfant : { [enfantId]: { [docName]: File } }
  const [documents, setDocuments] = useState<Record<number, Record<string, File | null>>>({
    1: Object.fromEntries(DOSSIER_ITEMS.map((d) => [d, null])),
  });

  /* ----- Helpers enfants ------------------------------------------------- */
  const addEnfant = () => {
    const lastId = enfants.length > 0 ? enfants[enfants.length - 1].id : 0;
    const nextId = lastId + 1;
    setEnfants((prev) => [...prev, makeEnfant(nextId)]);
    setDocuments((prev) => ({
      ...prev,
      [nextId]: Object.fromEntries(DOSSIER_ITEMS.map((d) => [d, null])),
    }));
  };

  const removeEnfant = (id: number) => {
    if (enfants.length === 1) return;
    setEnfants((prev) => prev.filter((e) => e.id !== id));
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEnfant = <K extends keyof Enfant>(id: number, field: K, value: Enfant[K]) => {
    setEnfants((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              // Quand le niveau change, on remet à zéro classe + classeId
              // (sinon on garde une classe d'un autre niveau).
              ...(field === 'niveau' ? { classe: '', classeId: '' } : {}),
            }
          : e,
      ),
    );
  };

  const updateOptions = (id: number, options: Options) => {
    updateEnfant(id, 'options', options);
  };

  /* ----- Helpers documents ----------------------------------------------- */
  const setDocument = (enfantId: number, docName: string, file: File | null) => {
    setDocuments((prev) => ({
      ...prev,
      [enfantId]: { ...(prev[enfantId] ?? {}), [docName]: file },
    }));
    if (file) toast.success(`${docName} ajouté`);
  };

  const docsAdded = (enfantId: number) =>
    Object.values(documents[enfantId] ?? {}).filter(Boolean).length;

  /* ----- Submit ---------------------------------------------------------- */
  /**
   * Envoie une demande de pré-inscription au backend (POST /pre-enrollments)
   * pour CHAQUE enfant. Le backend crée un enregistrement PreEnrollmentApplication
   * avec statut PENDING, visible côté admin dans l'onglet Élèves > Pré-inscription.
   *
   * Le backend exige :
   *   studentFirstName, studentLastName, studentBirthDate, studentGender,
   *   targetClassId (UUID), guardianFirstName, guardianLastName,
   *   guardianEmail, guardianPhone, guardianRelationship, guardianAddress.
   */
  const handleSubmit = async () => {
    // ---- Validations ----
    if (enfants.some((e) => !e.prenom.trim() || !e.nom.trim())) {
      toast.error("Renseignez le nom et prénom de chaque enfant");
      return;
    }
    if (enfants.some((e) => !e.dateNaissance || !e.sexe)) {
      toast.error("Renseignez la date de naissance et le sexe de chaque enfant");
      return;
    }
    if (enfants.some((e) => !e.classeId)) {
      toast.error("Sélectionnez une classe pour chaque enfant");
      return;
    }
    // Au moins un parent renseigné, avec téléphone et email pour contact backend
    const hasFather = parent.pereNom.trim() && parent.perePrenom.trim();
    const hasMother = parent.mereNom.trim() && parent.merePrenom.trim();
    if (!hasFather && !hasMother) {
      toast.error('Renseignez les nom et prénom d\'au moins un parent');
      return;
    }
    const guardianPhone = parent.perePhone.trim() || parent.merePhone.trim();
    if (!guardianPhone) {
      toast.error('Au moins un contact téléphonique parent est requis');
      return;
    }
    const guardianEmail = (parent.pereEmail.trim() || parent.mereEmail.trim() || parent.email.trim());
    if (!guardianEmail) {
      toast.error('Renseignez un email de contact (parent ou général)');
      return;
    }
    if (!parent.adresse.trim()) {
      toast.error("Renseignez l'adresse de la famille");
      return;
    }

    // ---- Appel API : un POST /pre-enrollments par enfant ----
    setSubmitting(true);
    const guardianFirstName = hasFather ? parent.perePrenom.trim() : parent.merePrenom.trim();
    const guardianLastName  = hasFather ? parent.pereNom.trim()    : parent.mereNom.trim();
    const guardianRelationship = hasFather ? 'Père' : 'Mère';

    const refs: string[] = [];
    const errors: string[] = [];

    for (const enfant of enfants) {
      try {
        const resp = await userService.submitPreEnrollment({
          studentFirstName: enfant.prenom.trim(),
          studentLastName: enfant.nom.trim(),
          studentBirthDate: enfant.dateNaissance,
          studentGender: enfant.sexe,
          targetClassId: enfant.classeId,
          guardianFirstName,
          guardianLastName,
          guardianEmail,
          guardianPhone,
          guardianRelationship,
          guardianAddress: parent.adresse.trim(),
          fatherFirstName: parent.perePrenom.trim() || undefined,
          fatherLastName: parent.pereNom.trim() || undefined,
          fatherEmail: parent.pereEmail.trim() || undefined,
          fatherPhone: parent.perePhone.trim() || undefined,
          fatherProfession: parent.pereProfession.trim() || undefined,
          motherFirstName: parent.merePrenom.trim() || undefined,
          motherLastName: parent.mereNom.trim() || undefined,
          motherEmail: parent.mereEmail.trim() || undefined,
          motherPhone: parent.merePhone.trim() || undefined,
          motherProfession: parent.mereProfession.trim() || undefined,
          familyEmail: parent.email.trim() || undefined,
          hasCantine: enfant.options.cantine,
          transportMode: enfant.options.transport,
          hasTenueScolaire: enfant.options.tenueScolaire,
          hasTenueSport: enfant.options.tenueSport,
          hasTenueScout: enfant.options.tenueScout,
          hasTenueKarate: enfant.options.tenueKarate,
        });
        refs.push(resp.referenceNumber);
      } catch (err: any) {
        errors.push(`${enfant.prenom} ${enfant.nom} : ${err?.message ?? 'échec'}`);
      }
    }

    setSubmitting(false);

    if (errors.length > 0 && refs.length === 0) {
      toast.error(`Échec de la pré-inscription : ${errors.join(' | ')}`);
      return;
    }
    if (errors.length > 0) {
      toast.warning(`${refs.length} demande(s) envoyée(s) (${errors.length} échec(s)). Réf: ${refs.join(', ')}`);
      return;
    }
    toast.success(
      `🎉 Pré-inscription envoyée pour ${refs.length} enfant${refs.length > 1 ? 's' : ''} ! Référence(s) : ${refs.join(', ')}. Nous vous recontacterons sous 24h.`,
    );
    // Reset minimum (on garde l'adresse / parents pour faciliter une nouvelle famille immédiate)
    setEnfants([makeEnfant(1)]);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-vert-500/30 transition-colors duration-500">
      <PublicNav active="PreInscription" forceSolid />

      {/* HEADER */}
      <section className="pt-32 pb-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-bleu-100 to-vert-50 dark:from-bleu-900/30 dark:to-vert-900/20 text-bleu-700 dark:text-bleu-300 border border-bleu-200 dark:border-bleu-800/40"
        >
          <GraduationCap size={14} />
          <span className="text-xs font-black uppercase tracking-widest">Inscription simplifiée</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4"
        >
          Pré-inscription en ligne
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Remplissez ce formulaire pour soumettre une demande de pré-inscription. Vous pouvez inscrire plusieurs enfants en une seule demande.
        </motion.p>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-20 space-y-8">
        {/* ENFANTS */}
        {enfants.map((enfant, idx) => (
          <EnfantCard
            key={enfant.id}
            enfant={enfant}
            index={idx}
            canRemove={enfants.length > 1}
            onUpdate={updateEnfant}
            onRemove={removeEnfant}
            classesPourNiveau={classesPourNiveau}
            onUpdateOptions={updateOptions}
          />
        ))}

        {/* AJOUTER ENFANT */}
        <button
          type="button"
          onClick={addEnfant}
          className="w-full p-5 border-2 border-dashed border-bleu-300 dark:border-bleu-700 rounded-3xl text-bleu-600 dark:text-bleu-400 font-black text-sm flex items-center justify-center gap-3 hover:bg-bleu-50 dark:hover:bg-bleu-900/20 hover:border-bleu-500 transition-all"
        >
          <Plus size={20} />
          Ajouter un autre enfant ({enfants.length} enfant{enfants.length > 1 ? 's' : ''} actuellement)
        </button>

        {/* PARENT */}
        <ParentSection parent={parent} setParent={setParent} />

        {/* DOSSIER */}
        <DossierSection
          enfants={enfants}
          documents={documents}
          onUpload={setDocument}
          docsAdded={docsAdded}
        />

        {/* FICHES PDF */}
        <FichesSection />

        {/* SUBMIT */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-16 rounded-3xl bg-gradient-to-r from-bleu-600 to-bleu-700 hover:from-bleu-500 hover:to-bleu-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-base shadow-2xl shadow-bleu-500/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
        >
          {submitting ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
          {submitting
            ? 'Envoi en cours...'
            : `Soumettre la pré-inscription (${enfants.length} enfant${enfants.length > 1 ? 's' : ''})`}
        </button>
      </main>

      <PublicFooter variant="compact" pageName="Pré-inscription" />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  SOUS-COMPOSANTS                                                            */
/* -------------------------------------------------------------------------- */

const SectionCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  hint?: string;
  hintBg?: string;
  children: React.ReactNode;
}> = ({ icon, iconBg, title, hint, hintBg, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 overflow-hidden"
  >
    <div className={cn('px-6 py-5 border-b border-gray-100 dark:border-white/5', hintBg ?? '')}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl', iconBg)}>
          {icon}
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      {hint && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-13">{hint}</p>}
    </div>
    <div className="p-6">{children}</div>
  </motion.section>
);

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
      {label} {required && <span className="text-rouge-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-bleu-500 dark:focus:border-bleu-400 rounded-xl outline-none font-medium text-sm transition-all';

/* -------------------- Enfant -------------------- */

const EnfantCard: React.FC<{
  enfant: Enfant;
  index: number;
  canRemove: boolean;
  onUpdate: <K extends keyof Enfant>(id: number, field: K, value: Enfant[K]) => void;
  onRemove: (id: number) => void;
  /** Fournit la liste des classes backend pour un niveau donné. */
  classesPourNiveau: (niveauValue: string) => BackendClass[];
  onUpdateOptions: (id: number, options: Options) => void;
}> = ({ enfant, index, canRemove, onUpdate, onRemove, classesPourNiveau, onUpdateOptions }) => {
  const niveauObj = NIVEAUX.find((n) => n.value === enfant.niveau);
  const backendClasses = classesPourNiveau(enfant.niveau);

  return (
    <SectionCard
      icon={<span>👶</span>}
      iconBg="bg-bleu-50 dark:bg-bleu-900/30"
      title={enfants_titre(index)}
    >
      {canRemove && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onRemove(enfant.id)}
            className="text-xs font-bold text-rouge-500 hover:text-rouge-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rouge-50 dark:hover:bg-rouge-900/20 transition-colors"
          >
            <Trash2 size={14} /> Retirer cet enfant
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Field label="Prénom" required>
          <input
            type="text"
            value={enfant.prenom}
            onChange={(e) => onUpdate(enfant.id, 'prenom', e.target.value)}
            className={inputClass}
            placeholder=""
          />
        </Field>
        <Field label="Nom" required>
          <input
            type="text"
            value={enfant.nom}
            onChange={(e) => onUpdate(enfant.id, 'nom', e.target.value)}
            className={inputClass}
            placeholder=""
          />
        </Field>
        <Field label="Date de naissance">
          <input
            type="date"
            value={enfant.dateNaissance}
            onChange={(e) => onUpdate(enfant.id, 'dateNaissance', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Sexe">
          <select
            value={enfant.sexe}
            onChange={(e) => onUpdate(enfant.id, 'sexe', e.target.value as Enfant['sexe'])}
            className={cn(inputClass, 'cursor-pointer')}
          >
            <option value="">Choisir</option>
            <option value="M">Garçon</option>
            <option value="F">Fille</option>
          </select>
        </Field>
        <Field label="Niveau souhaité">
          <select
            value={enfant.niveau}
            onChange={(e) => onUpdate(enfant.id, 'niveau', e.target.value)}
            className={cn(inputClass, 'cursor-pointer')}
          >
            <option value="">🎓 Niveau...</option>
            {NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Classe souhaitée" required>
          <select
            value={enfant.classeId}
            onChange={(e) => {
              const classeId = e.target.value;
              const klass = backendClasses.find(c => c.id === classeId);
              // On met à jour classeId (UUID backend) ET le libellé pour l'affichage.
              onUpdate(enfant.id, 'classeId', classeId);
              onUpdate(enfant.id, 'classe', klass?.name ?? '');
            }}
            disabled={!niveauObj}
            className={cn(inputClass, 'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed')}
          >
            <option value="">
              {!niveauObj
                ? "Niveau d'abord"
                : backendClasses.length === 0
                  ? '⚠️ Aucune classe disponible pour ce niveau'
                  : 'Choisir une classe...'}
            </option>
            {backendClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="border-t border-gray-100 dark:border-white/5 pt-8">
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span>⚙️</span> Options pour cet enfant
        </h3>
        <OptionsSection
          options={enfant.options}
          setOptions={(newOptions) => onUpdateOptions(enfant.id, typeof newOptions === 'function' ? newOptions(enfant.options) : newOptions)}
        />
      </div>
    </SectionCard>
  );
};

const enfants_titre = (idx: number) =>
  idx === 0 ? "Informations de l'élève" : `Informations de l'élève #${idx + 1}`;

/* -------------------- Parent -------------------- */

const ParentSection: React.FC<{
  parent: ParentInfos;
  setParent: React.Dispatch<React.SetStateAction<ParentInfos>>;
}> = ({ parent, setParent }) => {
  const set = (k: keyof ParentInfos, v: string) => setParent((p) => ({ ...p, [k]: v }));

  return (
    <SectionCard
      icon={<span>👨‍👩‍👧</span>}
      iconBg="bg-vert-50 dark:bg-vert-900/30"
      title="Informations du parent / tuteur"
    >
      {/* PÈRE */}
      <div className="bg-bleu-50/40 dark:bg-bleu-900/10 border border-bleu-100 dark:border-bleu-900/30 rounded-2xl p-5 mb-5">
        <h3 className="text-sm font-black text-bleu-700 dark:text-bleu-300 mb-4 flex items-center gap-2">
          <span>👨</span> Informations du Père
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Field label="Prénom" required>
            <input
              value={parent.perePrenom}
              onChange={(e) => set('perePrenom', e.target.value)}
              placeholder="Prénom du père"
              className={inputClass}
            />
          </Field>
          <Field label="Nom" required>
            <input
              value={parent.pereNom}
              onChange={(e) => set('pereNom', e.target.value)}
              placeholder="Nom du père"
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={parent.pereEmail}
              onChange={(e) => set('pereEmail', e.target.value)}
              placeholder="papa@exemple.com"
              className={inputClass}
            />
          </Field>
          <Field label="Contact téléphonique" required>
            <input
              value={parent.perePhone}
              onChange={(e) => set('perePhone', e.target.value)}
              placeholder="+224 6XX XXX XXX"
              className={inputClass}
            />
          </Field>
          <Field label="Fonction / Profession">
            <input
              value={parent.pereProfession}
              onChange={(e) => set('pereProfession', e.target.value)}
              placeholder="Ex: Ingénieur, Commerçant..."
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* MÈRE */}
      <div className="bg-rouge-50/40 dark:bg-rouge-900/10 border border-rouge-100 dark:border-rouge-900/30 rounded-2xl p-5 mb-5">
        <h3 className="text-sm font-black text-rouge-600 dark:text-rouge-400 mb-4 flex items-center gap-2">
          <span>👩</span> Informations de la Mère
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Field label="Prénom">
            <input
              value={parent.merePrenom}
              onChange={(e) => set('merePrenom', e.target.value)}
              placeholder="Prénom de la mère"
              className={inputClass}
            />
          </Field>
          <Field label="Nom">
            <input
              value={parent.mereNom}
              onChange={(e) => set('mereNom', e.target.value)}
              placeholder="Nom de la mère"
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={parent.mereEmail}
              onChange={(e) => set('mereEmail', e.target.value)}
              placeholder="maman@exemple.com"
              className={inputClass}
            />
          </Field>
          <Field label="Contact téléphonique">
            <input
              value={parent.merePhone}
              onChange={(e) => set('merePhone', e.target.value)}
              placeholder="+224 6XX XXX XXX"
              className={inputClass}
            />
          </Field>
          <Field label="Fonction / Profession">
            <input
              value={parent.mereProfession}
              onChange={(e) => set('mereProfession', e.target.value)}
              placeholder="Ex: Enseignante, Médecin..."
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* ADRESSE & EMAIL FAMILIAL */}
      <div className="grid grid-cols-1 gap-5">
        <Field label="🏠 Adresse de la famille" required>
          <input
            value={parent.adresse}
            onChange={(e) => set('adresse', e.target.value)}
            placeholder="Quartier, ville, repère..."
            className={inputClass}
          />
        </Field>
        <Field label="📧 Email de contact général (optionnel)">
          <input
            type="email"
            value={parent.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="email@exemple.com"
            className={inputClass}
          />
        </Field>
      </div>
    </SectionCard>
  );
};

/* -------------------- Dossier -------------------- */

const DossierSection: React.FC<{
  enfants: Enfant[];
  documents: Record<number, Record<string, File | null>>;
  onUpload: (enfantId: number, docName: string, file: File | null) => void;
  docsAdded: (enfantId: number) => number;
}> = ({ enfants, documents, onUpload, docsAdded }) => {
  const [activeEnfant, setActiveEnfant] = useState<number>(enfants[0]?.id ?? 1);

  // S'assurer que activeEnfant existe encore après suppression
  React.useEffect(() => {
    if (!enfants.some((e) => e.id === activeEnfant)) {
      setActiveEnfant(enfants[0]?.id ?? 1);
    }
  }, [enfants, activeEnfant]);

  return (
    <SectionCard
      icon={<FileText size={20} className="text-or-700 dark:text-or-300" />}
      iconBg="bg-or-50 dark:bg-or-900/30"
      title="Dossier à fournir"
      hint="Scannez ou prenez en photo chaque document."
      hintBg="bg-gradient-to-r from-or-50/60 to-transparent dark:from-or-900/10"
    >
      {enfants.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {enfants.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setActiveEnfant(e.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-black transition-all',
                activeEnfant === e.id
                  ? 'bg-bleu-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
              )}
            >
              Enfant #{i + 1}
              {e.prenom ? ` — ${e.prenom}` : ''}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {DOSSIER_ITEMS.map((doc) => (
          <DocRow
            key={doc}
            doc={doc}
            file={documents[activeEnfant]?.[doc] ?? null}
            onUpload={(f) => onUpload(activeEnfant, doc, f)}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="mt-6 bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-black text-gray-700 dark:text-gray-300">Documents ajoutés</span>
          <span className="text-sm font-black text-bleu-600 dark:text-bleu-400">
            {docsAdded(activeEnfant)} / {DOSSIER_ITEMS.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vert-500 to-bleu-500 transition-all duration-500"
            style={{ width: `${(docsAdded(activeEnfant) / DOSSIER_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>
    </SectionCard>
  );
};

const DocRow: React.FC<{
  doc: string;
  file: File | null;
  onUpload: (f: File | null) => void;
}> = ({ doc, file, onUpload }) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-2xl border-2 transition-all',
        file
          ? 'bg-vert-50 dark:bg-vert-900/20 border-vert-200 dark:border-vert-800'
          : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {file && <CheckCircle2 size={18} className="text-vert-600 shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc}</p>
          {file && (
            <p className="text-[11px] text-vert-700 dark:text-vert-400 font-medium truncate">{file.name}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={() => photoRef.current?.click()}
          className="px-3 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
        >
          <Camera size={14} /> Photo
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
        >
          <Upload size={14} /> Fichier
        </button>
      </div>
    </div>
  );
};

/* -------------------- Fiches PDF -------------------- */

const FichesSection: React.FC = () => (
  <SectionCard
    icon={<Download size={20} className="text-rouge-600 dark:text-rouge-400" />}
    iconBg="bg-rouge-50 dark:bg-rouge-900/30"
    title="Fiches de renseignements"
    hint="Visualisez en ligne ou téléchargez ces fiches avant votre rendez-vous."
  >
    <div className="space-y-3">
      {FICHES_PDF.map((f) => (
        <div
          key={f.src}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rouge-100 dark:bg-rouge-900/30 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-rouge-600 dark:text-rouge-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-white">{f.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.filename}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={f.src}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <Eye size={14} /> Voir
            </a>
            <a
              href={f.src}
              download={f.filename}
              className="px-3 h-9 rounded-lg bg-bleu-600 hover:bg-bleu-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Télécharger
            </a>
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

/* -------------------- Options -------------------- */

const OptionsSection: React.FC<{
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
}> = ({ options, setOptions }) => {
  const toggle = (k: keyof Options) => setOptions((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-4">
      <OptionRow
        checked={options.cantine}
        onToggle={() => toggle('cantine')}
        icon="🍽️"
        title="Cantine scolaire"
        desc="Repas chauds et équilibrés servis chaque jour à l'école. Système de portefeuille rechargeable."
        price="💰 400 000 GNF / mois"
      />

      <div className={cn(
        'p-5 rounded-2xl border-2 transition-all space-y-4',
        options.transport !== 'NONE'
          ? 'bg-bleu-50 dark:bg-bleu-900/20 border-bleu-400'
          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-bleu-300'
      )}>
        <div className="flex gap-4 items-start">
          <Checkbox checked={options.transport !== 'NONE'} />
          <span className="text-2xl shrink-0">🚌</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-black text-gray-900 dark:text-white mb-1">Transport scolaire</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
              Navette aller-retour sécurisée avec chauffeur dédié.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
          <button
            type="button"
            onClick={() => setOptions(p => ({ ...p, transport: p.transport === 'PETIT_TRAJET' ? 'NONE' : 'PETIT_TRAJET' }))}
            className={cn(
              'p-3 rounded-xl border text-xs font-bold transition-all',
              options.transport === 'PETIT_TRAJET'
                ? 'bg-bleu-600 text-white border-bleu-600'
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
            )}
          >
            🚗 Petit trajet (300 000 GNF)
          </button>
          <button
            type="button"
            onClick={() => setOptions(p => ({ ...p, transport: p.transport === 'LONG_TRAJET' ? 'NONE' : 'LONG_TRAJET' }))}
            className={cn(
              'p-3 rounded-xl border text-xs font-bold transition-all',
              options.transport === 'LONG_TRAJET'
                ? 'bg-bleu-600 text-white border-bleu-600'
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
            )}
          >
            🚐 Long trajet (350 000 GNF)
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-bleu-50/60 dark:bg-bleu-900/10 border border-bleu-100 dark:border-bleu-900/30 p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">👔</span>
          <div>
            <h4 className="text-base font-black text-gray-900 dark:text-white">
              Uniformes & Équipements
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sélectionnez les tenues souhaitées ci-dessous
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UniformOption
            checked={options.tenueScolaire}
            onToggle={() => toggle('tenueScolaire')}
            icon="👕"
            title="Tenue scolaire (×2)"
            lines={['Primaire : 350 000 GNF', 'Secondaire : 450 000 GNF']}
          />
          <UniformOption
            checked={options.tenueSport}
            onToggle={() => toggle('tenueSport')}
            icon="🤸"
            title="Tenue de sport (EPS)"
            lines={['100 000 GNF']}
          />
          <UniformOption
            checked={options.tenueScout}
            onToggle={() => toggle('tenueScout')}
            icon="⚜️"
            title="Tenue Scout"
            lines={['250 000 GNF']}
          />
          <UniformOption
            checked={options.tenueKarate}
            onToggle={() => toggle('tenueKarate')}
            icon="🥋"
            title="Tenue de Karaté"
            lines={['200 000 GNF']}
          />
        </div>
      </div>
    </div>
  );
};

const OptionRow: React.FC<{
  checked: boolean;
  onToggle: () => void;
  icon: string;
  title: string;
  desc: string;
  price: string;
}> = ({ checked, onToggle, icon, title, desc, price }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'w-full text-left flex gap-4 items-start p-5 rounded-2xl border-2 transition-all',
      checked
        ? 'bg-bleu-50 dark:bg-bleu-900/20 border-bleu-400'
        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-bleu-300',
    )}
  >
    <Checkbox checked={checked} />
    <span className="text-2xl shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <h4 className="text-base font-black text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{desc}</p>
      <p className="text-xs font-black text-bleu-600 dark:text-bleu-400">{price}</p>
    </div>
  </button>
);

const UniformOption: React.FC<{
  checked: boolean;
  onToggle: () => void;
  icon: string;
  title: string;
  lines: string[];
}> = ({ checked, onToggle, icon, title, lines }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all',
      checked
        ? 'bg-white dark:bg-white/10 border-bleu-400 shadow-md'
        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-bleu-300',
    )}
  >
    <Checkbox checked={checked} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-black text-gray-900 dark:text-white mb-1">
        <span className="mr-1">{icon}</span>
        {title}
      </p>
      {lines.map((l, i) => (
        <p key={i} className="text-xs text-bleu-600 dark:text-bleu-400 font-bold">
          {l}
        </p>
      ))}
    </div>
  </button>
);

const Checkbox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={cn(
      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
      checked ? 'bg-bleu-600 border-bleu-600' : 'border-gray-300 dark:border-white/20',
    )}
  >
    {checked && <CheckCircle2 size={14} className="text-white" />}
  </span>
);

export default PreInscription;

