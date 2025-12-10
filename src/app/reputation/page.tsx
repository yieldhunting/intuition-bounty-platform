'use client'

import { CyberNav } from '@/components/CyberNav'
import { ReputationSystem } from '@/components/ReputationSystem'
import { useAccount } from 'wagmi'

export default function ReputationPage() {
  const { address } = useAccount()

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold neon-text-cyan cyber-glow font-mono mb-2">
                  REPUTATION MATRIX
                </h1>
                <p className="text-cyan-300 text-lg">
                  Track validation accuracy and network contribution scores
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl neon-text-cyan mb-2">◆</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Trust Score System
                </div>
              </div>
            </div>
          </div>

          {/* Reputation Info */}
          <div className="cyber-card p-6 mb-8">
            <h2 className="text-xl font-semibold neon-text-cyan mb-4">REPUTATION SCORING</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="text-cyan-300 font-semibold mb-3">VALIDATION ACCURACY</h3>
                <p className="text-gray-300 mb-2">
                  Score based on correct validation decisions over time.
                </p>
                <div className="text-gray-400 text-xs">
                  • Consensus alignment<br/>
                  • Early validation bonuses<br/>
                  • Dispute resolution wins
                </div>
              </div>
              <div>
                <h3 className="text-cyan-300 font-semibold mb-3">NETWORK CONTRIBUTION</h3>
                <p className="text-gray-300 mb-2">
                  Contribution to network growth and data quality.
                </p>
                <div className="text-gray-400 text-xs">
                  • Bounty creation impact<br/>
                  • Quality submission history<br/>
                  • Community engagement
                </div>
              </div>
              <div>
                <h3 className="text-cyan-300 font-semibold mb-3">TRUST LEVEL</h3>
                <p className="text-gray-300 mb-2">
                  Overall trust and reliability rating in the network.
                </p>
                <div className="text-gray-400 text-xs">
                  • Stake delegation weight<br/>
                  • Arbitration eligibility<br/>
                  • Governance voting power
                </div>
              </div>
            </div>
          </div>

          {/* Reputation System */}
          <ReputationSystem 
            userAddress={address}
            viewMode="profile"
          />
        </div>
      </main>
    </div>
  )
}