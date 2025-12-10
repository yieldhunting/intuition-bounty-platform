'use client'

import { useState, useEffect } from 'react'
import { CyberNav } from '@/components/CyberNav'
import { CommunityStaking } from '@/components/CommunityStaking'
import { globalDataManager, GlobalSubmission, GlobalBounty } from '@/lib/globalData'

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

interface Submission {
  id: string
  bountyId: string
  bountyTitle: string
  submitterAddress: string
  portalUrl: string
  submittedAt: string
  forStake: bigint
  againstStake: bigint
  status: any
  isLocal?: boolean
}

export default function ValidatePage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load global data
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const globalData = await globalDataManager.fetchGlobalData()
        
        setBounties(globalData.bounties)
        
        // Convert global submissions with BigInt
        const submissionsWithBigInt = globalData.submissions.map((sub: GlobalSubmission) => ({
          ...sub,
          forStake: BigInt(sub.forStake || '0'),
          againstStake: BigInt(sub.againstStake || '0')
        }))
        
        // Apply stake updates
        const updatedSubmissions = submissionsWithBigInt.map(sub => {
          const stakeUpdate = globalData.stakes[sub.id]
          if (stakeUpdate) {
            return {
              ...sub,
              forStake: BigInt(stakeUpdate.forStake),
              againstStake: BigInt(stakeUpdate.againstStake)
            }
          }
          return sub
        })
        
        setSubmissions(updatedSubmissions)
      } catch (error) {
        console.error('Error loading global data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadGlobalData()
  }, [])

  // Handler for stake updates
  const handleStakeUpdate = async (submissionId: string, newForStake: bigint, newAgainstStake: bigint) => {
    // Update local state
    setSubmissions(prev => 
      prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, forStake: newForStake, againstStake: newAgainstStake }
          : submission
      )
    )
    
    // Save to global storage
    try {
      await globalDataManager.updateStake(
        submissionId, 
        newForStake.toString(), 
        newAgainstStake.toString()
      )
    } catch (error) {
      console.error('Error updating stake in global storage:', error)
    }
  }

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold neon-text-pink cyber-glow font-orbitron mb-2">
                  VALIDATE SUBMISSIONS
                </h1>
                <p className="text-pink-300 text-lg">
                  Stake on submission quality and earn validation rewards
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl neon-text-pink mb-2">⬡</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Validation Engine
                </div>
              </div>
            </div>
          </div>

          {/* Validation Instructions */}
          <div className="cyber-card p-6 mb-8">
            <h2 className="text-xl font-semibold neon-text-pink mb-4">VALIDATION PROTOCOL</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="text-pink-300 font-semibold mb-3">STAKE FOR</h3>
                <p className="text-gray-300 mb-2">
                  Vote in favor of high-quality submissions that meet bounty requirements.
                </p>
                <div className="text-gray-400 text-xs">
                  • Accurate data collection<br/>
                  • Meets specified criteria<br/>
                  • Proper Portal URL format
                </div>
              </div>
              <div>
                <h3 className="text-pink-300 font-semibold mb-3">STAKE AGAINST</h3>
                <p className="text-gray-300 mb-2">
                  Vote against low-quality or incorrect submissions.
                </p>
                <div className="text-gray-400 text-xs">
                  • Incomplete data<br/>
                  • Incorrect format<br/>
                  • Spam or malicious content
                </div>
              </div>
              <div>
                <h3 className="text-pink-300 font-semibold mb-3">REWARDS</h3>
                <p className="text-gray-300 mb-2">
                  Earn TRUST tokens for accurate validation decisions.
                </p>
                <div className="text-gray-400 text-xs">
                  • Majority consensus rewards<br/>
                  • Early validator bonuses<br/>
                  • Reputation score increases
                </div>
              </div>
            </div>
          </div>

          {/* Community Staking Component */}
          {isLoading ? (
            <div className="cyber-card p-12 text-center">
              <div className="text-pink-400 text-6xl mb-4 animate-pulse">⬡</div>
              <div className="text-lg text-gray-300 mb-2">LOADING SUBMISSIONS...</div>
              <div className="text-sm text-gray-500">Scanning validation queue</div>
            </div>
          ) : (
            <CommunityStaking 
              submissions={submissions}
              bounties={bounties}
              onStakeUpdate={handleStakeUpdate}
            />
          )}
        </div>
      </main>
    </div>
  )
}