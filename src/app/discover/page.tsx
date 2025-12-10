'use client'

import { useState, useEffect } from 'react'
import { CyberNav } from '@/components/CyberNav'
import { BountyDiscovery } from '@/components/BountyDiscovery'
import { globalDataManager, GlobalSubmission, GlobalBounty } from '@/lib/globalData'
import { SubmissionStatus } from '@/lib/escrow'

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

export default function DiscoverPage() {
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

  // Handler for adding new submissions
  const handleSubmissionCreated = async (submission: Omit<Submission, 'bountyTitle'>, bountyId: string) => {
    const bounty = bounties.find(b => b.id === bountyId)
    const bountyTitle = bounty?.title || 'Data Collection Bounty'
    
    const submissionWithBountyTitle: Submission = {
      ...submission,
      bountyTitle,
      forStake: BigInt(0),
      againstStake: BigInt(0),
      status: SubmissionStatus.STAKING_PERIOD
    }
    
    // Update local state
    setSubmissions(prev => [submissionWithBountyTitle, ...prev])
    
    // Save to global storage
    try {
      const globalSubmission: GlobalSubmission = {
        ...submissionWithBountyTitle,
        forStake: '0',
        againstStake: '0'
      }
      await globalDataManager.addSubmission(globalSubmission)
    } catch (error) {
      console.error('Error saving submission to global storage:', error)
    }
  }

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold neon-text-cyan cyber-glow font-orbitron mb-2">
                  DISCOVER BOUNTIES
                </h1>
                <p className="text-cyan-300 text-lg">
                  Explore active data bounties from the Intuition Protocol network
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl neon-text-cyan mb-2">◎</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Discovery Matrix
                </div>
              </div>
            </div>
          </div>

          {/* Bounty Discovery Component */}
          {isLoading ? (
            <div className="cyber-card p-12 text-center">
              <div className="text-cyan-400 text-6xl mb-4 animate-pulse">◉</div>
              <div className="text-lg text-gray-300 mb-2">SCANNING NETWORK...</div>
              <div className="text-sm text-gray-500">Loading bounty matrix from global nodes</div>
            </div>
          ) : (
            <BountyDiscovery 
              bounties={bounties}
              submissions={submissions}
              onSubmissionCreated={handleSubmissionCreated}
            />
          )}
        </div>
      </main>
    </div>
  )
}