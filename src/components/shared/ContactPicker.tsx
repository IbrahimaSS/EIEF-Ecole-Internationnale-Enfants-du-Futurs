import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, User, Users, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ChatContact } from '../../hooks/useCommunication';

interface ContactPickerProps {
  contacts: ChatContact[];
  value: string;
  onChange: (contactId: string, contact: ChatContact | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Filtre supplémentaire optionnel (ex: limiter aux enseignants) */
  filterRoles?: string[];
}

/**
 * Sélecteur de contact avec recherche — utilisé dans la messagerie pour choisir
 * le destinataire. Filtre par nom, email, rôle.
 */
const ContactPicker: React.FC<ContactPickerProps> = ({
  contacts,
  value,
  onChange,
  label = 'Destinataire',
  placeholder = 'Rechercher un nom, un email ou un rôle...',
  required,
  disabled,
  filterRoles,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => contacts.find((c) => c.id === value) || null,
    [contacts, value],
  );

  const eligibleContacts = useMemo(() => {
    if (!filterRoles || filterRoles.length === 0) return contacts;
    return contacts.filter((c) =>
      filterRoles.some((r) => (c.role || '').toUpperCase().includes(r.toUpperCase())),
    );
  }, [contacts, filterRoles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligibleContacts.slice(0, 50);
    const tokens = q.split(/\s+/).filter(Boolean);
    return eligibleContacts
      .filter((c) => {
        const haystack = [c.fullName, c.email, c.role, c.meta]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return tokens.every((t) => haystack.includes(t));
      })
      .slice(0, 50);
  }, [eligibleContacts, query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlight(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const item = listRef.current.children[highlight] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [highlight, isOpen]);

  const select = (c: ChatContact) => {
    onChange(c.id, c);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clear = () => {
    onChange('', null);
    setQuery('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        setHighlight((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlight]) select(filtered[highlight]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      {label && (
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
          {required && <span className="text-rouge-500 ml-1">*</span>}
        </label>
      )}

      {selected && !isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          disabled={disabled}
          className={cn(
            'group flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-all',
            'hover:border-vert-400 focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10',
            'border-gray-200 dark:bg-white/5 dark:border-white/10',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vert-500 to-bleu-700 text-white shadow-md">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-gray-900 dark:text-white">
              {selected.fullName}
            </p>
            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-vert-700 dark:text-or-400">
              {selected.meta || selected.role}
              {selected.email ? ` · ${selected.email}` : ''}
            </p>
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                clear();
              }
            }}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rouge-50 hover:text-rouge-600 dark:hover:bg-rouge-500/10 cursor-pointer"
            title="Effacer"
          >
            <X size={14} />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={onKey}
            className={cn(
              'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pl-11 pr-10 text-sm font-bold text-gray-900 outline-none transition-all',
              'placeholder:text-gray-400 placeholder:font-medium',
              'focus:border-vert-500 focus:ring-4 focus:ring-vert-500/10',
              'dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-or-400',
              disabled && 'cursor-not-allowed opacity-60',
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

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-white/5 dark:bg-white/5">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vert-700 dark:text-or-400">
              <Users size={12} /> {filtered.length} sur {eligibleContacts.length}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              ↑↓ · Entrée
            </span>
          </div>
          {eligibleContacts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm font-bold text-gray-400">
              Aucun contact autorisé pour votre rôle.
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                Aucun contact ne correspond à « {query} »
              </p>
            </div>
          ) : (
            <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
              {filtered.map((c, i) => {
                const highlighted = i === highlight;
                return (
                  <li
                    key={c.id}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => select(c)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
                      highlighted
                        ? 'bg-vert-50 dark:bg-or-500/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all',
                        highlighted
                          ? 'bg-gradient-to-br from-vert-500 to-bleu-700 scale-105'
                          : 'bg-gradient-to-br from-vert-600 to-bleu-700',
                      )}
                    >
                      <User size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-black',
                          highlighted
                            ? 'text-vert-900 dark:text-or-300'
                            : 'text-gray-900 dark:text-white',
                        )}
                      >
                        {c.fullName}
                      </p>
                      <p className="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {c.meta || c.role}
                        {c.email ? ` · ${c.email}` : ''}
                      </p>
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
};

export default ContactPicker;
