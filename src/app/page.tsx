'use client'

import Link from 'next/link'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-subtext1">Track your specialty coffee journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-subtext1">Open Bags</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green">0</div>
            <div className="text-sm text-subtext1">Total Brews</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-yellow">-</div>
            <div className="text-sm text-subtext1">Avg Rating</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-mauve">0</div>
            <div className="text-sm text-subtext1">This Week</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <AddBagFromPhoto />
              <Link href="/brews" className="btn btn-secondary w-full inline-flex items-center justify-center">
                + New Brew
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Open Bags</h2>
            <div className="text-center py-8">
              <p className="text-subtext1">No open bags yet</p>
              <p className="text-sm text-subtext0 mt-2">
                Take a photo of your first coffee bag to get started
              </p>
            </div>
          </div>
        </div>

        {/* Recent Brews */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Brews</h2>
          <div className="text-center py-8">
            <p className="text-subtext1">No brews yet</p>
            <p className="text-sm text-subtext0 mt-2">
              Start brewing and tracking your sessions
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}