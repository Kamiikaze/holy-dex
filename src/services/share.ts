import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Drink } from '../types/drink'
import { parseImportPayload, toExportPayload } from './storage'

const PARAM = 'd'

export function buildShareUrl(drinks: Drink[], title: string): string {
  const payload = toExportPayload(drinks, title)
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload))
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(PARAM, compressed)
  return url.toString()
}

export function readSharedDrinksFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(PARAM)
  if (!raw) return null
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    return parseImportPayload(json)
  } catch {
    return null
  }
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(PARAM)
  window.history.replaceState({}, '', url.toString())
}
