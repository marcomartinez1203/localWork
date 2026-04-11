/** Elimina acentos y normaliza a minúsculas para búsqueda sin diacríticos */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
