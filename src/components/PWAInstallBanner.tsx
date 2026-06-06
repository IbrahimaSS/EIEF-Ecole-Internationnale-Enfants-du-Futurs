import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-bleu-600 flex items-center justify-center">
        <img src="/logo192.png" alt="EIEF" className="w-8 h-8 rounded-lg" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
          Installer l'application
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Accès rapide depuis votre écran d'accueil, même hors ligne.
        </p>
        <button
          onClick={install}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Installer
        </button>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
