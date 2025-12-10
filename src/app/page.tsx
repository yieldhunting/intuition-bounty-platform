'use client'

  import { useState, useEffect } from 'react'
  import { ConnectButton } from '@rainbow-me/rainbowkit'
  import { useAccount } from 'wagmi'
  import { BountyDiscovery } from '@/components/BountyDiscovery'
  import { CreateBounty } from '@/components/CreateBounty'
  import { CommunityStaking } from '@/components/CommunityStaking'
  import { SubmissionStatus } from '@/lib/escrow'
  import { ArbitratorDashboard } from '@/components/ArbitratorDashboard'
  import { AutomatedResolution } from '@/components/AutomatedResolution'
  import { ReputationSystem } from '@/components/ReputationSystem'
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
    bountyTitle: string // Add bounty title for display
    submitterAddress: string
    portalUrl: string
    submittedAt: string
    forStake: bigint
    againstStake: bigint
    status: SubmissionStatus
    isLocal?: boolean
  }

  export default function Home() {
    const [activeTab, setActiveTab] = useState('discover')
    const { address } = useAccount()

    // Real state management for bounties and submissions with localStorage persistence
    const [bounties, setBounties] = useState<Bounty[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [isHydrated, setIsHydrated] = useState(false)

    // Load data from global storage on mount
    useEffect(() => {
      const loadGlobalData = async () => {
        try {
          const globalData = await globalDataManager.fetchGlobalData()
          
          // Convert global bounties to local format
          setBounties(globalData.bounties)
          console.log('📋 Loaded bounties from global storage:', globalData.bounties.length)
          
          // Convert global submissions to local format with BigInt conversion
          const submissionsWithBigInt = globalData.submissions.map((sub: GlobalSubmission) => ({
            ...sub,
            forStake: BigInt(sub.forStake || '0'),
            againstStake: BigInt(sub.againstStake || '0')
          }))
          
          // Apply any stake updates from global stakes
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
          console.log('📝 Loaded submissions from global storage:', updatedSubmissions.length)
          
        } catch (error) {
          console.error('Error loading from global storage:', error)
        }
        setIsHydrated(true)
      }
      
      loadGlobalData()
    }, [])

    // Note: Global storage is handled by individual actions (adding bounties/submissions/stakes)
    // No need for automatic saving since each action immediately updates global state

    // Handler for adding a new bounty
    const handleBountyCreated = async (bounty: Bounty) => {
      // Update local state immediately
      setBounties(prev => [bounty, ...prev])
      
      // Save to global storage
      try {
        await globalDataManager.addBounty(bounty as GlobalBounty)
        console.log('💾 Saved bounty to global storage:', bounty.title)
      } catch (error) {
        console.error('Error saving bounty to global storage:', error)
      }
    }

    // Handler for adding a new submission
    const handleSubmissionCreated = async (submission: Omit<Submission, 'bountyTitle'>, bountyId: string) => {
      console.log('🔍 Adding submission for bountyId:', bountyId)
      console.log('📋 Available bounties:', bounties.map(b => ({ id: b.id, title: b.title })))
      
      // Find bounty from either local state or create fallback title
      const bounty = bounties.find(b => b.id === bountyId)
      const bountyTitle = bounty?.title || 'Data Collection Bounty'
      
      const submissionWithBountyTitle: Submission = {
        ...submission,
        bountyTitle,
        forStake: BigInt(0),
        againstStake: BigInt(0),
        status: SubmissionStatus.STAKING_PERIOD
      }
      
      // Update local state immediately
      console.log('✅ Created submission with title:', bountyTitle)
      setSubmissions(prev => [submissionWithBountyTitle, ...prev])
      
      // Save to global storage
      try {
        const globalSubmission: GlobalSubmission = {
          ...submissionWithBountyTitle,
          forStake: '0',
          againstStake: '0'
        }
        await globalDataManager.addSubmission(globalSubmission)
        console.log('💾 Saved submission to global storage:', submissionWithBountyTitle.id)
      } catch (error) {
        console.error('Error saving submission to global storage:', error)
      }
    }

    // Handler for updating submission stakes
    const handleStakeUpdate = async (submissionId: string, newForStake: bigint, newAgainstStake: bigint) => {
      // Update local state immediately
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
        console.log('💾 Updated stake in global storage:', submissionId)
      } catch (error) {
        console.error('Error updating stake in global storage:', error)
      }
    }

    // Debug function to clear global storage (only for development)
    const clearGlobalStorage = async () => {
      try {
        await globalDataManager.resetData()
        setBounties([])
        setSubmissions([])
        console.log('🗑️ Cleared all global storage data')
      } catch (error) {
        console.error('Error clearing global storage:', error)
      }
    }

    // Determine if user has admin/arbitrator privileges (mock logic)
    const isArbitrator = address && (
      address.toLowerCase().includes('1111') || 
      address.toLowerCase().includes('2222') ||
      Math.random() > 0.7 // Random for demo
    )
    const isSystemAdmin = address && address.toLowerCase().includes('0000')

    // Don't render until hydrated to avoid SSR issues
    if (!isHydrated) {
      return (
        <main className="min-h-screen bg-black text-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading...</p>
            </div>
          </div>
        </main>
      )
    }

    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            Intuition Bounty Board
            <span className="ml-4 text-sm bg-green-600 px-2 py-1 rounded">UPDATED ✨</span>
          </h1>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          {/* Debug clear storage button (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center mb-4">
              <button
                onClick={clearGlobalStorage}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                🗑️ Clear Global Storage (Dev Only)
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Bounties: {bounties.length} | Submissions: {submissions.length}
              </p>
            </div>
          )}

          {/* About Section */}
          <div className="mb-12">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                About This Bounty Board
              </h2>
              <p className="text-gray-300 mb-4">
                A decentralized marketplace for data bounties, built natively on the Intuition Protocol.
                All bounties are atoms, all relationships are triples, and all settlements are in TRUST.
              </p>
              <p className="text-sm text-gray-400">
                Every interaction contributes to the global Intuition knowledge graph and generates protocol utilization.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 border border-gray-700 p-1 rounded-lg flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'discover'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🔍 Discover
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'create'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                ✨ Create
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'community'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏛️ Validate
              </button>
              <button
                onClick={() => setActiveTab('arbitrate')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'arbitrate'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                ⚖️ Arbitrate
              </button>
              <button
                onClick={() => setActiveTab('reputation')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'reputation'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏆 Reputation
              </button>
              {isSystemAdmin && (
                <button
                  onClick={() => setActiveTab('system')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    activeTab === 'system'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  🤖 System
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'discover' && (
              <BountyDiscovery 
                bounties={bounties}
                submissions={submissions}
                onSubmissionCreated={handleSubmissionCreated}
              />
            )}
            {activeTab === 'create' && (
              <CreateBounty 
                onBountyCreated={handleBountyCreated}
              />
            )}
            {activeTab === 'community' && (
              <CommunityStaking 
                submissions={submissions}
                bounties={bounties}
                onStakeUpdate={handleStakeUpdate}
              />
            )}
            {activeTab === 'arbitrate' && (
              <ArbitratorDashboard 
                userAddress={address}
                isArbitrator={isArbitrator}
              />
            )}
            {activeTab === 'reputation' && (
              <ReputationSystem 
                userAddress={address}
                viewMode="profile"
              />
            )}
            {activeTab === 'system' && isSystemAdmin && (
              <AutomatedResolution 
                isSystemAdmin={isSystemAdmin}
              />
            )}
          </div>
        </div>
      </main>
    )
  }
