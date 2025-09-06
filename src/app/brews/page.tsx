import Layout from '@/components/Layout'

export default function BrewsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Brew Sessions</h1>
            <p className="text-subtext1">Track and analyze your brewing history</p>
          </div>
          <button className="btn btn-primary">
            + New Brew
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select className="input w-auto">
            <option>All Methods</option>
            <option>Espresso</option>
            <option>V60</option>
            <option>Aeropress</option>
            <option>Chemex</option>
            <option>Kalita</option>
            <option>French Press</option>
          </select>
          <select className="input w-auto">
            <option>All Ratings</option>
            <option>8+ Stars</option>
            <option>6+ Stars</option>
            <option>4+ Stars</option>
          </select>
          <input 
            type="search" 
            placeholder="Search notes..." 
            className="input w-auto min-w-[200px]"
          />
        </div>

        {/* Empty state */}
        <div className="card p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🫖</div>
            <h2 className="text-xl font-semibold mb-2">No brews yet</h2>
            <p className="text-subtext1 mb-6">
              Start brewing and recording your sessions to build your coffee knowledge
            </p>
            <button className="btn btn-primary">
              + Record First Brew
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}