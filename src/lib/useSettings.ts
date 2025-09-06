import { useState, useEffect } from 'react'

export interface UserSettings {
  defaultBrewingMethod: string
  temperatureUnit: 'celsius' | 'fahrenheit'
  confirmFinishBag: boolean
  defaultGrindSetting: number | null
  defaultDoseG: number | null
  defaultWaterTempC: number | null
  language: 'es' | 'en'
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultBrewingMethod: 'espresso',
  temperatureUnit: 'celsius',
  confirmFinishBag: true,
  defaultGrindSetting: 15,
  defaultDoseG: 18,
  defaultWaterTempC: 93,
  language: 'es'
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('coffee-tracker-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    
    try {
      localStorage.setItem('coffee-tracker-settings', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const getSetting = <K extends keyof UserSettings>(key: K): UserSettings[K] => {
    return settings[key]
  }

  return {
    settings,
    loading,
    updateSettings,
    getSetting
  }
}