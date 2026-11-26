import { seedData } from '../data/seed'
import type { AppData } from '../types'

export const STORAGE_KEY = 'casa-verde-demo-v1'

export function loadData(): AppData {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return seedData
  try {
    return JSON.parse(saved) as AppData
  } catch (error) {
    console.error('No se pudieron leer los datos guardados de la demo.', error)
    return seedData
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function parseData(value: string | null): AppData | null {
  if (!value) return null
  try {
    return JSON.parse(value) as AppData
  } catch (error) {
    console.error('No se pudieron sincronizar los datos de otra pestaña.', error)
    return null
  }
}
