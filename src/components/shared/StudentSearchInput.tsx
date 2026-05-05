import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, User, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StudentLite {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
  className?: string;
}

interface StudentSearchInputProps<T extends StudentLite> {
  /** Liste complète des élèves (jusqu'à 1000+ — le filtrage est local et performant) */
  students: T[];
  /** ID de l'élève actuellement sélectionné (contrôlé) */
  value: string;
  /** Callback quand un élève est sélectionné (id "") = aucun */
  onChange: (studentId: string, student: T | null) => void;
  /** Label affiché au-dessus du champ */
  label?: string;
  /** Placeholder dans l'input */
  placeholder?: string;
  /** Indique si la valeur est requise (affiche * rouge dans le label) */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  /** Message d'erreur à afficher sous le champ */
  error?: string;
  /** Nombre maximum de résultats affichés (default: 50) */
  maxResults?: number;
  className?: string;
  /** Auto-focus du champ au mount */
  autoFocus?: boolean;
}

/**
 * Recherche d'élève avec autocomplete — adapté aux écoles avec 500+ élèves.
 * Filtre localement par prénom, nom, prénom+nom, matricule, classe.
 * Click-outside pour fermer, navigation clavier (↑/↓/Enter/Esc).
 */
function StudentSearchInput<T extends StudentLite>({
  students,
  value,
  onChange,
  label = 'Élève',
  placeholder = 'Tapez un nom, matricule ou classe...',
  required = false,
  disabled = false,
  error,
  maxResults = 50,
  className,
  autoFocus,
}: StudentSearchInputProps<T>) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Élève actuellement sélectionné (résolu via l'id)
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === value) || null,
    [students, value]
  );

  // Si l'élève sélectionné change de l'extérieur (ex: reset du formulaire), vider la query
  useEffect(() => {
    if (!value) {
      setQuery('');
    }
  }, [value]);

  // Filtrage local — insensible à la casse, supporte plusieurs mots
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, maxResults);

    const tokens = q.split(/\s+/).filter(Boolean);

    return students
      .filter((s) => {
        const haystack = [
          s.firstName,
          s.lastName,
          `${s.firstName} ${s.lastName}`,
          `${s.lastName} ${s.firstName}`,
          s.registrationNumber || '',
          s.className || '',
        ]
          .join(' ')
          .toLowerCase();
        // Tous les tokens doivent matcher
        return tokens.every((t) => haystack.includes(t));
      })
      .slice(0, maxResults);
  }, [query, students, maxResults]);

  // Click-outside pour fermer
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  // Reset highlightedIndex quand la liste change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  // Auto-scroll de l'élément highlighted dans la liste
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (student: T) => {
    onChange(student.id, student);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('', null);
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((idx) => Math.min(idx + 1, filteredStudents.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((idx) => Math.max(idx - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredStudents[highlightedIndex]) {
          handleSelect(filteredStudents[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const formatStudent = (s: T) => {
    const name = `${s.firstName} ${s.lastName}`.trim();
    const meta = [s.registrationNumber, s.className].filter(Boolean).join(' · ');
    return { name, meta };
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
          {required && <span className="text-rouge-500 ml-1">*</span>}
        </label>
      )}

      {/* Sélection actuelle (chip) */}
      {selectedStudent && !isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          disabled={disabled}
          className={cn(
            'group flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-all',
            'hover:border-vert-400 focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10',
            'dark:bg-white/5 dark:hover:border-or-400 dark:focus:border-or-400',
            error
              ? 'border-rouge-400 dark:border-rouge-500/50'
              : 'border-gray-200 dark:border-white/10',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vert-500 to-bleu-700 text-white shadow-md">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-gray-900 dark:text-white">
              {formatStudent(selectedStudent).name}
            </p>
            {formatStudent(selectedStudent).meta && (
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-vert-700 dark:text-or-400">
                {formatStudent(selectedStudent).meta}
              </p>
            )}
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                handleClear();
              }
            }}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rouge-50 hover:text-rouge-600 dark:hover:bg-rouge-500/10 cursor-pointer"
            title="Effacer la sélection"
          >
            <X size={14} />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 pl-11 pr-10 text-sm font-bold text-gray-900 outline-none transition-all',
              'placeholder:text-gray-400 placeholder:font-medium',
              'focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10',
              'dark:bg-white/5 dark:text-white dark:focus:border-or-400 dark:focus:ring-or-400/10',
              error
                ? 'border-rouge-400 dark:border-rouge-500/50 focus:border-rouge-500 focus:ring-rouge-500/10'
                : 'border-gray-200 dark:border-white/10',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-bold text-rouge-600">{error}</p>}

      {/* Dropdown des résultats */}
      {isOpen && !disabled && (
        <div
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900"
          style={{ top: '100%' }}
        >
          {/* Header avec compteur */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-white/5 dark:bg-white/5">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-or-400">
              <Users size={12} />
              {filteredStudents.length} sur {students.length}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              ↑↓ pour naviguer · Entrée pour valider
            </span>
          </div>

          {students.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-bold text-gray-400">
                Aucun élève chargé. Vérifiez votre connexion.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                Aucun élève ne correspond à « {query} »
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                Essayez avec le matricule, le nom de famille ou la classe.
              </p>
            </div>
          ) : (
            <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
              {filteredStudents.map((s, idx) => {
                const { name, meta } = formatStudent(s);
                const isHighlighted = idx === highlightedIndex;
                const isSelected = s.id === value;
                return (
                  <li
                    key={s.id}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(s)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
                      isHighlighted
                        ? 'bg-vert-50 dark:bg-or-500/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5',
                      isSelected && 'bg-vert-100 dark:bg-or-500/20'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all',
                        isHighlighted
                          ? 'bg-gradient-to-br from-vert-500 to-bleu-700 scale-105'
                          : 'bg-gradient-to-br from-vert-600 to-bleu-700'
                      )}
                    >
                      <User size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-black',
                          isHighlighted
                            ? 'text-vert-900 dark:text-or-300'
                            : 'text-gray-900 dark:text-white'
                        )}
                      >
                        {name}
                      </p>
                      {meta && (
                        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {meta}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentSearchInput;
