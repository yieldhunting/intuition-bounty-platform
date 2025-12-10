'use client'

import { CyberNav } from '@/components/CyberNav'
import { ArbitratorDashboard } from '@/components/ArbitratorDashboard'
import { useAccount } from 'wagmi'

export default function ArbitratePage() {
  const { address } = useAccount()
  
  // Mock arbitrator logic
  const isArbitrator = address && (
    address.toLowerCase().includes('1111') || 
    address.toLowerCase().includes('2222') ||
    Math.random() > 0.7
  )

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-20 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold neon-text-orange cyber-glow font-mono mb-2">
                  ARBITRATION PANEL
                </h1>
                <p className="text-orange-300 text-lg">
                  Resolve disputed submissions and maintain network integrity
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl neon-text-orange mb-2">⚖</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Dispute Resolution
                </div>
              </div>
            </div>
          </div>

          {/* Arbitration Info */}
          <div className="cyber-card p-6 mb-8">
            <h2 className="text-xl font-semibold neon-text-orange mb-4">ARBITRATION PROTOCOL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="text-orange-300 font-semibold mb-3">DISPUTE TRIGGERS</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Stake ratios within disputed range</li>
                  <li>• Community flagged submissions</li>
                  <li>• Conflicting validation decisions</li>
                  <li>• Technical compliance issues</li>
                </ul>
              </div>
              <div>
                <h3 className="text-orange-300 font-semibold mb-3">ARBITRATOR POWERS</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Final validation decisions</li>
                  <li>• Stake redistribution</li>
                  <li>• Reputation adjustments</li>
                  <li>• Network governance votes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Arbitrator Dashboard */}
          <ArbitratorDashboard 
            userAddress={address}
            isArbitrator={isArbitrator}
          />
        </div>
      </main>
    </div>
  )
}