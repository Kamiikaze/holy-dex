import type { Bewertung, Drink, ExportPayload, Kategorie } from '../types/drink'

import energySorten from '../static/energySorten.json'
import eisteeSorten from '../static/eisteeSorten.json'
import hydrationSorten from '../static/hydrationSorten.json'
import milchshakeSorten from '../static/milchshakeSorten.json'
import syrupSorten from '../static/syrupSorten.json'


const STORAGE_KEY = 'holy-drinks:data'

type PredefinedDrink = Pick<Drink, 'kategorie' | 'sorte' | 'geschmack' | 'limitiert'>

const PREDEFINED_ROWS: PredefinedDrink[] = [
    ...energySorten.products as PredefinedDrink[],
    ...eisteeSorten.products as PredefinedDrink[],
    ...hydrationSorten.products as PredefinedDrink[],
    ...milchshakeSorten.products as PredefinedDrink[],
    ...syrupSorten.products as PredefinedDrink[],
].sort((a, b) => {
    // First sort by kategorie
    const kategorieCompare = a.kategorie.localeCompare(b.kategorie)

    if (kategorieCompare !== 0) {
        return kategorieCompare
    }

    // If kategorie is equal, sort by sorte
    return a.sorte.localeCompare(b.sorte)
} )

export const PREDEFINED_DRINKS: Drink[] = PREDEFINED_ROWS.map((drink) => ({
    id: predefinedId(drink.kategorie, drink.sorte),
    ...drink,
    bewertung: null,
    kommentar: '',
}))

const PREDEFINED_BY_ID = new Map(PREDEFINED_DRINKS.map((drink) => [drink.id, drink]))
const PREDEFINED_ID_BY_LOOKUP = new Map(PREDEFINED_DRINKS.map((drink) => [predefinedLookupKey(drink.kategorie, drink.sorte), drink.id]))

export function loadDrinks(): Drink[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return cloneDrinks(PREDEFINED_DRINKS)

        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return mergeById(PREDEFINED_DRINKS, normalizeDrinks(parsed))
        if (isExportPayload(parsed)) return applyChangesToPredefined(parsed.drinks)
    } catch {
        return cloneDrinks(PREDEFINED_DRINKS)
    }

    return cloneDrinks(PREDEFINED_DRINKS)
}

export function saveDrinks(drinks: Drink[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toExportPayload(drinks)))
}

export function resetDrinks(): void {
    localStorage.removeItem(STORAGE_KEY)
}

export function makeId(): string {
    return crypto.randomUUID()
}

export function toExportPayload(drinks: Drink[], title?: string): ExportPayload {
    const normalized = normalizeDrinks(drinks)
    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        shareTitle: title,
        drinks: normalized.filter(hasChangedFromPredefined),
    }
}

export function parseImportPayload(json: string) {
    const data = JSON.parse(json) as ExportPayload

    return {drinks: normalizeDrinks(data.drinks), shareTitle: data.shareTitle}
}

function applyChangesToPredefined(drinks: unknown[]): Drink[] {
    return mergeById(PREDEFINED_DRINKS, normalizeDrinks(drinks))
}

function normalizeDrinks(drinks: unknown[]): Drink[] {
    return drinks.map(normalizeDrink)
}

function normalizeDrink(value: unknown): Drink {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Ungültiges Format: Drink-Eintrag fehlerhaft.')
    }

    const drink = value as Partial<Drink>
    if (
        typeof drink.sorte !== 'string' ||
        typeof drink.kategorie !== 'string'
    ) {
        throw new Error('Ungültiges Format: Drink-Eintrag fehlerhaft.')
    }

    const kategorie = normalizeKategorie(drink.kategorie)
    const predefinedId = PREDEFINED_ID_BY_LOOKUP.get(predefinedLookupKey(kategorie, drink.sorte))
    return {
        id: predefinedId ?? (typeof drink.id === 'string' && drink.id ? drink.id : makeId()),
        kategorie,
        sorte: drink.sorte,
        geschmack: typeof drink.geschmack === 'string' ? drink.geschmack : '',
        limitiert: Boolean(drink.limitiert),
        bewertung: normalizeBewertung(drink.bewertung),
        kommentar: typeof drink.kommentar === 'string' ? drink.kommentar : '',
    }
}

function hasChangedFromPredefined(drink: Drink): boolean {
    const predefined = PREDEFINED_BY_ID.get(drink.id)
    if (!predefined) return true

    return (
        drink.kategorie !== predefined.kategorie ||
        drink.sorte !== predefined.sorte ||
        drink.geschmack !== predefined.geschmack ||
        drink.limitiert !== predefined.limitiert ||
        drink.bewertung !== predefined.bewertung ||
        drink.kommentar !== predefined.kommentar
    )
}

function mergeById(existing: Drink[], incoming: Drink[]): Drink[] {
    const map = new Map(existing.map((drink) => [drink.id, {...drink}]))
    for (const drink of incoming) map.set(drink.id, {...drink})
    return [...map.values()]
}

function cloneDrinks(drinks: Drink[]): Drink[] {
    return drinks.map((drink) => ({...drink}))
}

function predefinedId(kategorie: Kategorie, sorte: string): string {
    return `holy:${predefinedLookupKey(kategorie, sorte)}`
}

function predefinedLookupKey(kategorie: Kategorie, sorte: string): string {
    return `${kategorie}:${sorte}`
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

function normalizeKategorie(kategorie: string): Kategorie {
    if (kategorie === 'Milchshake') return 'Milkshake'
    if (kategorie === 'Energy' || kategorie === 'Iced Tea' || kategorie === 'Hydration' || kategorie === 'Milkshake' || kategorie === 'Syrup') {
        return kategorie
    }
    throw new Error('Ungültiges Format: unbekannte Kategorie.')
}

function normalizeBewertung(bewertung: unknown): Bewertung | null {
    if (bewertung === null || bewertung === undefined || bewertung === '') return null
    if (bewertung === 'S' || bewertung === 'A' || bewertung === 'B' || bewertung === 'C' || bewertung === 'D' || bewertung === 'E') {
        return bewertung
    }
    throw new Error('Ungültiges Format: unbekannte Bewertung.')
}

function isExportPayload(data: unknown): data is ExportPayload {
    return typeof data === 'object' && data !== null && (data as Partial<ExportPayload>).version === 1 && Array.isArray((data as Partial<ExportPayload>).drinks)
}
