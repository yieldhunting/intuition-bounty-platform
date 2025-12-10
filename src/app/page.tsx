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

    // Load data from localStorage on mount
    useEffect(() => {
      try {
        const savedBounties = localStorage.getItem('intuition-bounties')
        const savedSubmissions = localStorage.getItem('intuition-submissions')
        
        if (savedBounties) {
          const parsedBounties = JSON.parse(savedBounties)
          setBounties(parsedBounties)
          console.log('📋 Loaded bounties from localStorage:', parsedBounties.length)
        }
        
        if (savedSubmissions) {
          const parsedSubmissions = JSON.parse(savedSubmissions)
          // Convert BigInt strings back to BigInt
          const submissionsWithBigInt = parsedSubmissions.map((sub: any) => ({
            ...sub,
            forStake: BigInt(sub.forStake || 0),
            againstStake: BigInt(sub.againstStake || 0)
          }))
          setSubmissions(submissionsWithBigInt)
          console.log('📝 Loaded submissions from localStorage:', submissionsWithBigInt.length)
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      }
      setIsHydrated(true)
    }, [])

    // Save bounties to localStorage whenever they change
    useEffect(() => {
      if (isHydrated) {
        localStorage.setItem('intuition-bounties', JSON.stringify(bounties))
        console.log('💾 Saved bounties to localStorage:', bounties.length)
      }
    }, [bounties, isHydrated])

    // Save submissions to localStorage whenever they change
    useEffect(() => {
      if (isHydrated) {
        // Convert BigInt to strings for JSON serialization
        const submissionsForStorage = submissions.map(sub => ({
          ...sub,
          forStake: sub.forStake.toString(),
          againstStake: sub.againstStake.toString()
        }))
        localStorage.setItem('intuition-submissions', JSON.stringify(submissionsForStorage))
        console.log('💾 Saved submissions to localStorage:', submissions.length)
      }
    }, [submissions, isHydrated])

    // Handler for adding a new bounty
    const handleBountyCreated = (bounty: Bounty) => {
      setBounties(prev => [bounty, ...prev])
    }

    // Handler for adding a new submission
    const handleSubmissionCreated = (submission: Omit<Submission, 'bountyTitle'>, bountyId: string) => {
      console.log('🔍 Adding submission for bountyId:', bountyId)
      console.log('📋 Available bounties:', bounties.map(b => ({ id: b.id, title: b.title })))
      
      // Find bounty from either local state or create fallback title
      const bounty = bounties.find(b => b.id === bountyId)
      const bountyTitle = bounty?.title || `Bounty ${bountyId?.slice(0, 8) || 'Unknown'}...`
      
      const submissionWithBountyTitle: Submission = {
        ...submission,
        bountyTitle,
        forStake: BigInt(0),
        againstStake: BigInt(0),
        status: SubmissionStatus.STAKING_PERIOD
      }
      
      console.log('✅ Created submission with title:', bountyTitle)
      setSubmissions(prev => [submissionWithBountyTitle, ...prev])
    }

    // Handler for updating submission stakes
    const handleStakeUpdate = (submissionId: string, newForStake: bigint, newAgainstStake: bigint) => {
      setSubmissions(prev => 
        prev.map(submission => 
          submission.id === submissionId 
            ? { ...submission, forStake: newForStake, againstStake: newAgainstStake }
            : submission
        )
      )
    }

    // Debug function to clear localStorage (only for development)
    const clearLocalStorage = () => {
      localStorage.removeItem('intuition-bounties')
      localStorage.removeItem('intuition-submissions')
      setBounties([])
      setSubmissions([])
      console.log('🗑️ Cleared all localStorage data')
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
          </h1>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          {/* Debug clear storage button (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center mb-4">
              <button
                onClick={clearLocalStorage}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                🗑️ Clear Storage (Dev Only)
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
