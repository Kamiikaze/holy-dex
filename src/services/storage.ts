import type { Bewertung, Drink, ExportPayload, Kategorie } from '../types/drink'

const STORAGE_KEY = 'holy-drinks:data'

type PredefinedDrink = Pick<Drink, 'kategorie' | 'sorte' | 'geschmack' | 'limitiert'>

const PREDEFINED_ROWS: PredefinedDrink[] = [
    {kategorie: 'Energy', sorte: 'Caipirinha Crab', geschmack: 'Caipirinha Cocktail', limitiert: false},
    {kategorie: 'Energy', sorte: 'Colada Capybara', geschmack: 'Pina Colada', limitiert: false},
    {kategorie: 'Energy', sorte: 'Daiquiri Dolphin', geschmack: 'Erdbeere mit Limette', limitiert: false},
    {kategorie: 'Energy', sorte: 'Fruity Frog', geschmack: 'Tropische Früchte Mix', limitiert: false},
    {kategorie: 'Energy', sorte: 'Grapefruit Giraffe', geschmack: 'Grapefruit', limitiert: false},
    {kategorie: 'Energy', sorte: 'Mojito', geschmack: 'Limette mit Minze', limitiert: false},
    {kategorie: 'Energy', sorte: 'Plum x Cinnamon', geschmack: 'Pflaume mit Zimt (Weihnachten)', limitiert: true},
    {kategorie: 'Energy', sorte: 'Pomegranate Piranha', geschmack: 'Granatapfel', limitiert: false},
    {kategorie: 'Energy', sorte: 'Baked Apple Boar', geschmack: 'Bratapfel (Weihnachten)', limitiert: true},
    {kategorie: 'Energy', sorte: 'Energy Eel', geschmack: 'Guave', limitiert: false},
    {kategorie: 'Energy', sorte: 'Kola Koala', geschmack: 'Cola', limitiert: false},
    {kategorie: 'Energy', sorte: 'Peach Panther', geschmack: 'Pfirsich mit Aprikose', limitiert: false},
    {kategorie: 'Energy', sorte: 'Raspberry Raptor', geschmack: 'Himbeere mit Yuzu', limitiert: false},
    {kategorie: 'Energy', sorte: 'Woodruff Wolf', geschmack: 'Waldmeister', limitiert: true},
    {kategorie: 'Energy', sorte: 'Apple Alligator', geschmack: 'Saftiger saurer Apfel', limitiert: false},
    {kategorie: 'Energy', sorte: 'Bubble Gum Butterfly', geschmack: 'Kaugummi', limitiert: true},
    {kategorie: 'Energy', sorte: 'Candy Ice', geschmack: 'Eis mit Bonbon', limitiert: true},
    {kategorie: 'Energy', sorte: 'Tangerine Tarantula', geschmack: 'Mandarine', limitiert: false},
    {kategorie: 'Energy', sorte: 'Thai Lime Toucan', geschmack: 'Kaffir-Limette', limitiert: false},
    {kategorie: 'Energy', sorte: 'Watermelon Whale', geschmack: 'Wassermelone', limitiert: false},
    {kategorie: 'Energy', sorte: 'Bloodorange Bat', geschmack: 'Blutorange', limitiert: true},
    {kategorie: 'Energy', sorte: 'Açaí Anaconda', geschmack: 'Açaí mit Mandarine', limitiert: false},
    {kategorie: 'Energy', sorte: 'Blue Raspberry', geschmack: 'Blaue Himbeere (Hitschies)', limitiert: false},
    {kategorie: 'Energy', sorte: 'Blueberry Bear', geschmack: 'Blaubeere mit Kokos', limitiert: false},
    {kategorie: 'Energy', sorte: 'Cactus Camel', geschmack: 'Kaktusfeige', limitiert: false},
    {kategorie: 'Energy', sorte: 'Cherry Cheetah', geschmack: 'Kirsche', limitiert: false},
    {kategorie: 'Energy', sorte: 'Citrus Cobra', geschmack: 'Zitrusfrüchte mit Kalamansi', limitiert: false},
    {kategorie: 'Energy', sorte: 'Classic Energy', geschmack: 'Klassischer Energy Geschmack', limitiert: false},
    {kategorie: 'Energy', sorte: 'Cotton Candy', geschmack: 'Zuckerwatte', limitiert: true},
    {kategorie: 'Energy', sorte: 'Dragonfruit Dragon', geschmack: 'Drachenfrucht', limitiert: false},
    {kategorie: 'Energy', sorte: "Gorilla's Grape", geschmack: 'Grüne Weintraube', limitiert: false},
    {kategorie: 'Energy', sorte: 'Kiwi Komodo', geschmack: 'Kiwi', limitiert: false},
    {kategorie: 'Energy', sorte: 'Lemon Lizard', geschmack: 'Zitrone mit Gurke', limitiert: false},
    {kategorie: 'Energy', sorte: "Lion's Lemonade", geschmack: 'Zitrone', limitiert: false},
    {kategorie: 'Energy', sorte: 'Lychee', geschmack: 'Litschi', limitiert: false},
    {kategorie: 'Energy', sorte: 'Orange', geschmack: 'Orange mit Vanille', limitiert: false},
    {kategorie: 'Energy', sorte: "Peacock's Punch", geschmack: 'Bunter Fruchtcocktail', limitiert: false},
    {kategorie: 'Energy', sorte: 'Shisha Double Apple', geschmack: 'Doppel Apfel Shisha', limitiert: true},
    {kategorie: 'Energy', sorte: 'Spider Legs', geschmack: 'Cola sauer', limitiert: false},
    {kategorie: 'Energy', sorte: 'Strawberry Shark', geschmack: 'Erdbeere mit Mandarine', limitiert: false},
    {kategorie: 'Energy', sorte: 'Tropical Tiger', geschmack: 'Ananas mit Passionsfrucht', limitiert: false},
    {
        kategorie: 'Energy',
        sorte: 'Wildberry Wolf',
        geschmack: 'Wilde Beeren Mix (Himbeere Brombeere Blaubeere)',
        limitiert: false
    },
    {kategorie: 'Hydration', sorte: 'Cranberry', geschmack: 'Cranberry', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Guava', geschmack: 'Guave', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Lemon', geschmack: 'Zitrone', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Passion Fruit', geschmack: 'Passionsfrucht', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Pineapple', geschmack: 'Ananas', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Pink Grapefruit', geschmack: 'Grapefruit', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Strawberry Kiwi', geschmack: 'Erdbeere mit Kiwi', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Coconut', geschmack: 'Kokosnuss', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Multivitamin', geschmack: 'Multivitamin', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Pear', geschmack: 'Birne', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Sour Cherry', geschmack: 'Sauerkirsche', limitiert: false},
    {kategorie: 'Hydration', sorte: 'White Peach', geschmack: 'Weißer Pfirsich', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Mystery (?)', geschmack: 'Kokosnuss, Gojibeere', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Orange', geschmack: 'Orange', limitiert: false},
    {kategorie: 'Hydration', sorte: 'Watermelon', geschmack: 'Wassermelone', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Apple', geschmack: 'Apfel mit Grüntee', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Darjeeling Honey', geschmack: 'Darjeeling mit Honig', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Peach x Black Tea', geschmack: 'Pfirsich', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Strawberry x Hibiscus', geschmack: 'Erdbeere', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Watermelon x Hibiscus', geschmack: 'Wassermelone', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Classic Iced Tea', geschmack: 'Schwarztee', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Mango x Passionfruit', geschmack: 'Mango mit Passionsfrucht', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Raspberry x Vanilla', geschmack: 'Himbeere mit Vanille', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Blackberry', geschmack: 'Brombeere mit Schwarztee', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Honey Melon x Green Tea', geschmack: 'Honigmelone', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Winter Punch x Hibiscus Tea', geschmack: 'Punsch', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Acai', geschmack: 'Açaí mit Hibiskus', limitiert: false},
    {kategorie: 'Iced Tea', sorte: 'Lemon x Honey', geschmack: 'Zitrone mit Honig', limitiert: false},
    {
        kategorie: 'Iced Tea',
        sorte: 'Lime x Mint x Matcha x Green Tea',
        geschmack: 'Matcha mit Limette, Minze und grüner Tee',
        limitiert: false
    },
    {kategorie: 'Iced Tea', sorte: 'Peach x Nectarine', geschmack: 'Pfirsich mit Nektarine', limitiert: false},
    {
        kategorie: 'Iced Tea',
        sorte: 'Pineapple x Green Tea',
        geschmack: 'Ananas mit Grüntee (SpongeBob)',
        limitiert: true
    },
    {kategorie: 'Iced Tea', sorte: 'Red Grape x Hibiscus', geschmack: 'Rote Traube mit Hibiskus', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Caramel', geschmack: 'Karamell', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Hazelnut', geschmack: 'Haselnuss', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Banana', geschmack: 'Banane', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Speculatius', geschmack: 'Spekulatius', limitiert: true},
    {kategorie: 'Milkshake', sorte: 'Strawberry', geschmack: 'Erdbeere', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Vanilla', geschmack: 'Vanille', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Coffee Latte', geschmack: 'Eiskaffee', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Caramel-Coffee', geschmack: 'Eiskaffee mit Karamell', limitiert: false},
    {kategorie: 'Milkshake', sorte: 'Hazelnut-Coffee', geschmack: 'Eiskaffee mit Haselnuss', limitiert: false},
    {kategorie: 'Energy', sorte: 'Matcha Misaki', geschmack: 'Matcha mit Erdbeere', limitiert: false},
]

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
    if (kategorie === 'Eistee') return 'Iced Tea'
    if (kategorie === 'Milchshake') return 'Milkshake'
    if (kategorie === 'Energy' || kategorie === 'Iced Tea' || kategorie === 'Hydration' || kategorie === 'Milkshake') {
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
