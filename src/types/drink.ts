export type Kategorie =
  | "Energy"
  | "Iced Tea"
  | "Hydration"
  | "Milkshake"
  | "Syrup";

export type Bewertung = "S" | "A" | "B" | "C" | "D" | "E";

export const KATEGORIEN: Kategorie[] = [
  "Energy",
  "Iced Tea",
  "Hydration",
  "Milkshake",
  "Syrup",
];

export const BEWERTUNGEN: {
  value: Bewertung;
  label: string;
  color: string;
  weight: number;
}[] = [
  { value: "S", label: "Absoluter Favorit", color: "#FFFF00", weight: 6 },
  { value: "A", label: "Sehr gut", color: "#4CAF50", weight: 5 },
  { value: "B", label: "Gut", color: "#8BC34A", weight: 4 },
  { value: "C", label: "Ganz ok", color: "#ca9700", weight: 3 },
  { value: "D", label: "Muss nicht", color: "#c67700", weight: 2 },
  { value: "E", label: "Geht gar nicht", color: "#F44336", weight: 1 },
];

export function bewertungMeta(b: Bewertung) {
  return BEWERTUNGEN.find((x) => x.value === b)!;
}

export interface Drink {
  id: string;
  kategorie: Kategorie;
  sorte: string;
  geschmack: string;
  limitiert: boolean;
  bewertung: Bewertung | null;
  kommentar: string;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  shareTitle?: string;
  drinks: Drink[];
}
