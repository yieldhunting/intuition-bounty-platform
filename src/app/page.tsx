'use client'

  import { useState } from 'react'
  import { ConnectButton } from '@rainbow-me/rainbowkit'
  import { useAccount } from 'wagmi'
  import { BountyDiscovery } from '@/components/BountyDiscovery'
  import { CreateBounty } from '@/components/CreateBounty'
  import { CommunityStaking } from '@/components/CommunityStaking'
  import { ArbitratorDashboard } from '@/components/ArbitratorDashboard'
  import { AutomatedResolution } from '@/components/AutomatedResolution'
  import { ReputationSystem } from '@/components/ReputationSystem'

  export default function Home() {
    const [activeTab, setActiveTab] = useState('discover')
    const { address } = useAccount()

    // Mock data for community staking component (stateful)
    const [mockSubmissions, setMockSubmissions] = useState([
      {
        id: 'sub_001',
        bountyId: 'bounty_001',
        submitterAddress: '0x1234567890123456789012345678901234567890',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0xabc123...',
        submittedAt: new Date().toISOString(),
        forStake: BigInt('75000000000000000000'), // 75 tTRUST
        againstStake: BigInt('25000000000000000000'), // 25 tTRUST
        status: 'staking_period' as const,
        isLocal: false
      },
      {
        id: 'sub_002', 
        bountyId: 'bounty_002',
        submitterAddress: '0x9876543210987654321098765432109876543210',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0xdef456...',
        submittedAt: new Date().toISOString(),
        forStake: BigInt('40000000000000000000'), // 40 tTRUST
        againstStake: BigInt('60000000000000000000'), // 60 tTRUST
        status: 'staking_period' as const,
        isLocal: true
      }
    ])

    // Handler for updating submission stakes
    const handleStakeUpdate = (submissionId: string, newForStake: bigint, newAgainstStake: bigint) => {
      setMockSubmissions(prev => 
        prev.map(submission => 
          submission.id === submissionId 
            ? { ...submission, forStake: newForStake, againstStake: newAgainstStake }
            : submission
        )
      )
    }

    // Determine if user has admin/arbitrator privileges (mock logic)
    const isArbitrator = address && (
      address.toLowerCase().includes('1111') || 
      address.toLowerCase().includes('2222') ||
      Math.random() > 0.7 // Random for demo
    )
    const isSystemAdmin = address && address.toLowerCase().includes('0000')

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
            {activeTab === 'discover' && <BountyDiscovery />}
            {activeTab === 'create' && <CreateBounty />}
            {activeTab === 'community' && (
              <CommunityStaking 
                bountyId="demo_bounty_001"
                bountyTitle="Climate Data Analysis"
                submissions={mockSubmissions}
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
