import { computed, ref } from 'vue'
import { STORAGE } from '../utils/constants'
import { DEFAULT_DISPLAY_MODE, normalizeDashboardView } from '../utils/displayMode.js'

const currentView = ref(DEFAULT_DISPLAY_MODE)
let initialized = false

export const useDashboardView = () => {
  const switchView = (viewName, fallback = DEFAULT_DISPLAY_MODE) => {
    const normalizedView = normalizeDashboardView(viewName, fallback)
    currentView.value = normalizedView
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE.VIEW_PREFERENCE, normalizedView)
    }
    return normalizedView
  }

  const restoreView = (fallback = DEFAULT_DISPLAY_MODE) => {
    const rawSavedView = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE.VIEW_PREFERENCE)
      : ''
    const savedView = normalizeDashboardView(rawSavedView, fallback)
    currentView.value = savedView
    if (rawSavedView && rawSavedView !== savedView && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE.VIEW_PREFERENCE, savedView)
    }
    initialized = true
    return savedView
  }

  if (!initialized && typeof localStorage !== 'undefined') {
    restoreView()
  }

  return {
    currentView,
    switchView,
    restoreView
  }
}
