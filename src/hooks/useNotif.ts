// src/hooks/useNotif.ts
// Hook générique pour afficher des notifications toast.

import { useCallback, useRef, useState } from 'react';
import type { Notif, NotifKind } from '../components/shared/NotificationToast';

export function useNotif(autoCloseMs = 3500) {
  const [notif, setNotif] = useState<Notif | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotif = useCallback(
    (kind: NotifKind, message: string) => {
      if (timer.current) clearTimeout(timer.current);
      setNotif({ kind, message });
      timer.current = setTimeout(() => setNotif(null), autoCloseMs);
    },
    [autoCloseMs],
  );

  const closeNotif = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setNotif(null);
  }, []);

  return { notif, showNotif, closeNotif };
}
