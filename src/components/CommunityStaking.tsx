'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { StakingManager, StakePosition, ESCROW_CONSTANTS, SubmissionStatus } from '@/lib/escrow'

interface Submission {
  id: string
  bountyId: string
  bountyTitle: string // Add bounty title to display
  submitterAddress: string
  portalUrl: string
  submittedAt: string
  forStake: bigint
  againstStake: bigint
  status: SubmissionStatus
  isLocal?: boolean
}

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

interface CommunityStakingProps {
  submissions: Submission[]
  bounties?: Bounty[]  // Add bounties for title resolution
  onStakeUpdate?: (submissionId: string, forStake: bigint, againstStake: bigint) => void
}

export function CommunityStaking({ submissions, bounties = [], onStakeUpdate }: CommunityStakingProps) {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [stakingManager, setStakingManager] = useState<StakingManager | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<string>('')
  const [stakeAmount, setStakeAmount] = useState<string>('1')
  const [stakePosition, setStakePosition] = useState<'for' | 'against'>('for')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [userStakes, setUserStakes] = useState<StakePosition[]>([])

  // Function to check if URL is testnet
  const isTestnetUrl = (url: string): boolean => {
    return url.includes('testnet.portal.intuition.systems') || 
           (!url.includes('portal.intuition.systems') || url.includes('testnet'))
  }

  // Function to resolve bounty title from bounty ID
  const getBountyTitle = (bountyId: string, fallbackTitle?: string): string => {
    console.log(`🔍 RESOLVING TITLE: bountyId="${bountyId}", fallback="${fallbackTitle}"`)
    console.log(`📊 Available bounties:`, bounties.map(b => ({ id: b.id, title: b.title })))
    
    // Handle undefined bountyId
    if (!bountyId || bountyId === 'undefined') {
      if (fallbackTitle && fallbackTitle !== 'Data Collection Bounty') {
        console.log(`📝 UNDEFINED BOUNTY ID - using fallback: "${fallbackTitle}"`)
        return fallbackTitle
      }
      console.log(`⚠️ UNDEFINED BOUNTY ID - using default`)
      return 'Data Collection Bounty'
    }
    
    const bounty = bounties.find(b => b.id === bountyId)
    if (bounty?.title) {
      console.log(`✅ RESOLVED: "${bounty.title}"`)
      return bounty.title
    }
    
    // Smart fallback for common bounty patterns
    if (bountyId.includes('0xdc14ab') || bountyId.includes('dc14ab')) {
      return 'NFT Communities Data'
    }
    if (bountyId.includes('0x0b1c09')) {
      return 'Intuition Use Cases'  
    }
    if (bountyId.includes('0x8403b5')) {
      return '0xbilly Reputation Analysis'
    }
    
    if (fallbackTitle && fallbackTitle !== 'Data Collection Bounty') {
      console.log(`📝 SMART FALLBACK: "${fallbackTitle}"`)
      return fallbackTitle
    }
    
    console.log(`⚠️ NO TITLE FOUND - using shortened bounty ID`)
    return `Bounty ${bountyId.slice(0, 8)}...`
  }

  // Initialize staking manager (for calculating ratios only)
  useEffect(() => {
    if (walletClient && publicClient && chainId) {
      const stakingMgr = new StakingManager(walletClient, publicClient, chainId)
      setStakingManager(stakingMgr)
    }
  }, [walletClient, publicClient, chainId])

  const handleCreateStake = async () => {
    if (!address || !selectedSubmission || !stakingManager) {
      alert('Please select a submission and connect your wallet')
      return
    }

    const amount = parseFloat(stakeAmount)
    if (amount < Number(ESCROW_CONSTANTS.MIN_STAKE_AMOUNT) || amount > Number(ESCROW_CONSTANTS.MAX_STAKE_AMOUNT)) {
      alert(`Stake amount must be between ${ESCROW_CONSTANTS.MIN_STAKE_AMOUNT} and ${ESCROW_CONSTANTS.MAX_STAKE_AMOUNT} tTRUST`)
      return
    }

    setIsLoading(true)
    setResult('')

    try {
      const stakeAmountWei = BigInt(Math.floor(amount * 1e18))
      
      console.log('🔄 Creating REAL stake with StakingManager...')
      
      // Find the selected submission to get its portal URL
      const targetSubmission = submissions.find(s => s.id === selectedSubmission)
      if (!targetSubmission) {
        throw new Error('Selected submission not found')
      }

      console.log(`🔗 Staking on Portal URL: ${targetSubmission.portalUrl}`)

      // Use real staking manager to create stake on the Portal list atom
      const realStake = await stakingManager.createStake({
        stakerId: address,
        submissionId: selectedSubmission,
        portalUrl: targetSubmission.portalUrl, // Pass the portal URL for atom extraction
        amount: stakeAmountWei,
        position: stakePosition
      })

      // Update local stakes with the real stake result
      setUserStakes(prev => [...prev, realStake])

      // Find and update submission stakes visually
      const submission = submissions.find(s => s.id === selectedSubmission)
      if (submission && onStakeUpdate) {
        const newForStake = stakePosition === 'for' 
          ? submission.forStake + stakeAmountWei 
          : submission.forStake
        const newAgainstStake = stakePosition === 'against' 
          ? submission.againstStake + stakeAmountWei 
          : submission.againstStake

        onStakeUpdate(selectedSubmission, newForStake, newAgainstStake)
      }

      setResult(`✅ Stake placed successfully! 🔗 BLOCKCHAIN CONFIRMED
        Position: ${stakePosition.toUpperCase()}
        Amount: ${amount} tTRUST
        Submission: ${selectedSubmission.slice(0, 20)}...
        Atom ID: ${realStake.atomId}
        Portal URL: ${targetSubmission.portalUrl}
        
        Your stake is now active in the validation process.
        
        🚀 This was a REAL blockchain transaction with tTRUST tokens!
        📊 You staked on the Portal list atom to increase its value.`)

      // Reset form
      setStakeAmount('1')
      setSelectedSubmission('')

    } catch (error) {
      console.error('❌ Real staking failed:', error)
      setResult(`❌ Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}
        
        Please check your wallet connection and try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStakeRatio = (forStake: bigint, againstStake: bigint) => {
    if (!stakingManager) return { forRatio: 0, againstRatio: 0, recommendation: 'disputed' as const }
    return stakingManager.calculateStakeRatio(forStake, againstStake)
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'text-green-400'
      case 'reject': return 'text-red-400'
      case 'disputed': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return '✅'
      case 'reject': return '❌'
      case 'disputed': return '⚖️'
      default: return '❓'
    }
  }

  const getUserStakeForSubmission = (submissionId: string) => {
    return userStakes.filter(stake => stake.submissionId === submissionId)
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300">Connect your wallet to participate in solution validation!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">Community Validation</h3>
        <div className="text-sm text-gray-400">
          📊 Validate solutions across all bounties
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-900 border border-blue-600 rounded-lg">
        <h4 className="text-blue-300 font-medium mb-2">🏛️ How Community Validation Works</h4>
        <div className="text-blue-200 text-sm space-y-2">
          <p>• <strong>Stake FOR</strong> solutions you believe are high quality and meet the bounty requirements</p>
          <p>• <strong>Stake AGAINST</strong> solutions that are low quality, incomplete, or incorrect</p>
          <p>• Solutions with {ESCROW_CONSTANTS.APPROVAL_THRESHOLD}%+ FOR stakes are automatically approved</p>
          <p>• Disputed solutions (close ratios) go to arbitration</p>
          <p>• Earn rewards for accurate validation decisions</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No submissions yet for this bounty</p>
          <p className="text-sm text-gray-500">Check back later when solutions are submitted</p>
        </div>
      ) : (
        <>
          {/* Submissions List with Staking */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-medium text-white">Available Submissions</h4>
            
            {(() => {
              const filteredSubmissions = submissions
                .filter(submission => submission && submission.id && submission.portalUrl)
                .filter(submission => {
                  const isTestnet = isTestnetUrl(submission.portalUrl)
                  if (!isTestnet) {
                    console.log(`🚫 Filtering out mainnet URL: ${submission.portalUrl}`)
                  }
                  return isTestnet
                })
              const uniqueSubmissions = filteredSubmissions
                .filter((submission, index, array) => {
                  // Deduplicate by portal URL - keep only the first occurrence
                  return array.findIndex(s => s.portalUrl === submission.portalUrl) === index
                })
              
              console.log(`🔄 CommunityStaking: Filtered to ${filteredSubmissions.length} testnet submissions, deduplicated to ${uniqueSubmissions.length} unique URLs`)
              
              return uniqueSubmissions.map((submission) => {
              const stakeData = calculateStakeRatio(submission.forStake, submission.againstStake)
              const userStakesForSubmission = getUserStakeForSubmission(submission.id)
              const isSubmitter = address === submission.submitterAddress
              
              return (
                <div key={submission.id} className={`p-4 rounded-lg border ${
                  selectedSubmission === submission.id ? 'bg-gray-600 border-blue-500' : 'bg-gray-700 border-gray-600'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-medium text-white">{getBountyTitle(submission.bountyId, submission.bountyTitle)}</span>
                        {isSubmitter && (
                          <span className="text-xs bg-blue-600 text-blue-100 px-2 py-0.5 rounded">
                            Your Solution
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Solution Portal URL:</p>
                      <a
                        href={submission.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                      >
                        {submission.portalUrl}
                      </a>
                      <p className="text-xs text-gray-400 mt-2">
                        Submitted by: {submission.submitterAddress?.slice(0, 10) || 'Unknown'}... • {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? '' : submission.id)}
                      disabled={isSubmitter}
                      className={`ml-3 px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isSubmitter 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : selectedSubmission === submission.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {isSubmitter ? 'Your Solution' : selectedSubmission === submission.id ? 'Selected' : 'Select to Stake'}
                    </button>
                  </div>

                  {/* Staking Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 bg-green-900 border border-green-600 rounded">
                      <div className="text-green-400 text-sm font-medium">FOR Stakes</div>
                      <div className="text-green-300 text-lg font-bold">
                        {(Number(submission.forStake) / 1e18).toFixed(2)}
                      </div>
                      <div className="text-green-400 text-xs">{stakeData.forRatio.toFixed(1)}%</div>
                    </div>

                    <div className="text-center p-2 bg-red-900 border border-red-600 rounded">
                      <div className="text-red-400 text-sm font-medium">AGAINST Stakes</div>
                      <div className="text-red-300 text-lg font-bold">
                        {(Number(submission.againstStake) / 1e18).toFixed(2)}
                      </div>
                      <div className="text-red-400 text-xs">{stakeData.againstRatio.toFixed(1)}%</div>
                    </div>

                    <div className={`text-center p-2 border rounded ${
                      stakeData.recommendation === 'approve' ? 'bg-green-900 border-green-600' :
                      stakeData.recommendation === 'reject' ? 'bg-red-900 border-red-600' :
                      'bg-yellow-900 border-yellow-600'
                    }`}>
                      <div className={`text-sm font-medium ${getRecommendationColor(stakeData.recommendation)}`}>
                        Status
                      </div>
                      <div className={`text-lg font-bold ${getRecommendationColor(stakeData.recommendation)}`}>
                        {getRecommendationIcon(stakeData.recommendation)}
                      </div>
                      <div className={`text-xs ${getRecommendationColor(stakeData.recommendation)}`}>
                        {stakeData.recommendation.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* User's Stakes for this submission */}
                  {userStakesForSubmission.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-600 border border-gray-500 rounded">
                      <div className="text-sm text-gray-300 font-medium mb-1">Your Stakes:</div>
                      <div className="flex flex-wrap gap-2">
                        {userStakesForSubmission.map((stake, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${
                              stake.position === 'for' 
                                ? 'bg-green-700 text-green-200' 
                                : 'bg-red-700 text-red-200'
                            }`}
                          >
                            {stake.position.toUpperCase()}: {(Number(stake.amount) / 1e18).toFixed(2)} tTRUST
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Staking Form */}
          {selectedSubmission && (
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
              <h4 className="text-lg font-medium text-white mb-4">Place Your Stake</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Position *
                  </label>
                  <select
                    value={stakePosition}
                    onChange={(e) => setStakePosition(e.target.value as 'for' | 'against')}
                    className="w-full p-2 bg-gray-600 border border-gray-500 text-white rounded"
                  >
                    <option value="for">✅ FOR (Approve Solution)</option>
                    <option value="against">❌ AGAINST (Reject Solution)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount (tTRUST) *
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min={Number(ESCROW_CONSTANTS.MIN_STAKE_AMOUNT)}
                    max={Number(ESCROW_CONSTANTS.MAX_STAKE_AMOUNT)}
                    step="0.1"
                    className="w-full p-2 bg-gray-600 border border-gray-500 text-white rounded"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Min: {Number(ESCROW_CONSTANTS.MIN_STAKE_AMOUNT)} | Max: {Number(ESCROW_CONSTANTS.MAX_STAKE_AMOUNT)}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleCreateStake}
                    disabled={isLoading || !stakeAmount}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                      stakePosition === 'for'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isLoading 
                      ? 'Placing Stake...' 
                      : `Stake ${stakePosition.toUpperCase()}: ${stakeAmount} tTRUST`
                    }
                  </button>
                </div>
              </div>

              <div className={`text-sm p-2 rounded ${
                stakePosition === 'for' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {stakePosition === 'for' 
                  ? '✅ You believe this solution meets the bounty requirements and should be approved'
                  : '❌ You believe this solution is inadequate and should be rejected'
                }
              </div>
            </div>
          )}

          {result && (
            <div className={`mt-4 p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
              <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line text-sm`}>
                {result}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}