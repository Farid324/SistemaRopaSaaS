// backend/src/shared/helpers.ts

/**
 * Express tipa req.query y req.params como string | string[] | undefined
 * porque los query strings pueden ser arrays (ej: ?id=1&id=2).
 * Este helper extrae un string seguro, ignorando arrays.
 */
export function asString(value: any): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0];
  return undefined;
}

/**
 * Igual que asString pero lanza error si está vacío.
 * Útil para parámetros obligatorios.
 */
export function requireString(value: string | string[] | undefined, fieldName: string): string {
  const str = asString(value);
  if (!str) throw new Error(`${fieldName} es obligatorio`);
  return str;
}

/**
 * Verifica si el rol es de tipo "owner" (puede ver todas las sucursales).
 */
export function isOwnerRole(rol: string): boolean {
  return rol === 'OWNER_PRINCIPAL' || rol === 'CO_OWNER' || rol === 'SUPER_ADMIN';
}