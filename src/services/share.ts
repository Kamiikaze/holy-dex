import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Drink } from '../types/drink'
import { toExportPayload } from './storage'

const PARAM = 'd'

export function buildShareUrl(drinks: Drink[]): string {
  const payload = toExportPayload(drinks)
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload))
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(PARAM, compressed)
  return url.toString()
}

export function readSharedDrinksFromUrl(): Drink[] | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(PARAM)
  if (!raw) return null
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    const payload = JSON.parse(json)
    return Array.isArray(payload?.drinks) ? payload.drinks : null
  } catch {
    return null
  }
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(PARAM)
  window.history.replaceState({}, '', url.toString())
}
