// src/hooks/useAdminSettings.ts
import { useState, useEffect, useCallback } from "react";
import { settingsApi, SettingsResponse, logsApi, AuditLog } from "../services/adminApi";

// ─────────────────────────────────────────────────────
// Clés de settings connues (à étendre selon ton backend)
// ─────────────────────────────────────────────────────
export const SETTING_KEYS = {
  NOM_ETABLISSEMENT: "NOM_ETABLISSEMENT",
  SLOGAN: "SLOGAN",
  EMAIL: "EMAIL_ADMINISTRATIF",
  TELEPHONE: "TELEPHONE",
  TWO_FA_ENABLED: "TWO_FA_ENABLED",
} as const;

// ─────────────────────────────────────────────────────
// Hook principal : charge tous les settings
// ─────────────────────────────────────────────────────
export function useAdminSettings() {
  const [settings, setSettings] = useState<SettingsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mappe les settings en objet clé→valeur pour un accès facile
  const settingsMap = Object.fromEntries(
    settings.map((s) => [s.key, s])
  ) as Record<string, SettingsResponse>;

  const getValue = (key: string, fallback = "") =>
    settingsMap[key]?.value ?? fallback;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getAll();
      setSettings(data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de chargement des paramètres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Sauvegarde un ensemble de champs modifiés.
   * @param changes - objet { key: newValue }
   */
  const saveChanges = useCallback(
    async (changes: Record<string, string>) => {
      setSaving(true);
      setError(null);
      try {
        await Promise.all(
          Object.entries(changes).map(([key, value]) => {
            const existing = settingsMap[key];
            if (existing) {
              return settingsApi.update(existing.id, {
                key: existing.key,
                value,
                category: existing.category,
                description: existing.description,
              });
            } else {
              // Si la clé n'existe pas encore en base, on la crée
              return settingsApi.create({ key, value });
            }
          })
        );
        // Recharge pour être en sync avec le backend
        await load();
      } catch (err: any) {
        setError(err?.message ?? "Erreur lors de la sauvegarde.");
        throw err; // permet au composant d'afficher une erreur
      } finally {
        setSaving(false);
      }
    },
    [settingsMap, load]
  );

  return { settings, settingsMap, getValue, loading, saving, error, load, saveChanges };
}

// ─────────────────────────────────────────────────────
// Hook pour les logs d'audit
// ─────────────────────────────────────────────────────
export function useAuditLogs(filter?: { userId?: string; module?: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: AuditLog[];
      if (filter?.userId) {
        data = await logsApi.getByUser(filter.userId);
      } else if (filter?.module) {
        data = await logsApi.getByModule(filter.module);
      } else {
        data = await logsApi.getAll();
      }
      setLogs(data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de chargement des logs.");
    } finally {
      setLoading(false);
    }
  }, [filter?.userId, filter?.module]);

  useEffect(() => {
    load();
  }, [load]);

  return { logs, loading, error, reload: load };
}
