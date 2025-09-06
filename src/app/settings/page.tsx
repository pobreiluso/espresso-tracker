'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { Check, Download, Settings as SettingsIcon } from 'lucide-react'

interface UserSettings {
  defaultBrewingMethod: string
  temperatureUnit: 'celsius' | 'fahrenheit'
  confirmFinishBag: boolean
  defaultGrindSetting: number | null
  defaultDoseG: number | null
  defaultWaterTempC: number | null
  language: 'es' | 'en'
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultBrewingMethod: 'espresso',
  temperatureUnit: 'celsius',
  confirmFinishBag: true,
  defaultGrindSetting: 15,
  defaultDoseG: 18,
  defaultWaterTempC: 93,
  language: 'es'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('coffee-tracker-settings')
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem('coffee-tracker-settings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const exportData = async (type: 'bags' | 'brews') => {
    try {
      // This would need to be implemented with actual data export logic
      alert(`Funcionalidad de exportación de ${type} será implementada próximamente`)
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-2 border-peach border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-peach" />
            Configuración
          </h1>
          <p className="text-subtext1">Personaliza tu experiencia con Coffee Tracker</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Brewing Preferences */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">Preferencias de Extracción</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Método de Extracción por Defecto
                </label>
                <select 
                  className="input w-full"
                  value={settings.defaultBrewingMethod}
                  onChange={(e) => updateSetting('defaultBrewingMethod', e.target.value)}
                >
                  <option value="espresso">Espresso</option>
                  <option value="v60">V60</option>
                  <option value="aeropress">Aeropress</option>
                  <option value="chemex">Chemex</option>
                  <option value="kalita">Kalita</option>
                  <option value="frenchpress">French Press</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Unidades de Temperatura
                </label>
                <select 
                  className="input w-full"
                  value={settings.temperatureUnit}
                  onChange={(e) => updateSetting('temperatureUnit', e.target.value as 'celsius' | 'fahrenheit')}
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text">
                    Ajuste Molino por Defecto
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={settings.defaultGrindSetting || ''}
                    onChange={(e) => updateSetting('defaultGrindSetting', e.target.value ? Number(e.target.value) : null)}
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-text">
                    Dosis por Defecto (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input w-full"
                    value={settings.defaultDoseG || ''}
                    onChange={(e) => updateSetting('defaultDoseG', e.target.value ? Number(e.target.value) : null)}
                    placeholder="18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-text">
                    Temperatura Agua (°C)
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={settings.defaultWaterTempC || ''}
                    onChange={(e) => updateSetting('defaultWaterTempC', e.target.value ? Number(e.target.value) : null)}
                    placeholder="93"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">Confirmaciones</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.confirmFinishBag}
                  onChange={(e) => updateSetting('confirmFinishBag', e.target.checked)}
                  className="w-4 h-4 text-peach rounded border-surface1 focus:ring-peach focus:ring-2"
                />
                <span className="text-text">Confirmar al marcar bolsas como terminadas</span>
              </label>
            </div>
          </div>

          {/* Language */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">Idioma</h2>
            <div className="space-y-4">
              <div>
                <select 
                  className="input w-full"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value as 'es' | 'en')}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">Exportar Datos</h2>
            <div className="space-y-4">
              <p className="text-subtext1 text-sm">
                Exporta tus datos de café para backup o análisis en herramientas externas.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => exportData('bags')}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Bolsas CSV
                </button>
                <button 
                  onClick={() => exportData('brews')}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Cafés CSV
                </button>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button 
              onClick={saveSettings}
              disabled={saving}
              className={`btn btn-primary flex items-center gap-2 transition-all ${
                saved ? 'bg-green hover:bg-green' : ''
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-base border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardado
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}