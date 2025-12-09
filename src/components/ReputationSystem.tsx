'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface ReputationScore {
  address: string
  displayName?: string
  totalScore: number
  solverScore: number
  arbitratorScore: number
  stakingScore: number
  level: 'novice' | 'intermediate' | 'expert' | 'master'
  badges: RepuationBadge[]
  history: ReputationEvent[]
}

interface RepuationBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

interface ReputationEvent {
  id: string
  type: 'solution_approved' | 'solution_rejected' | 'arbitration_accurate' | 'arbitration_overturned' | 'stake_accurate' | 'stake_inaccurate'
  description: string
  scoreChange: number
  timestamp: Date
  relatedBountyId?: string
  relatedSubmissionId?: string
}

interface SolverStats {
  totalSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  averageQuality: number
  totalEarnings: number
  bountyCategories: string[]
}

interface ArbitratorStats {
  totalCases: number
  accurateDecisions: number
  overturnedDecisions: number
  averageResponseTime: number
  totalFees: number
  specialties: string[]
}

interface StakingStats {
  totalStakes: number
  accurateStakes: number
  inaccurateStakes: number
  totalStaked: number
  netReturns: number
}

interface ReputationSystemProps {
  userAddress?: string
  viewMode?: 'profile' | 'leaderboard'
}

