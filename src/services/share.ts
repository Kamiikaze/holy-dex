import { deflateSync, inflateSync } from "fflate";
import type { Bewertung, Drink } from "../types/drink";
import { PREDEFINED_DRINKS } from "./storage.ts";

type ShareUpdate = {
  bewertung: Bewertung | null;
  kommentar: string;
};

const HASH_KEY = "d";

function packPayload(drinks: Drink[], title: string) {
  const changedOnly = drinks.filter((d) => d.bewertung != null);
  return [title, changedOnly.map((d) => [d.id, d.bewertung, d.kommentar])];
}

function unpackPayload(data: any) {
  if (!Array.isArray(data) || data.length !== 2) return null;

  const [title, rawDrinks] = data;

  const updates = new Map<string, ShareUpdate>(
    rawDrinks.map(
      ([id, bewertung, kommentar]: [string, Bewertung | null, string]) => [
        id,
        { bewertung, kommentar },
      ],
    ),
  );

  const drinks = PREDEFINED_DRINKS.map((drink) => {
    const update = updates.get(drink.id);

    return update
      ? {
          ...drink,
          bewertung: update.bewertung,
          kommentar: update.kommentar,
        }
      : { ...drink };
  }).filter((d) => d.bewertung != null);

  return { title, drinks };
}

// Helper: Convert Uint8Array to URL-safe Base64 without heavy libraries
function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToUint8(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function buildShareUrl(drinks: Drink[], title: string): string {
  const packed = packPayload(drinks, title);
  console.log("packed", packed);
  const jsonString = JSON.stringify(packed);

  // Compress JSON string to binary Uint8Array
  const textEncoder = new TextEncoder();
  const compressedBytes = deflateSync(textEncoder.encode(jsonString), {
    level: 9,
  });

  // Convert binary directly to URL-safe Base64
  const encoded = uint8ToBase64Url(compressedBytes);

  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `${HASH_KEY}=${encoded}`;
  return url.toString();
}

export function readSharedDrinksFromUrl() {
  const hash = window.location.hash.slice(1); // remove '#'
  const params = new URLSearchParams(hash);
  const raw = params.get(HASH_KEY);
  if (!raw) return null;
  console.log("log", raw);

  try {
    const compressedBytes = base64UrlToUint8(raw);
    const decompressedBytes = inflateSync(compressedBytes);
    const jsonString = new TextDecoder().decode(decompressedBytes);
    const parsed = JSON.parse(jsonString);

    return unpackPayload(parsed);
  } catch (e) {
    console.error("Failed to parse share URL", e);
    return null;
  }
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, "", url.pathname + url.search);
}
