import { computed } from 'vue'

/**
 * Genera una lista de páginas para la paginación tipo "1 2 ... 7 8 9 ... 20 21"
 * Nunca muestra más de 7 botones simultáneamente.
 */
export function usePagination(currentPage: { value: number }, totalPages: { value: number }) {
  const pages = computed<(number | '...')[]>(() => {
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const result: (number | '...')[] = []

    // Siempre primera página
    result.push(1)

    if (current > 3) result.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      result.push(i)
    }

    if (current < total - 2) result.push('...')

    // Siempre última página
    result.push(total)

    return result
  })

  return { pages }
}