export function ReputationSystem({ userAddress, viewMode = 'profile' }: ReputationSystemProps) {
  const { address, isConnected } = useAccount()
  const [userReputation, setUserReputation] = useState<ReputationScore | null>(null)
  const [leaderboard, setLeaderboard] = useState<ReputationScore[]>([])
  const [solverStats, setSolverStats] = useState<SolverStats | null>(null)
  const [arbitratorStats, setArbitratorStats] = useState<ArbitratorStats | null>(null)
  const [stakingStats, setStakingStats] = useState<StakingStats | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'solver' | 'arbitrator' | 'staking'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  const targetAddress = userAddress || address

  useEffect(() => {
    if (targetAddress) {
      loadUserReputation(targetAddress)
    }
    if (viewMode === 'leaderboard') {
      loadLeaderboard()
    }
  }, [targetAddress, viewMode])

  const loadUserReputation = async (addr: string) => {
    setIsLoading(true)
    
    // Mock data - in real app, fetch from API
    const mockReputation: ReputationScore = {
      address: addr,
      displayName: addr === address ? 'You' : undefined,
      totalScore: 2847,
      solverScore: 1200,
      arbitratorScore: 850,
      stakingScore: 797,
      level: 'expert',
      badges: [
        {
          id: 'first_solution',
          name: 'First Solution',
          description: 'Submitted your first approved solution',
          icon: '🎯',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          rarity: 'common'
        },
        {
          id: 'data_specialist',
          name: 'Data Specialist',
          description: '10+ approved solutions in data analysis',
          icon: '📊',
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          rarity: 'uncommon'
        },
        {
          id: 'fair_arbitrator',
          name: 'Fair Arbitrator',
          description: '95%+ accuracy in arbitration decisions',
          icon: '⚖️',
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          rarity: 'rare'
        },
        {
          id: 'community_leader',
          name: 'Community Leader',
          description: 'Top 1% reputation in the ecosystem',
          icon: '👑',
          earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          rarity: 'legendary'
        }
      ],
      history: [
        {
          id: 'evt_001',
          type: 'solution_approved',
          description: 'Solution approved for "Climate Data Analysis"',
          scoreChange: +150,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          relatedBountyId: 'bounty_001',
          relatedSubmissionId: 'sub_001'
        },
        {
          id: 'evt_002',
          type: 'arbitration_accurate',
          description: 'Arbitration decision upheld by community',
          scoreChange: +75,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'evt_003',
          type: 'stake_accurate',
          description: 'Accurate FOR stake on approved solution',
          scoreChange: +25,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    }

    const mockSolverStats: SolverStats = {
      totalSubmissions: 28,
      approvedSubmissions: 23,
      rejectedSubmissions: 5,
      averageQuality: 4.6,
      totalEarnings: 2850,
      bountyCategories: ['Data Analysis', 'Research', 'Cleaning']
    }

    const mockArbitratorStats: ArbitratorStats = {
      totalCases: 15,
      accurateDecisions: 14,
      overturnedDecisions: 1,
      averageResponseTime: 4.2,
      totalFees: 185,
      specialties: ['Data Quality', 'Format Compliance']
    }

    const mockStakingStats: StakingStats = {
      totalStakes: 156,
      accurateStakes: 132,
      inaccurateStakes: 24,
      totalStaked: 1240,
      netReturns: 287
    }

    setUserReputation(mockReputation)
    setSolverStats(mockSolverStats)
    setArbitratorStats(mockArbitratorStats)
    setStakingStats(mockStakingStats)
    setIsLoading(false)
  }

  const loadLeaderboard = async () => {
    // Mock leaderboard data
    const mockLeaderboard: ReputationScore[] = [
      {
        address: '0x1111111111111111111111111111111111111111',
        displayName: 'DataMaster',
        totalScore: 5420,
        solverScore: 3200,
        arbitratorScore: 1500,
        stakingScore: 720,
        level: 'master' as const,
        badges: [],
        history: []
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        displayName: 'QualityCheck',
        totalScore: 4890,
        solverScore: 2100,
        arbitratorScore: 2200,
        stakingScore: 590,
        level: 'master' as const,
        badges: [],
        history: []
      },
      {
        address: targetAddress || '',
        displayName: 'You',
        totalScore: 2847,
        solverScore: 1200,
        arbitratorScore: 850,
        stakingScore: 797,
        level: 'expert' as const,
        badges: [],
        history: []
      }
    ].filter(entry => entry.address)

    setLeaderboard(mockLeaderboard.sort((a, b) => b.totalScore - a.totalScore))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'master': return 'text-purple-400'
      case 'expert': return 'text-blue-400'
      case 'intermediate': return 'text-green-400'
      case 'novice': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'master': return '👑'
      case 'expert': return '🎖️'
      case 'intermediate': return '🏆'
      case 'novice': return '🌟'
      default: return '❓'
    }
  }

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400 bg-purple-900 border-purple-600'
      case 'rare': return 'text-blue-400 bg-blue-900 border-blue-600'
      case 'uncommon': return 'text-green-400 bg-green-900 border-green-600'
      case 'common': return 'text-gray-400 bg-gray-700 border-gray-600'
      default: return 'text-gray-400 bg-gray-700 border-gray-600'
    }
  }

  const getScoreChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  if (!isConnected && !userAddress) {
    return (
      <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300">Connect your wallet to view reputation system!</p>
      </div>
    )
  }

  if (viewMode === 'leaderboard') {
    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-6">🏆 Reputation Leaderboard</h3>
        
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div key={user.address} className={`p-4 border rounded-lg ${
              user.address === targetAddress 
                ? 'bg-blue-900 border-blue-600' 
                : 'bg-gray-700 border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {user.displayName || `${user.address.slice(0, 8)}...`}
                      </span>
                      <span className={`text-sm ${getLevelColor(user.level)}`}>
                        {getLevelIcon(user.level)} {user.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Solver: {user.solverScore} • Arbitrator: {user.arbitratorScore} • Staking: {user.stakingScore}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {user.totalScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading || !userReputation) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading reputation data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-white">👤 Reputation Profile</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userReputation.level)}`}>
            {getLevelIcon(userReputation.level)} {userReputation.level.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">
            {userReputation.totalScore.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Score</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-900 border border-green-600 rounded">
          <div className="text-green-400 text-lg font-bold">{userReputation.solverScore}</div>
          <div className="text-green-300 text-sm">Solver Score</div>
        </div>
        <div className="text-center p-3 bg-purple-900 border border-purple-600 rounded">
          <div className="text-purple-400 text-lg font-bold">{userReputation.arbitratorScore}</div>
          <div className="text-purple-300 text-sm">Arbitrator Score</div>
        </div>
        <div className="text-center p-3 bg-blue-900 border border-blue-600 rounded">
          <div className="text-blue-400 text-lg font-bold">{userReputation.stakingScore}</div>
          <div className="text-blue-300 text-sm">Staking Score</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">🏅 Badges & Achievements</h4>
        <div className="flex flex-wrap gap-2">
          {userReputation.badges.map((badge) => (
            <div
              key={badge.id}
              className={`px-3 py-2 border rounded-lg text-sm ${getBadgeRarityColor(badge.rarity)}`}
              title={badge.description}
            >
              <span className="mr-2">{badge.icon}</span>
              {badge.name}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-600">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'solver', label: '🎯 Solver' },
          { key: 'arbitrator', label: '⚖️ Arbitrator' },
          { key: 'staking', label: '💎 Staking' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === tab.key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <h5 className="text-white font-medium">Recent Activity</h5>
          {userReputation.history.slice(0, 5).map((event) => (
            <div key={event.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <div>
                <p className="text-gray-300 text-sm">{event.description}</p>
                <p className="text-xs text-gray-500">{event.timestamp.toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${getScoreChangeColor(event.scoreChange)}`}>
                {event.scoreChange >= 0 ? '+' : ''}{event.scoreChange}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'solver' && solverStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-white font-medium mb-3">Solution Statistics</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Submissions:</span>
                <span className="text-white">{solverStats.totalSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Approved:</span>
                <span className="text-green-400">{solverStats.approvedSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rejected:</span>
                <span className="text-red-400">{solverStats.rejectedSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-blue-400">
                  {((solverStats.approvedSubmissions / solverStats.totalSubmissions) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Earnings:</span>
                <span className="text-green-400">{solverStats.totalEarnings} tTRUST</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Specialties</h5>
            <div className="flex flex-wrap gap-2">
              {solverStats.bountyCategories.map((category) => (
                <span key={category} className="px-2 py-1 bg-blue-900 text-blue-300 text-sm rounded">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'arbitrator' && arbitratorStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-white font-medium mb-3">Arbitration Statistics</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cases:</span>
                <span className="text-white">{arbitratorStats.totalCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accurate Decisions:</span>
                <span className="text-green-400">{arbitratorStats.accurateDecisions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overturned:</span>
                <span className="text-red-400">{arbitratorStats.overturnedDecisions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy Rate:</span>
                <span className="text-blue-400">
                  {((arbitratorStats.accurateDecisions / arbitratorStats.totalCases) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Fees:</span>
                <span className="text-green-400">{arbitratorStats.totalFees} tTRUST</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-white font-medium mb-3">Specialties</h5>
            <div className="flex flex-wrap gap-2">
              {arbitratorStats.specialties.map((specialty) => (
                <span key={specialty} className="px-2 py-1 bg-purple-900 text-purple-300 text-sm rounded">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'staking' && stakingStats && (
        <div>
          <h5 className="text-white font-medium mb-3">Staking Performance</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Stakes:</span>
                <span className="text-white">{stakingStats.totalStakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accurate Stakes:</span>
                <span className="text-green-400">{stakingStats.accurateStakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inaccurate Stakes:</span>
                <span className="text-red-400">{stakingStats.inaccurateStakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy Rate:</span>
                <span className="text-blue-400">
                  {((stakingStats.accurateStakes / stakingStats.totalStakes) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Staked:</span>
                <span className="text-white">{stakingStats.totalStaked} tTRUST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net Returns:</span>
                <span className={stakingStats.netReturns >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {stakingStats.netReturns >= 0 ? '+' : ''}{stakingStats.netReturns} tTRUST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROI:</span>
                <span className={stakingStats.netReturns >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {((stakingStats.netReturns / stakingStats.totalStaked) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}