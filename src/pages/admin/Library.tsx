import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  BookMarked,
  Book,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  X,
  ArrowRight,
  BookCopy,
  Loader2
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button, Modal, Input, Select, Popover, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useLibrary } from '../../hooks/useLibrary';
import { Book as LibraryBook, BookLoan, BookRequest, ResourceRequest } from '../../types/library';
import { ApiError } from '../../services/api';
import { useClasses } from '../../hooks/useClass';
import { libraryService } from '../../services/libraryService';
import { StudentResponse, userService } from '../../services/userService';

type ResourceSource = 'upload' | 'url';

const AdminLibrary: React.FC = () => {
  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Tous' | 'Disponible' | 'Emprunté' | 'En retard'>('Tous');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isBookDetailsModalOpen, setIsBookDetailsModalOpen] = useState(false);
  const [isLoansModalOpen, setIsLoansModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [isBookDetailsLoading, setIsBookDetailsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [resourceSource, setResourceSource] = useState<ResourceSource>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // États pour les formulaires
  const [formData, setFormData] = useState<ResourceRequest>({
    title: '',
    type: 'DOCUMENT',
    fileUrl: '',
    classId: ''
  });
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedBookForLoans, setSelectedBookForLoans] = useState<LibraryBook | null>(null);
  const [selectedBookDetails, setSelectedBookDetails] = useState<LibraryBook | null>(null);
  const [selectedBookLoanHistory, setSelectedBookLoanHistory] = useState<BookLoan[]>([]);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [bookFormData, setBookFormData] = useState<BookRequest>({
    title: '',
    isbn: '',
    author: '',
    totalCopies: 1,
    availableCopies: 1,
  });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [allBooks, setAllBooks] = useState<LibraryBook[]>([]);
  const [activeLoans, setActiveLoans] = useState<BookLoan[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<BookLoan[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [isBorrowDataLoading, setIsBorrowDataLoading] = useState(false);
  const [booksPage, setBooksPage] = useState(1);
  
  // Récupérer l'ID utilisateur depuis le localStorage (à adapter selon votre auth)
  const getCurrentUserId = (): string => {
    try {
      const authStorage = window.localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.user?.id || '';
      }
    } catch {
      return '';
    }
    return '';
  };

  const getToken = (): string => {
    try {
      const authStorage = window.localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || '';
      }
    } catch {
      return '';
    }
    return '';
  };

  // Utiliser le hook useLibrary pour les ressources
  const {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    createResourceWithFile,
    deleteResource,
    clearError
  } = useLibrary();
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses();

  const resetAddResourceForm = () => {
    setFormData({ title: '', type: 'DOCUMENT', fileUrl: '', classId: '' });
    setSelectedFile(null);
    setResourceSource('upload');
  };

  // Charger les ressources documentaires
  const loadResources = useCallback(async () => {
    await fetchResources();
  }, [fetchResources]);

  // Charger les ressources au montage du composant
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const loadLibraryStats = useCallback(async () => {
    try {
      const [booksData, activeLoansData, overdueLoansData] = await Promise.all([
        libraryService.getAllBooks(),
        libraryService.getActiveLoans(),
        libraryService.getOverdueLoans(),
      ]);
      setAllBooks(booksData);
      setActiveLoans(activeLoansData);
      setOverdueLoans(overdueLoansData);
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors du chargement des statistiques de pret');
    }
  }, []);

  useEffect(() => {
    loadLibraryStats();
  }, [loadLibraryStats]);

  useEffect(() => {
    const loadBorrowModalData = async () => {
      if (!isBorrowModalOpen) return;

      try {
        setIsBorrowDataLoading(true);
        const token = getToken();
        const [booksData, studentsData] = await Promise.all([
          libraryService.getAllBooks(),
          userService.getAllStudents(token),
        ]);
        setBooks(booksData.filter(book => book.availableCopies > 0));
        setStudents(studentsData);
      } catch (err) {
        const apiError = err as ApiError;
        showError(apiError.message || 'Erreur lors du chargement des donnees d\'emprunt');
      } finally {
        setIsBorrowDataLoading(false);
      }
    };

    loadBorrowModalData();
  }, [isBorrowModalOpen]);

  // Calculer les KPIs à partir des données réelles
  const totalResources = resources.length;
  const availableResources = allBooks.reduce((acc, book) => acc + book.availableCopies, 0);
  const borrowedResources = activeLoans.length;
  const lateResources = overdueLoans.length;

  // Handler pour créer une ressource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = getCurrentUserId();
    if (!userId) {
      showError('Utilisateur non connecté');
      return;
    }

    try {
      const normalizedClassId = formData.classId?.trim() || undefined;

      if (resourceSource === 'upload') {
        if (!selectedFile) {
          showError('Veuillez selectionner un fichier');
          return;
        }

        await createResourceWithFile(
          {
            title: formData.title,
            type: formData.type,
            classId: normalizedClassId,
            file: selectedFile,
          },
          userId,
        );
      } else {
        await createResource(
          {
            title: formData.title,
            type: formData.type,
            classId: normalizedClassId,
            fileUrl: formData.fileUrl?.trim() || undefined,
          },
          userId,
        );
      }

      setIsAddModalOpen(false);
      resetAddResourceForm();
      showSuccess('Ressource créée avec succès !');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de la création');
    }
  };

  // Handler pour supprimer une ressource
  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        await deleteResource(id);
        setOpenMenuId(null);
        showSuccess('Ressource supprimée avec succès !');
      } catch (err) {
        const apiError = err as ApiError;
        showError(apiError.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Handler pour enregistrer un emprunt
  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookId || !selectedStudentId) {
      showError('Veuillez selectionner un livre et un eleve');
      return;
    }

    try {
      await libraryService.lendBook(selectedBookId, selectedStudentId);
      setIsBorrowModalOpen(false);
      setSelectedBookId('');
      setSelectedStudentId('');
      await loadLibraryStats();
      showSuccess('Emprunt enregistre avec succes !');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de l\'enregistrement de l\'emprunt');
    }
  };

  const openCreateBookModal = () => {
    setEditingBook(null);
    setBookFormData({
      title: '',
      isbn: '',
      author: '',
      totalCopies: 1,
      availableCopies: 1,
    });
    setIsBookModalOpen(true);
  };

  const openEditBookModal = (bookId: string) => {
    const target = allBooks.find((b) => b.id === bookId);
    if (!target) return;
    setEditingBook(target);
    setBookFormData({
      title: target.title,
      isbn: target.isbn,
      author: target.author || '',
      totalCopies: target.totalCopies,
      availableCopies: target.availableCopies,
    });
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title.trim() || !bookFormData.isbn.trim()) {
      showError('Le titre et l\'ISBN sont obligatoires');
      return;
    }

    try {
      setIsSavingBook(true);
      const payload: BookRequest = {
        ...bookFormData,
        title: bookFormData.title.trim(),
        isbn: bookFormData.isbn.trim(),
        author: bookFormData.author?.trim() || undefined,
      };

      if (editingBook) {
        await libraryService.updateBook(editingBook.id, payload);
        showSuccess('Livre modifie avec succes !');
      } else {
        await libraryService.createBook(payload);
        showSuccess('Livre ajoute avec succes !');
      }

      setIsBookModalOpen(false);
      await loadLibraryStats();
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de l\'enregistrement du livre');
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Supprimer ce livre du catalogue ?')) return;
    try {
      await libraryService.deleteBook(bookId);
      await loadLibraryStats();
      showSuccess('Livre supprime avec succes !');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de la suppression du livre');
    }
  };

  const openLoansModal = (bookId: string) => {
    const target = allBooks.find((b) => b.id === bookId) || null;
    setSelectedBookForLoans(target);
    setIsLoansModalOpen(true);
  };

  const openBookDetailsModal = async (bookId: string) => {
    const target = allBooks.find((b) => b.id === bookId) || null;
    if (!target) return;

    try {
      setIsBookDetailsLoading(true);
      const history = await libraryService.getLoansByBook(bookId);
      setSelectedBookDetails(target);
      setSelectedBookLoanHistory(history);
      setIsBookDetailsModalOpen(true);
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors du chargement de la fiche ouvrage');
    } finally {
      setIsBookDetailsLoading(false);
    }
  };

  const exportBookLoanHistoryCsv = () => {
    if (!selectedBookDetails) return;

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [
      'Livre',
      'ISBN',
      'Eleve',
      'DatePret',
      'DateRetourPrevue',
      'DateRetourEffective',
      'Statut',
      'Amende',
    ].join(',');

    const rows = selectedBookLoanHistory.map((loan) => {
      const isReturned = loan.status === 'RETURNED' || !!loan.returnDate;
      const isOverdue = !isReturned && overdueLoans.some((o) => o.id === loan.id);
      const statusLabel = isReturned ? 'Rendu' : isOverdue ? 'En retard' : 'Actif';

      return [
        escapeCsv(selectedBookDetails.title),
        escapeCsv(selectedBookDetails.isbn),
        escapeCsv(loan.studentName),
        loan.loanDate,
        loan.dueDate,
        loan.returnDate || '',
        escapeCsv(statusLabel),
        loan.fineAmount ?? 0,
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique_prets_${selectedBookDetails.title.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReturnLoan = async (loanId: string) => {
    try {
      await libraryService.returnLoan(loanId);
      await loadLibraryStats();
      showSuccess('Retour enregistre avec succes !');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.message || 'Erreur lors de l\'enregistrement du retour');
    }
  };

  // Afficher un message de succès
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // Afficher une erreur
  const showError = (message: string) => {
    // Vous pouvez utiliser un système de toast ou simplement le state error du hook
    alert(message); // À remplacer par un toast plus élégant
  };

  const getBookLoans = (bookId: string) => activeLoans.filter((loan) => loan.bookId === bookId);
  const getOverdueBookLoans = (bookId: string) => overdueLoans.filter((loan) => loan.bookId === bookId);
  const getBookStatus = (bookId: string): 'Disponible' | 'Emprunté' | 'En retard' => {
    if (getOverdueBookLoans(bookId).length > 0) return 'En retard';
    if (getBookLoans(bookId).length > 0) return 'Emprunté';
    return 'Disponible';
  };

  const mappedBooks = allBooks
    .map((book) => {
      const loans = getBookLoans(book.id);
      const overdue = getOverdueBookLoans(book.id);
      const principalLoan = loans[0] ?? null;

      return {
        id: book.id,
        titre: book.title,
        auteur: book.author || 'Inconnu',
        isbn: book.isbn,
        disponibilite: getBookStatus(book.id),
        empruntsActifs: loans.length,
        retards: overdue.length,
        emprunteur: principalLoan?.studentName || null,
        dateRetourPrevue: principalLoan?.dueDate || null,
        exemplairesDisponibles: book.availableCopies,
        nombreExemplaires: book.totalCopies,
        principalLoanId: principalLoan?.id || null,
      };
    })
    .filter((book) => {
      const matchesFilter = activeFilter === 'Tous' || book.disponibilite === activeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q
        || book.titre.toLowerCase().includes(q)
        || book.auteur.toLowerCase().includes(q)
        || (book.isbn || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

  const BOOKS_PAGE_SIZE = 8;
  const totalBooksPages = Math.max(1, Math.ceil(mappedBooks.length / BOOKS_PAGE_SIZE));
  const paginatedBooks = mappedBooks.slice((booksPage - 1) * BOOKS_PAGE_SIZE, booksPage * BOOKS_PAGE_SIZE);

  useEffect(() => {
    setBooksPage(1);
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    if (booksPage > totalBooksPages) {
      setBooksPage(totalBooksPages);
    }
  }, [booksPage, totalBooksPages]);

  // Colonnes du tableau Livres + Prêts
  const columns = [
    {
      key: 'titre',
      label: 'Ouvrage',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br from-bleu-800 via-bleu-600 to-or-500 shadow-bleu-600/20">
            <Book size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900 dark:text-white leading-tight mb-0.5 text-[13px]">{row.titre}</div>
            <div className="text-[11px] text-gray-400 font-semibold italic">Par {row.auteur}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'isbn', 
      label: 'ISBN', 
      sortable: true,
      render: (val: string) => (
        <Badge variant="default" className="text-[10px] font-bold px-3 py-1 border-none bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-mono">
          {val}
        </Badge>
      )
    },
    { 
      key: 'empruntsActifs', 
      label: 'Prêts',
      render: (_: number, row: any) => (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{row.empruntsActifs} actif(s)</span>
      )
    },
    {
      key: 'disponibilite',
      label: 'Statut',
      render: (val: string) => {
        const variant = val === 'Disponible' ? 'success' : val === 'Emprunté' ? 'warning' : 'error';
        return <Badge variant={variant} className="text-[9px] font-bold h-6 px-2.5 border-none shadow-sm uppercase tracking-wider">{val}</Badge>;
      }
    },
    {
      key: 'emprunteur',
      label: 'Détention',
      render: (val: string | null, row: any) => {
        if (!val) return <span className="text-gray-300 italic text-xs">—</span>;
        return (
          <div className="flex items-center gap-3 text-left">
            <Avatar src="" alt={val} className="w-7 h-7 border-none shadow-sm" />
            <div className="leading-tight">
              <div className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{val}</div>
              <div className={cn('text-[10px] font-semibold mt-0.5', row.retards > 0 ? 'text-red-500' : 'text-gray-400')}>
                Retour: {row.dateRetourPrevue ? new Date(row.dateRetourPrevue).toLocaleDateString('fr-FR') : '-'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'exemplairesDisponibles',
      label: 'Stock',
      render: (val: number, row: any) => (
        <div className="flex flex-col gap-2 min-w-[110px] text-left">
          <div className="flex items-center justify-between font-bold">
            <span className={cn("text-[11px]", val === 0 ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300')}>
              {val} <span className="text-[9px] opacity-60 font-medium">Exemplaires</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(val / row.nombreExemplaires) * 100}%` }}
              className={cn("h-full rounded-full transition-all duration-1000", val === 0 ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]')}
            />
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Popover
          isOpen={openMenuId === row.id}
          onClose={() => setOpenMenuId(null)}
          trigger={
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all text-gray-400 group"
            >
              <ArrowRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          }
        >
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2.5 min-w-[220px] text-left">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options Ouvrage</p>
            </div>
            <button
              onClick={() => {
                openBookDetailsModal(row.id);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <Eye size={16} className="text-bleu-600" /> Fiche Ouvrage
            </button>
            <button
              onClick={() => {
                openLoansModal(row.id);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <BookCopy size={16} className="text-or-600" /> Voir les prêts ({row.empruntsActifs})
            </button>
            <button
              onClick={() => {
                openEditBookModal(row.id);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <Edit size={16} className="text-gray-400" /> Modifier Informations
            </button>
            <div className="h-px bg-gray-50 dark:bg-white/5 my-2 mx-2" />
              {row.principalLoanId && (
                <button
                  onClick={() => {
                    handleReturnLoan(row.principalLoanId);
                    setOpenMenuId(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-vert-600 hover:bg-vert-50 dark:hover:bg-vert-900/40 rounded-xl transition-all"
                >
                  <CheckCircle2 size={16} /> Marquer Retour
                </button>
              )}
            <button 
              onClick={() => {
                setSelectedBookId(row.id);
                setIsBorrowModalOpen(true);
                setOpenMenuId(null);
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-bleu-600 hover:bg-bleu-50 dark:hover:bg-bleu-900/40 rounded-xl transition-all"
            >
              <BookCopy size={16} /> Nouvel Emprunt
            </button>
            <button
              onClick={() => {
                handleDeleteBook(row.id);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
            >
              <X size={16} /> Supprimer Livre
            </button>
          </div>
        </Popover>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-4 mb-2 text-left">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <BookOpen className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Bibliothèque Numérique</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Gestion du catalogue, des emprunts et des retards</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={openCreateBookModal}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm"
          >
            <Plus size={18} /> Nouveau Livre
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsBorrowModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm"
          >
            <BookCopy size={18} /> Nouvel Emprunt
          </Button>
          <Button 
            onClick={() => {
              resetAddResourceForm();
              setIsAddModalOpen(true);
            }}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Ajouter une Ressource
          </Button>
        </div>
      </div>

      {/* MODAL: AJOUT/MODIF LIVRE */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={<span className="gradient-bleu-or-text">{editingBook ? 'Modifier un livre' : 'Ajouter un livre'}</span>}
      >
        <form onSubmit={handleSaveBook} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
              <input
                type="text"
                required
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">ISBN *</label>
              <input
                type="text"
                required
                value={bookFormData.isbn}
                onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Auteur</label>
            <input
              type="text"
              value={bookFormData.author || ''}
              onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Total exemplaires</label>
              <Input
                type="number"
                min={1}
                value={bookFormData.totalCopies}
                onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: Number(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Disponibles</label>
              <Input
                type="number"
                min={0}
                max={bookFormData.totalCopies}
                value={bookFormData.availableCopies}
                onChange={(e) => setBookFormData({
                  ...bookFormData,
                  availableCopies: Math.min(Number(e.target.value) || 0, bookFormData.totalCopies),
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)} className="px-8 h-12 rounded-xl text-sm font-bold">
              Annuler
            </Button>
            <Button type="submit" disabled={isSavingBook} className="bg-bleu-600 text-white px-8 h-12 rounded-xl text-sm font-bold">
              {isSavingBook ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DETAIL PRETS LIVRE */}
      <Modal
        isOpen={isLoansModalOpen}
        onClose={() => setIsLoansModalOpen(false)}
        title={<span className="gradient-bleu-or-text">Prêts du livre: {selectedBookForLoans?.title || ''}</span>}
        size="lg"
      >
        {selectedBookForLoans && getBookLoans(selectedBookForLoans.id).length > 0 ? (
          <div className="space-y-3">
            {getBookLoans(selectedBookForLoans.id).map((loan) => {
              const isOverdue = overdueLoans.some((o) => o.id === loan.id);
              return (
                <div key={loan.id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{loan.studentName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                      Prêt: {new Date(loan.loanDate).toLocaleDateString('fr-FR')} • Retour prévu: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className={cn('text-[10px] font-bold mt-1', isOverdue ? 'text-rouge-500' : 'text-vert-600')}>
                      {isOverdue ? 'En retard' : 'Dans les délais'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleReturnLoan(loan.id)}
                    className="h-10 px-4 text-[10px] font-bold uppercase tracking-wide"
                  >
                    Marquer Retour
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun prêt actif pour ce livre.</p>
        )}
      </Modal>

      {/* MODAL: FICHE OUVRAGE */}
      <Modal
        isOpen={isBookDetailsModalOpen}
        onClose={() => setIsBookDetailsModalOpen(false)}
        title={<span className="gradient-bleu-or-text">Fiche Ouvrage</span>}
        size="lg"
      >
        {isBookDetailsLoading ? (
          <div className="py-8 flex items-center justify-center gap-3 text-gray-500 font-semibold">
            <Loader2 className="animate-spin" size={18} /> Chargement de la fiche...
          </div>
        ) : selectedBookDetails ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Titre</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{selectedBookDetails.title}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auteur</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{selectedBookDetails.author || 'Inconnu'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ISBN</p>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mt-1">{selectedBookDetails.isbn}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {selectedBookDetails.availableCopies} / {selectedBookDetails.totalCopies} disponible(s)
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Historique des prêts</h4>
                <Button
                  variant="outline"
                  onClick={exportBookLoanHistoryCsv}
                  disabled={selectedBookLoanHistory.length === 0}
                  className="h-9 px-3 text-[10px] font-bold uppercase tracking-wide"
                >
                  Export CSV
                </Button>
              </div>
              {selectedBookLoanHistory.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Aucun prêt enregistré pour cet ouvrage.</p>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                  {selectedBookLoanHistory.map((loan) => {
                    const isReturned = loan.status === 'RETURNED' || !!loan.returnDate;
                    const isOverdue = !isReturned && overdueLoans.some((o) => o.id === loan.id);
                    return (
                      <div key={loan.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between gap-4">
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{loan.studentName}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                            Prêt: {new Date(loan.loanDate).toLocaleDateString('fr-FR')} • Retour prévu: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                          </p>
                          {loan.returnDate && (
                            <p className="text-[10px] text-gray-400 font-semibold">Rendu le {new Date(loan.returnDate).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>
                        <Badge variant={isReturned ? 'success' : isOverdue ? 'error' : 'warning'} className="text-[9px] px-2 py-1 uppercase tracking-wider">
                          {isReturned ? 'Rendu' : isOverdue ? 'En retard' : 'Actif'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun ouvrage sélectionné.</p>
        )}
      </Modal>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ressources"
          value={totalResources.toString()}
          subtitle="Titres référencés"
          icon={<BookMarked />}
          color="bleu"
        />
        <StatCard
          title="Disponibles"
          value={availableResources.toString()}
          subtitle="Exemplaires en stock"
          icon={<CheckCircle2 />}
          color="vert"
        />
        <StatCard
          title="Emprunts Actifs"
          value={borrowedResources.toString()}
          subtitle="Prets en cours"
          icon={<Clock />}
          trend={{ value: "Action requise", direction: "up" }}
          color="or"
        />
        <StatCard
          title="Retards"
          value={lateResources.toString()}
          subtitle="Alertes relances"
          icon={<AlertTriangle />}
          color="rouge"
        />
      </div>

      <Card className="p-5 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Emprunts Actifs</h3>
          <Badge variant={lateResources > 0 ? 'error' : 'success'} className="text-[9px] uppercase tracking-wider px-2 py-1">
            {lateResources > 0 ? `${lateResources} retard(s)` : 'Aucun retard'}
          </Badge>
        </div>

        {activeLoans.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Aucun emprunt actif pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {activeLoans.slice(0, 6).map((loan) => {
              const isOverdue = overdueLoans.some((overdueLoan) => overdueLoan.id === loan.id);
              return (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{loan.bookTitle}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{loan.studentName}</p>
                    <p className={cn('text-[10px] font-bold', isOverdue ? 'text-rouge-500' : 'text-gray-400')}>
                      Retour prevu: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleReturnLoan(loan.id)}
                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-wide"
                  >
                    Marquer Retour
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ERROR MESSAGE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <span className="text-red-700 dark:text-red-300 font-semibold text-sm">{error}</span>
          </div>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </motion.div>
      )}

      {/* FILTERS & SEARCH */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full">
            {['Tous', 'Disponible', 'Emprunté', 'En retard'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={cn(
                  "px-8 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
                  activeFilter === f 
                    ? 'bg-gradient-to-r from-bleu-700 to-bleu-500 text-white shadow-lg' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Chercher par titre, auteur, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-bleu-600" size={40} />
          <span className="ml-4 text-gray-500 font-semibold">Chargement des ressources...</span>
        </div>
      )}

      {/* LIST SECTION */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
              {paginatedBooks.length > 0 ? (
                <Table 
                  data={paginatedBooks} 
                  columns={columns as any}
                />
              ) : (
                <div className="py-20 text-center">
                  <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-semibold">Aucun ouvrage trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres ou d'ajouter des livres</p>
                </div>
              )}
            </Card>

            {mappedBooks.length > BOOKS_PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between px-2">
                <p className="text-xs text-gray-500 font-semibold">
                  Page {booksPage} / {totalBooksPages} • {mappedBooks.length} ouvrage(s)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={booksPage <= 1}
                    onClick={() => setBooksPage((prev) => Math.max(1, prev - 1))}
                    className="h-9 px-3 text-[10px] font-bold"
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={booksPage >= totalBooksPages}
                    onClick={() => setBooksPage((prev) => Math.min(totalBooksPages, prev + 1))}
                    className="h-9 px-3 text-[10px] font-bold"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <Card className="p-5 border-none shadow-soft bg-white dark:bg-gray-900/50 dark:backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Ressources Pédagogiques</h3>
          <Badge variant="default" className="text-[9px] uppercase tracking-wider px-2 py-1">{resources.length} ressource(s)</Badge>
        </div>
        {resources.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Aucune ressource pédagogique disponible.</p>
        ) : (
          <div className="space-y-2">
            {resources.slice(0, 5).map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{resource.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{resource.type} • {resource.className || 'Toutes classes'}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteResource(resource.id)}
                  className="h-9 px-3 text-[10px] font-bold uppercase tracking-wide text-rouge-500"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* MODAL: AJOUTER RESSOURCE */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Ajouter une nouvelle ressource</span>}
      >
        <form onSubmit={handleCreateResource} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setResourceSource('upload')}
              className={cn(
                'h-11 rounded-xl text-xs font-bold border transition-all',
                resourceSource === 'upload'
                  ? 'bg-bleu-600 text-white border-bleu-600'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
              )}
            >
              Televerser un fichier
            </button>
            <button
              type="button"
              onClick={() => setResourceSource('url')}
              className={cn(
                'h-11 rounded-xl text-xs font-bold border transition-all',
                resourceSource === 'url'
                  ? 'bg-bleu-600 text-white border-bleu-600'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
              )}
            >
              Lien externe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la ressource"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              >
                <option value="DOCUMENT">Document</option>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Vidéo</option>
                <option value="IMAGE">Image</option>
                <option value="LIEN">Lien externe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Classe cible (optionnel)</label>
            <Select
              value={formData.classId ?? ''}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full"
              options={[
                { value: '', label: 'Toutes les classes' },
                ...classes.map((schoolClass) => ({
                  value: schoolClass.id,
                  label: `${schoolClass.name}${schoolClass.level ? ` - ${schoolClass.level}` : ''}`,
                })),
              ]}
            />
            <p className="mt-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              {isLoadingClasses
                ? 'Chargement des classes...'
                : formData.classId
                  ? `ID classe selectionnee: ${formData.classId}`
                  : 'Aucune classe selectionnee (ressource globale).'}
            </p>
          </div>

          {resourceSource === 'upload' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Fichier *</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                onChange={(e) => {
                  const nextFile = e.target.files?.[0] ?? null;
                  setSelectedFile(nextFile);
                }}
                className="w-full"
              />
              {selectedFile && (
                <p className="mt-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Fichier selectionne: {selectedFile.name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">URL du fichier</label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setIsAddModalOpen(false);
                resetAddResourceForm();
              }} 
              className="px-8 h-12 rounded-xl text-sm font-bold"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-bleu-600 text-white px-8 h-12 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Enregistrer la ressource'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EMPRUNT */}
      <Modal 
        isOpen={isBorrowModalOpen} 
        onClose={() => setIsBorrowModalOpen(false)} 
        title={<span className="gradient-bleu-or-text">Enregistrement d'un emprunt</span>}
      >
        <form onSubmit={handleBorrow} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Choisir le livre</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              required
              disabled={isBorrowDataLoading}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
            >
              <option value="">Selectionner un livre</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>{book.title} ({book.availableCopies} dispo)</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Eleve emprunteur</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                disabled={isBorrowDataLoading}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-bleu-500/20 text-sm"
              >
                <option value="">Selectionner un eleve</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                    {student.registrationNumber ? ` (${student.registrationNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsBorrowModalOpen(false)} 
              className="px-8 h-12 rounded-xl text-sm font-bold"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isBorrowDataLoading}
              className="bg-vert-600 text-white px-8 h-12 rounded-xl text-sm font-bold"
            >
              {isBorrowDataLoading ? 'Chargement...' : 'Confirmer l\'emprunt'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* SUCCESS MESSAGE */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-base tracking-tight">Succès !</p>
                <p className="text-[12px] text-white/80 font-semibold italic">{successMessage}</p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminLibrary;