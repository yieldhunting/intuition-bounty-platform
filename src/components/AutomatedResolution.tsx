'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { EscrowManager, StakingManager, EscrowStatus, SubmissionStatus, ESCROW_CONSTANTS } from '@/lib/escrow'

interface ResolutionSubmission {
  id: string
  bountyId: string
  bountyTitle: string
  bountyReward: number
  submitterAddress: string
  portalUrl: string
  forStake: bigint
  againstStake: bigint
  stakingPeriodEnd: Date
  status: SubmissionStatus
  escrowVaultId?: string
}

interface ResolutionAction {
  id: string
  type: 'auto_approve' | 'auto_reject' | 'send_to_arbitration' | 'refund_expired'
  submissionId?: string
  bountyId: string
  reason: string
  timestamp: Date
  executed: boolean
  transactionHash?: string
}

interface AutomatedResolutionProps {
  isSystemAdmin?: boolean
}

export function AutomatedResolution({ isSystemAdmin = false }: AutomatedResolutionProps) {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [escrowManager, setEscrowManager] = useState<EscrowManager | null>(null)
  const [stakingManager, setStakingManager] = useState<StakingManager | null>(null)
  const [pendingResolutions, setPendingResolutions] = useState<ResolutionSubmission[]>([])
  const [resolutionActions, setResolutionActions] = useState<ResolutionAction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string>('')

  // Initialize managers
  useEffect(() => {
    if (walletClient && publicClient && chainId) {
      const escrowMgr = new EscrowManager(walletClient, publicClient, chainId)
      const stakingMgr = new StakingManager(walletClient, publicClient, chainId)
      
      setEscrowManager(escrowMgr)
      setStakingManager(stakingMgr)
    }
  }, [walletClient, publicClient, chainId])

  // Load pending resolutions (mock data for demo)
  useEffect(() => {
    loadPendingResolutions()
    loadResolutionHistory()
  }, [])

  // Auto-check for resolutions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSystemAdmin) {
        checkForAutomatedResolutions()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [pendingResolutions, isSystemAdmin])

  const loadPendingResolutions = () => {
    // Mock data - in real app, fetch from API/GraphQL
    const mockResolutions: ResolutionSubmission[] = [
      {
        id: 'sub_ready_001',
        bountyId: 'bounty_001',
        bountyTitle: 'Climate Data Analysis',
        bountyReward: 150,
        submitterAddress: '0x1111111111111111111111111111111111111111',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0xabc123...',
        forStake: BigInt('80000000000000000000'), // 80 tTRUST (80%)
        againstStake: BigInt('20000000000000000000'), // 20 tTRUST (20%)
        stakingPeriodEnd: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        status: SubmissionStatus.STAKING_PERIOD,
        escrowVaultId: 'vault_001'
      },
      {
        id: 'sub_reject_001',
        bountyId: 'bounty_002',
        bountyTitle: 'Market Trends Dataset',
        bountyReward: 200,
        submitterAddress: '0x2222222222222222222222222222222222222222',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0xdef456...',
        forStake: BigInt('25000000000000000000'), // 25 tTRUST (25%)
        againstStake: BigInt('75000000000000000000'), // 75 tTRUST (75%)
        stakingPeriodEnd: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        status: SubmissionStatus.STAKING_PERIOD,
        escrowVaultId: 'vault_002'
      },
      {
        id: 'sub_dispute_001',
        bountyId: 'bounty_003',
        bountyTitle: 'Financial Reports Collection',
        bountyReward: 120,
        submitterAddress: '0x3333333333333333333333333333333333333333',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0xghi789...',
        forStake: BigInt('52000000000000000000'), // 52 tTRUST (52%)
        againstStake: BigInt('48000000000000000000'), // 48 tTRUST (48%)
        stakingPeriodEnd: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: SubmissionStatus.STAKING_PERIOD,
        escrowVaultId: 'vault_003'
      }
    ]

    setPendingResolutions(mockResolutions)
  }

  const loadResolutionHistory = () => {
    const mockHistory: ResolutionAction[] = [
      {
        id: 'action_001',
        type: 'auto_approve',
        submissionId: 'sub_prev_001',
        bountyId: 'bounty_prev_001',
        reason: 'Community approval threshold reached (85% FOR)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        executed: true,
        transactionHash: '0xabc123def456...'
      },
      {
        id: 'action_002',
        type: 'auto_reject',
        submissionId: 'sub_prev_002',
        bountyId: 'bounty_prev_002',
        reason: 'Community rejection threshold reached (78% AGAINST)',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        executed: true,
        transactionHash: '0xdef456ghi789...'
      },
      {
        id: 'action_003',
        type: 'send_to_arbitration',
        submissionId: 'sub_prev_003',
        bountyId: 'bounty_prev_003',
        reason: 'Inconclusive community decision (55% FOR, 45% AGAINST)',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        executed: true
      }
    ]

    setResolutionActions(mockHistory)
  }

  const checkForAutomatedResolutions = async () => {
    if (!stakingManager || !escrowManager) return

    const currentTime = new Date()
    const newActions: ResolutionAction[] = []

    for (const submission of pendingResolutions) {
      // Only process if staking period has ended
      if (submission.stakingPeriodEnd > currentTime) continue

      // Skip if already processed
      if (submission.status !== SubmissionStatus.STAKING_PERIOD) continue

      const stakeData = stakingManager.calculateStakeRatio(submission.forStake, submission.againstStake)

      let actionType: ResolutionAction['type']
      let reason: string

      if (stakeData.recommendation === 'approve') {
        actionType = 'auto_approve'
        reason = `Community approval threshold reached (${stakeData.forRatio}% FOR)`
      } else if (stakeData.recommendation === 'reject') {
        actionType = 'auto_reject'
        reason = `Community rejection threshold reached (${stakeData.againstRatio}% AGAINST)`
      } else {
        actionType = 'send_to_arbitration'
        reason = `Inconclusive community decision (${stakeData.forRatio}% FOR, ${stakeData.againstRatio}% AGAINST)`
      }

      const action: ResolutionAction = {
        id: `action_${Date.now()}_${submission.id}`,
        type: actionType,
        submissionId: submission.id,
        bountyId: submission.bountyId,
        reason,
        timestamp: currentTime,
        executed: false
      }

      newActions.push(action)
    }

    if (newActions.length > 0) {
      setResolutionActions(prev => [...newActions, ...prev])
      setResult(`🔄 Found ${newActions.length} submission(s) ready for automated resolution.`)
    }
  }

  const executeResolutionAction = async (action: ResolutionAction) => {
    if (!escrowManager || !action.submissionId || action.executed) return

    setIsProcessing(true)
    setResult('')

    try {
      let txHash = ''
      const submission = pendingResolutions.find(s => s.id === action.submissionId)
      
      if (!submission) {
        throw new Error('Submission not found')
      }

      switch (action.type) {
        case 'auto_approve':
          if (submission.escrowVaultId) {
            txHash = await escrowManager.releaseToSolver(
              submission.escrowVaultId,
              submission.submitterAddress,
              submission.id
            )
          }
          // Update submission status
          setPendingResolutions(prev =>
            prev.map(s => s.id === submission.id ? { ...s, status: SubmissionStatus.APPROVED } : s)
          )
          break

        case 'auto_reject':
          // Keep funds in escrow, update status to rejected
          setPendingResolutions(prev =>
            prev.map(s => s.id === submission.id ? { ...s, status: SubmissionStatus.REJECTED } : s)
          )
          break

        case 'send_to_arbitration':
          // Update status to disputed for arbitrator review
          setPendingResolutions(prev =>
            prev.map(s => s.id === submission.id ? { ...s, status: SubmissionStatus.DISPUTED } : s)
          )
          break
      }

      // Mark action as executed
      setResolutionActions(prev =>
        prev.map(a => a.id === action.id ? { ...a, executed: true, transactionHash: txHash } : a)
      )

      setResult(`✅ Resolution executed successfully!
        Action: ${action.type.replace('_', ' ').toUpperCase()}
        ${txHash ? `Transaction: ${txHash}` : ''}
        Submission: ${action.submissionId}`)

    } catch (error) {
      console.error('Resolution execution error:', error)
      setResult(`❌ Error executing resolution: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getActionTypeColor = (type: ResolutionAction['type']) => {
    switch (type) {
      case 'auto_approve': return 'text-green-400'
      case 'auto_reject': return 'text-red-400'
      case 'send_to_arbitration': return 'text-yellow-400'
      case 'refund_expired': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getActionTypeIcon = (type: ResolutionAction['type']) => {
    switch (type) {
      case 'auto_approve': return '✅'
      case 'auto_reject': return '❌'
      case 'send_to_arbitration': return '⚖️'
      case 'refund_expired': return '⏰'
      default: return '❓'
    }
  }

  const getSubmissionStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.APPROVED: return 'text-green-400'
      case SubmissionStatus.REJECTED: return 'text-red-400'
      case SubmissionStatus.DISPUTED: return 'text-yellow-400'
      case SubmissionStatus.STAKING_PERIOD: return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300">Connect your wallet to view automated resolution system!</p>
      </div>
    )
  }

  if (!isSystemAdmin) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-4">🤖 Automated Resolution System</h3>
          <div className="text-gray-300 mb-4">
            <p>This dashboard is for system administrators only.</p>
            <p className="text-sm text-gray-400 mt-2">
              The automated system monitors and resolves bounty submissions based on community consensus.
            </p>
          </div>
          <div className="bg-green-900 border border-green-600 p-4 rounded-lg text-left">
            <h4 className="text-green-300 font-medium mb-2">How Automated Resolution Works:</h4>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• Monitors staking periods and community consensus</li>
              <li>• Auto-approves solutions with {ESCROW_CONSTANTS.APPROVAL_THRESHOLD}%+ FOR stakes</li>
              <li>• Auto-rejects solutions with {ESCROW_CONSTANTS.REJECTION_THRESHOLD}%+ AGAINST stakes</li>
              <li>• Sends disputed cases to arbitration</li>
              <li>• Handles expired bounties with refunds</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">🤖 Automated Resolution System</h3>
        <div className="px-3 py-1 bg-green-600 text-green-100 text-sm font-medium rounded-full">
          System Administrator
        </div>
      </div>

      <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-lg">
        <h4 className="text-green-300 font-medium mb-2">⚙️ System Parameters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-400 font-bold">{ESCROW_CONSTANTS.APPROVAL_THRESHOLD}%</div>
            <div className="text-green-300">Auto-Approval</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">{ESCROW_CONSTANTS.REJECTION_THRESHOLD}%</div>
            <div className="text-red-300">Auto-Rejection</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">{ESCROW_CONSTANTS.STAKING_PERIOD_DAYS}</div>
            <div className="text-blue-300">Staking Days</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">30s</div>
            <div className="text-purple-300">Check Interval</div>
          </div>
        </div>
      </div>

      {/* Pending Resolutions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-white">Pending Resolutions</h4>
          <button
            onClick={checkForAutomatedResolutions}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            🔄 Check Now
          </button>
        </div>

        {pendingResolutions.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No pending submissions for resolution
          </div>
        ) : (
          <div className="space-y-3">
            {pendingResolutions.map((submission) => {
              const stakeData = stakingManager?.calculateStakeRatio(submission.forStake, submission.againstStake)
              const isReady = submission.stakingPeriodEnd < new Date()
              
              return (
                <div key={submission.id} className={`p-4 border rounded-lg ${
                  isReady ? 'bg-yellow-900 border-yellow-600' : 'bg-gray-700 border-gray-600'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-blue-400 font-medium">{submission.bountyTitle}</h5>
                        <span className={`text-xs px-2 py-0.5 rounded ${getSubmissionStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {isReady && (
                          <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded">
                            READY
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Reward: {submission.bountyReward} tTRUST</p>
                        <p>Staking ends: {submission.stakingPeriodEnd.toLocaleString()}</p>
                        {stakeData && (
                          <p>
                            Consensus: {stakeData.forRatio.toFixed(1)}% FOR, {stakeData.againstRatio.toFixed(1)}% AGAINST
                            <span className={`ml-2 ${getActionTypeColor(
                              stakeData.recommendation === 'approve' ? 'auto_approve' :
                              stakeData.recommendation === 'reject' ? 'auto_reject' : 'send_to_arbitration'
                            )}`}>
                              ({stakeData.recommendation.toUpperCase()})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Resolution Actions */}
      <div>
        <h4 className="text-lg font-medium text-white mb-4">Resolution Actions</h4>
        
        {resolutionActions.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No resolution actions yet
          </div>
        ) : (
          <div className="space-y-3">
            {resolutionActions.slice(0, 10).map((action) => (
              <div key={action.id} className={`p-4 border rounded-lg ${
                action.executed ? 'bg-gray-700 border-gray-600' : 'bg-blue-900 border-blue-600'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${getActionTypeColor(action.type)}`}>
                        {getActionTypeIcon(action.type)} {action.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {action.timestamp.toLocaleString()}
                      </span>
                      {action.executed ? (
                        <span className="text-xs bg-green-600 text-green-100 px-2 py-0.5 rounded">
                          EXECUTED
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-0.5 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{action.reason}</p>
                    {action.submissionId && (
                      <p className="text-xs text-gray-400">Submission: {action.submissionId}</p>
                    )}
                    {action.transactionHash && (
                      <p className="text-xs text-blue-400 mt-1">
                        Tx: {action.transactionHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                  
                  {!action.executed && (
                    <button
                      onClick={() => executeResolutionAction(action)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Execute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {result && (
        <div className={`mt-4 p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
          <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line text-sm`}>
            {result}
          </p>
        </div>
      )}
    </div>
  )
}