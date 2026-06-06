/**
 * Génère un code lisible et stable pour une famille.
 * Priorité : familyId UUID → 8 premiers caractères hexadécimaux.
 * Fallback  : hash simple du nom.
 * Exemples  : FAM-A1B2C3D4  |  FAM-00A8F302
 */
export function generateFamilyCode(
  familyId: string | undefined,
  key: string,
): string {
  if (familyId) {
    const hex = familyId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `FAM-${hex}`;
  }
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return `FAM-${Math.abs(h).toString(16).substring(0, 8).toUpperCase().padStart(8, '0')}`;
}
