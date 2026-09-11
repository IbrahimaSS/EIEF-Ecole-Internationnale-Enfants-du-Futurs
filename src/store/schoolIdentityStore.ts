import { create } from "zustand";
import { ApiError, apiRequest } from "../services/api";

export const DEFAULT_SCHOOL_NAME = "École Internationale Les Enfants du Futur";
export const DEFAULT_SCHOOL_SHORT_NAME = "EIEF";
export const DEFAULT_SCHOOL_LOGO = "/logo_eief.jpeg";
export const DEFAULT_SCHOOL_EMAIL = "eiefinfos@enfantsdufutur.com";
export const DEFAULT_SCHOOL_PHONE = "+224 625 549 579";
export const DEFAULT_SCHOOL_PHONE_SECONDARY = "+224 628 848 437";
export const DEFAULT_SCHOOL_ADDRESS = "C/Sanoyah — Sanoyah Rails, Guinée";
export const DEFAULT_SCHOOL_FACEBOOK = "https://www.facebook.com/share/18hUbQ4hgm/";

/**
 * État de l'hôte courant, décidé par l'API :
 * - platform : domaine racine, espace du super-administrateur
 * - school   : sous-domaine d'une école active
 * - unknown  : sous-domaine sans école active (404)
 * - offline  : API injoignable
 */
export type HostContext = "loading" | "platform" | "school" | "unknown" | "offline";

export interface SchoolIdentity {
  context: "PLATFORM" | "SCHOOL";
  subdomain: string | null;
  name: string | null;
  shortName: string | null;
  slogan: string | null;
  email: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  address: string | null;
  facebookUrl: string | null;
  logoUrl: string | null;
}

interface SchoolIdentityStore {
  identity: SchoolIdentity | null;
  context: HostContext;
  load: () => Promise<void>;
}

export const useSchoolIdentityStore = create<SchoolIdentityStore>()((set, get) => ({
  identity: null,
  context: "loading",

  load: async () => {
    if (get().context !== "loading") {
      return;
    }

    try {
      const identity = await apiRequest<SchoolIdentity>("/school/identity");
      set({
        identity,
        context: identity.context === "PLATFORM" ? "platform" : "school",
      });
    } catch (error) {
      const isUnknownSchool = error instanceof ApiError && error.status === 404;
      set({ identity: null, context: isUnknownSchool ? "unknown" : "offline" });
    }
  },
}));

export const schoolLogo = (): string =>
  useSchoolIdentityStore.getState().identity?.logoUrl || DEFAULT_SCHOOL_LOGO;

export const schoolName = (): string =>
  useSchoolIdentityStore.getState().identity?.name || DEFAULT_SCHOOL_NAME;

export const useSchoolLogo = (): string =>
  useSchoolIdentityStore((state) => state.identity?.logoUrl || DEFAULT_SCHOOL_LOGO);

export const useSchoolName = (): string =>
  useSchoolIdentityStore((state) => state.identity?.name || DEFAULT_SCHOOL_NAME);

export const useSchoolShortName = (): string =>
  useSchoolIdentityStore((state) => state.identity?.shortName || DEFAULT_SCHOOL_SHORT_NAME);

export const useHostContext = (): HostContext =>
  useSchoolIdentityStore((state) => state.context);

export const useSchoolSlogan = (): string | null =>
  useSchoolIdentityStore((state) => state.identity?.slogan ?? null);

export const useSchoolEmail = (): string =>
  useSchoolIdentityStore((state) => state.identity?.email || DEFAULT_SCHOOL_EMAIL);

export const useSchoolPhone = (): string =>
  useSchoolIdentityStore((state) => state.identity?.phone || DEFAULT_SCHOOL_PHONE);

export const useSchoolPhoneSecondary = (): string | null =>
  useSchoolIdentityStore((state) =>
    state.identity ? state.identity.phoneSecondary : DEFAULT_SCHOOL_PHONE_SECONDARY,
  );

export const useSchoolAddress = (): string =>
  useSchoolIdentityStore((state) => state.identity?.address || DEFAULT_SCHOOL_ADDRESS);

export const useSchoolFacebook = (): string =>
  useSchoolIdentityStore((state) => state.identity?.facebookUrl || DEFAULT_SCHOOL_FACEBOOK);

export const setSchoolIdentity = (identity: SchoolIdentity): void =>
  useSchoolIdentityStore.setState({ identity });
