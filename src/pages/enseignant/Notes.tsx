import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Save, 
  CheckCircle2, 
  BookOpen, 
  Filter, 
  Calculator,
  Download,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, Input, Button, Badge, Select } from '../../components/ui';

const EnseignantNotes: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Terminale S1');
  const [selectedExam, setSelectedExam] = useState('Devoir Surveillé 2');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [students, setStudents] = useState([
    { id: 1, name: 'Amadou Diallo', note: '16.5', appreciation: 'Très bon travail' },
    { id: 2, name: 'Aïssatou Barry', note: '14.0', appreciation: 'En progrès' },
    { id: 3, name: 'Mamadou Sow', note: '09.5', appreciation: 'Attention à la rigueur' },
    { id: 4, name: 'Fatoumata Camara', note: '18.2', appreciation: 'Excellent !' },
    { id: 5, name: 'Ibrahim Sylla', note: '12.0', appreciation: 'Ensemble convenable' },
  ]);

  const handleNoteChange = (id: number, field: 'note' | 'appreciation', value: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateAverage = () => {
     const validNotes = students.map(s => parseFloat(s.note)).filter(n => !isNaN(n));
     if(validNotes.length === 0) return "0.0";
     const total = validNotes.reduce((acc, curr) => acc + curr, 0);
     return (total / validNotes.length).toFixed(1);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bleu-100 dark:bg-bleu-900/30 rounded-2xl shadow-inner text-bleu-600">
            <FileSpreadsheet size={28} />
          </div>
          <div className="text-left font-bold">
            <h1 className="text-2xl font-black gradient-bleu-or-text tracking-tight">Saisie des Notes</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-1">Gérez les évaluations et appréciations de vos élèves</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             variant="outline"
             className="border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-[11px] rounded-xl flex items-center gap-2"
           >
              <Download size={16} /> Exporter .CSV
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-bleu-600 text-white shadow-lg shadow-bleu-500/20 text-[11px] font-bold px-8 h-10 rounded-xl hover:scale-[1.02] flex items-center gap-2 border-none"
           >
              {isSaving ? <Save size={16} className="animate-spin" /> : <Save size={16} />} 
              Sauvegarder
           </Button>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="p-6 border-none shadow-soft dark:bg-gray-900/50">
         <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 mr-4">
               <Filter size={18} />
               <span className="text-[11px] font-bold uppercase tracking-widest">Filtres</span>
            </div>
            
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Classe</label>
                  <Select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 font-bold"
                    options={[
                      { value: 'Terminale S1', label: 'Terminale S1' },
                      { value: '1ère S2', label: '1ère S2' },
                      { value: 'Terminale S2', label: 'Terminale S2' },
                      { value: '3ème A', label: '3ème A' }
                    ]}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Évaluation</label>
                  <Select 
                    value={selectedExam} 
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 font-bold"
                    options={[
                      { value: 'Devoir Surveillé 1', label: 'Devoir Surveillé 1' },
                      { value: 'Devoir Surveillé 2', label: 'Devoir Surveillé 2' },
                      { value: 'Interrogation Écrite', label: 'Interrogation Écrite' },
                      { value: 'Examen Blanc', label: 'Examen Blanc' }
                    ]}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Période</label>
                  <Select 
                    className="w-full bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 font-bold"
                    options={[
                      { value: 'Trimestre 2', label: 'Trimestre 2' },
                      { value: 'Trimestre 1', label: 'Trimestre 1' }
                    ]}
                  />
               </div>
            </div>
         </div>
      </Card>

      {/* STATISTICS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-4 bg-bleu-50 dark:bg-bleu-900/10 border-none flex items-center justify-between shadow-sm">
            <div className="text-left">
               <p className="text-[10px] font-bold text-bleu-600 dark:text-bleu-400 uppercase tracking-widest mb-1">Moyenne du devoir</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">{calculateAverage()}<span className="text-sm text-gray-400">/20</span></p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-bleu-600 shadow-sm border border-bleu-100 dark:border-bleu-900/30">
               <Calculator size={20} />
            </div>
         </Card>
         <Card className="p-4 bg-vert-50 dark:bg-vert-900/10 border-none flex items-center justify-between shadow-sm">
            <div className="text-left">
               <p className="text-[10px] font-bold text-vert-600 dark:text-vert-400 uppercase tracking-widest mb-1">Taux de réussite</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">80<span className="text-sm text-gray-400">%</span></p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-vert-600 shadow-sm border border-vert-100 dark:border-vert-900/30">
               <TrendingUp size={20} />
            </div>
         </Card>
      </div>

      {/* NOTES TABLE */}
      <Card className="p-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft bg-white dark:bg-gray-900/50">
         <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <BookOpen size={16} className="text-gray-400" />
               <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedClass} - {selectedExam}</span>
            </div>
            <Badge className="bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-[10px]">
               Matière: Mathématiques
            </Badge>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Élève</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Note /20</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-full">Appréciation</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {students.map((student) => (
                     <tr key={student.id} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                           <span className="font-bold text-sm text-gray-900 dark:text-white">
                              {student.name}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                           <div className="relative max-w-[100px]">
                              <Input 
                                type="number" 
                                step="0.5"
                                min="0" 
                                max="20"
                                value={student.note}
                                onChange={(e) => handleNoteChange(student.id, 'note', e.target.value)}
                                className={`font-black text-center h-10 w-full ${parseFloat(student.note) < 10 ? 'text-rouge-500 dark:text-rouge-400 bg-rouge-50 dark:bg-rouge-500/10 border-rouge-200' : 'text-bleu-600 dark:text-bleu-400 bg-bleu-50 dark:bg-bleu-900/10 border-bleu-200'}`}
                              />
                           </div>
                        </td>
                        <td className="px-6 py-3">
                           <Input 
                             type="text" 
                             value={student.appreciation}
                             onChange={(e) => handleNoteChange(student.id, 'appreciation', e.target.value)}
                             placeholder="Ajouter un commentaire..."
                             className="w-full h-10 font-semibold text-sm bg-transparent border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors focus:bg-white dark:focus:bg-gray-800"
                           />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* TOAST SUCCESS */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-vert-100 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-vert-100 text-vert-500 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-left font-bold">
                <p className="text-sm text-gray-900 dark:text-white">Sauvegarde réussie</p>
                <p className="text-[11px] text-gray-500 font-semibold">Les notes ont été enregistrées.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default EnseignantNotes;
