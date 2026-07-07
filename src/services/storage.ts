import type { Drink, ExportPayload } from '../types/drink'

const STORAGE_KEY = 'holy-drinks:data'

export function loadDrinks(): Drink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Drink[]
  } catch {
    return []
  }
}

export function saveDrinks(drinks: Drink[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drinks))
}

export function makeId(): string {
  return crypto.randomUUID()
}

export function toExportPayload(drinks: Drink[]): ExportPayload {
  return { version: 1, exportedAt: new Date().toISOString(), drinks }
}

export function parseImportPayload(json: string): Drink[] {
  const data = JSON.parse(json)
  // Accept either a raw array or an ExportPayload wrapper
  const drinks: unknown = Array.isArray(data) ? data : data?.drinks

  if (!Array.isArray(drinks)) {
    throw new Error('Ungültiges Format: kein Drink-Array gefunden.')
  }

  for (const d of drinks) {
    if (
      typeof d !== 'object' ||
      d === null ||
      typeof d.sorte !== 'string' ||
      typeof d.kategorie !== 'string' ||
      typeof d.bewertung !== 'string'
    ) {
      throw new Error('Ungültiges Format: Drink-Eintrag fehlerhaft.')
    }
    if (!d.id) d.id = makeId()
  }

  return drinks as Drink[]
}
