import Layout from '@/components/Layout'

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
          <p className="text-subtext1">Customize your Coffee Tracker experience</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Brewing Preferences */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Brewing Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Brewing Method
                </label>
                <select className="input w-full">
                  <option value="v60">V60</option>
                  <option value="espresso">Espresso</option>
                  <option value="aeropress">Aeropress</option>
                  <option value="chemex">Chemex</option>
                  <option value="kalita">Kalita</option>
                  <option value="frenchpress">French Press</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature Units
                </label>
                <select className="input w-full">
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Confirmations</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 text-primary rounded border-overlay0"
                />
                <span>Confirm when marking bags as finished</span>
              </label>
            </div>
          </div>

          {/* Data Export */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Data Export</h2>
            <div className="space-y-4">
              <p className="text-subtext1 text-sm">
                Export your coffee data for backup or analysis in external tools.
              </p>
              <div className="flex gap-3">
                <button className="btn btn-secondary">
                  Export Bags CSV
                </button>
                <button className="btn btn-secondary">
                  Export Brews CSV
                </button>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}