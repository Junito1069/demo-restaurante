import { useContext } from 'react'
import { AppContext } from '../context/app-context'

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}
