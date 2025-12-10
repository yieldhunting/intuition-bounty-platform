'use client'

import { useState } from 'react'
import { CyberNav } from '@/components/CyberNav'
import { CreateBounty } from '@/components/CreateBounty'
import { globalDataManager, GlobalBounty } from '@/lib/globalData'

interface Bounty {
  id: string
  title: string
  description: string
  reward: number
  deadline: string
  category: string
  creator: string
  creatorAddress: string
  submissions: number
  totalStake: number
  atomId: string
  transactionHash: string
  createdAt: string
  bountyType?: 'data' | 'reputation'
  targetAtom?: string
  expertiseRequired?: string
  reputationCriteria?: string
}

export default function CreatePage() {
  const [isCreating, setIsCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Handler for bounty creation
  const handleBountyCreated = async (bounty: Bounty) => {
    setIsCreating(true)
    
    try {
      // Save to global storage
      await globalDataManager.addBounty(bounty as GlobalBounty)
      setSuccessMessage(`Bounty "${bounty.title}" deployed to the network successfully!`)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error saving bounty to global storage:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold neon-text-green cyber-glow font-orbitron mb-2">
                  CREATE BOUNTY
                </h1>
                <p className="text-green-300 text-lg">
                  Deploy new data bounties to the Intuition Protocol network
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl neon-text-green mb-2">⬢</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Bounty Factory
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="cyber-card border-green-400 bg-green-400/10 p-6 mb-8">
              <div className="flex items-center">
                <div className="text-green-400 text-2xl mr-4">✓</div>
                <div>
                  <div className="text-green-300 font-semibold mb-1">DEPLOYMENT SUCCESSFUL</div>
                  <div className="text-gray-300 text-sm">{successMessage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="cyber-card p-6 mb-8">
            <h2 className="text-xl font-semibold neon-text-green mb-4">BOUNTY DEPLOYMENT PROTOCOL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="text-green-300 font-semibold mb-3">DATA BOUNTIES</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Define clear data collection objectives</li>
                  <li>• Set appropriate TRUST token rewards</li>
                  <li>• Specify quality criteria and deadlines</li>
                  <li>• Target specific Portal URL structures</li>
                </ul>
              </div>
              <div>
                <h3 className="text-green-300 font-semibold mb-3">REPUTATION BOUNTIES</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Target specific atoms for analysis</li>
                  <li>• Define required expertise levels</li>
                  <li>• Set reputation analysis criteria</li>
                  <li>• Enable community validation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Create Bounty Component */}
          <div className={isCreating ? 'opacity-50 pointer-events-none' : ''}>
            <CreateBounty onBountyCreated={handleBountyCreated} />
          </div>

          {/* Creating Overlay */}
          {isCreating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="cyber-card p-8 text-center">
                <div className="text-green-400 text-6xl mb-4 animate-pulse">⬢</div>
                <div className="text-lg text-green-300 mb-2">DEPLOYING TO NETWORK...</div>
                <div className="text-sm text-gray-400">Broadcasting bounty to global nodes</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}