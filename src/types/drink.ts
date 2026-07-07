export type Kategorie = 'Energy' | 'Eistee' | 'Hydration' | 'Milchshake'

export type Bewertung = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

export const KATEGORIEN: Kategorie[] = ['Energy', 'Eistee', 'Hydration', 'Milchshake']

export const BEWERTUNGEN: { value: Bewertung; label: string; color: string; weight: number }[] = [
  { value: 'S', label: 'Absoluter Favorit', color: '#FFD700', weight: 6 },
  { value: 'A', label: 'Sehr gut', color: '#4CAF50', weight: 5 },
  { value: 'B', label: 'Gut', color: '#8BC34A', weight: 4 },
  { value: 'C', label: 'Ganz ok', color: '#FFC107', weight: 3 },
  { value: 'D', label: 'Muss nicht', color: '#FF9800', weight: 2 },
  { value: 'E', label: 'Geht gar nicht', color: '#F44336', weight: 1 },
]

export function bewertungMeta(b: Bewertung) {
  return BEWERTUNGEN.find((x) => x.value === b)!
}

export interface Drink {
  id: string
  kategorie: Kategorie
  sorte: string
  geschmack: string
  limitiert: boolean
  bewertung: Bewertung
  kommentar: string
}

export interface ExportPayload {
  version: 1
  exportedAt: string
  drinks: Drink[]
}
