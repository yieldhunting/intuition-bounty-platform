'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { ArbitrationManager, ArbitrationCase, EscrowStatus, SubmissionStatus } from '@/lib/escrow'

interface DisputedSubmission {
  id: string
  bountyId: string
  bountyTitle: string
  bountyReward: number
  submitterAddress: string
  portalUrl: string
  submittedAt: string
  forStake: bigint
  againstStake: bigint
  forRatio: number
  againstRatio: number
  status: SubmissionStatus
  arbitrationCase?: ArbitrationCase
}

interface ArbitratorDashboardProps {
  userAddress?: string
  isArbitrator?: boolean
}

export function ArbitratorDashboard({ userAddress, isArbitrator = false }: ArbitratorDashboardProps) {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [arbitrationManager, setArbitrationManager] = useState<ArbitrationManager | null>(null)
  const [disputedSubmissions, setDisputedSubmissions] = useState<DisputedSubmission[]>([])
  const [selectedCase, setSelectedCase] = useState<string>('')
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve')
  const [reasoning, setReasoning] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // Initialize arbitration manager
  useEffect(() => {
    if (walletClient && publicClient && chainId) {
      const arbitrationMgr = new ArbitrationManager(walletClient, publicClient, chainId)
      setArbitrationManager(arbitrationMgr)
    }
  }, [walletClient, publicClient, chainId])

  // Load disputed submissions (mock data for demo)
  useEffect(() => {
    loadDisputedSubmissions()
  }, [])

  const loadDisputedSubmissions = () => {
    // In a real implementation, this would fetch from GraphQL/API
    const mockDisputed: DisputedSubmission[] = [
      {
        id: 'sub_001',
        bountyId: 'bounty_001',
        bountyTitle: 'Flight Delay Dataset Analysis',
        bountyReward: 100,
        submitterAddress: '0x1234567890123456789012345678901234567890',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x7ec36d567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        forStake: BigInt('45000000000000000000'), // 45 tTRUST
        againstStake: BigInt('55000000000000000000'), // 55 tTRUST
        forRatio: 45,
        againstRatio: 55,
        status: SubmissionStatus.DISPUTED
      },
      {
        id: 'sub_002',
        bountyId: 'bounty_002',
        bountyTitle: 'Social Media Sentiment Dataset',
        bountyReward: 75,
        submitterAddress: '0x9876543210987654321098765432109876543210',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x4ba82f567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        forStake: BigInt('35000000000000000000'), // 35 tTRUST
        againstStake: BigInt('40000000000000000000'), // 40 tTRUST
        forRatio: 46.7,
        againstRatio: 53.3,
        status: SubmissionStatus.DISPUTED
      }
    ]

    setDisputedSubmissions(mockDisputed)
  }

  const handleCreateArbitrationCase = async (submission: DisputedSubmission) => {
    if (!arbitrationManager || !address) {
      alert('Please connect your wallet')
      return
    }

    if (!isArbitrator) {
      alert('Only authorized arbitrators can handle disputes')
      return
    }

    setIsLoading(true)
    setResult('')

    try {
      const arbitrationCase = await arbitrationManager.createArbitrationCase(
        submission.bountyId,
        submission.id,
        address
      )

      // Update submission with arbitration case
      setDisputedSubmissions(prev => 
        prev.map(sub => 
          sub.id === submission.id 
            ? { ...sub, arbitrationCase }
            : sub
        )
      )

      setResult(`✅ Arbitration case created successfully!
        Case ID: ${arbitrationCase.id}
        Submission: ${submission.id}
        
        You can now review and make a decision on this dispute.`)

    } catch (error) {
      console.error('Arbitration case creation error:', error)
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitDecision = async () => {
    if (!arbitrationManager || !selectedCase || !reasoning.trim()) {
      alert('Please select a case and provide reasoning')
      return
    }

    setIsLoading(true)
    setResult('')

    try {
      const txHash = await arbitrationManager.submitDecision(
        selectedCase,
        decision,
        reasoning
      )

      // Update submission status
      setDisputedSubmissions(prev => 
        prev.map(sub => 
          sub.arbitrationCase?.id === selectedCase
            ? { 
                ...sub, 
                status: decision === 'approve' ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED,
                arbitrationCase: {
                  ...sub.arbitrationCase!,
                  decision,
                  reasoning,
                  decidedAt: new Date()
                }
              }
            : sub
        )
      )

      setResult(`✅ Decision submitted successfully!
        Decision: ${decision.toUpperCase()}
        Transaction: ${txHash}
        Case: ${selectedCase}
        
        The dispute has been resolved and appropriate actions will be taken.`)

      // Reset form
      setSelectedCase('')
      setReasoning('')
      setDecision('approve')

    } catch (error) {
      console.error('Decision submission error:', error)
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.APPROVED: return 'text-green-400'
      case SubmissionStatus.REJECTED: return 'text-red-400'
      case SubmissionStatus.DISPUTED: return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.APPROVED: return '✅'
      case SubmissionStatus.REJECTED: return '❌'
      case SubmissionStatus.DISPUTED: return '⚖️'
      default: return '❓'
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300">Connect your wallet to access the arbitrator dashboard!</p>
      </div>
    )
  }

  if (!isArbitrator) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-4">⚖️ Arbitrator Dashboard</h3>
          <div className="text-gray-300 mb-4">
            <p>This dashboard is for authorized arbitrators only.</p>
            <p className="text-sm text-gray-400 mt-2">
              Arbitrators help resolve disputes when community staking results are inconclusive.
            </p>
          </div>
          <div className="bg-blue-900 border border-blue-600 p-4 rounded-lg text-left">
            <h4 className="text-blue-300 font-medium mb-2">How to Become an Arbitrator:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Build reputation through accurate community staking</li>
              <li>• Demonstrate expertise in data quality assessment</li>
              <li>• Apply through governance proposals</li>
              <li>• Maintain high accuracy in decision-making</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">⚖️ Arbitrator Dashboard</h3>
        <div className="px-3 py-1 bg-purple-600 text-purple-100 text-sm font-medium rounded-full">
          Authorized Arbitrator
        </div>
      </div>

      <div className="mb-6 p-4 bg-purple-900 border border-purple-600 rounded-lg">
        <h4 className="text-purple-300 font-medium mb-2">🎯 Your Role as Arbitrator</h4>
        <div className="text-purple-200 text-sm space-y-1">
          <p>• Review disputed submissions where community consensus is unclear</p>
          <p>• Make final decisions on solution quality and bounty eligibility</p>
          <p>• Provide detailed reasoning for transparency and learning</p>
          <p>• Earn arbitration fees for accurate and timely decisions</p>
        </div>
      </div>

      {disputedSubmissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No disputed submissions at this time</p>
          <p className="text-sm text-gray-500">Check back when community staking creates disputes</p>
        </div>
      ) : (
        <>
          {/* Disputed Submissions List */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-medium text-white">Disputed Submissions</h4>
            
            {disputedSubmissions.map((submission) => {
              const hasArbitrationCase = !!submission.arbitrationCase
              const isAssigned = submission.arbitrationCase?.arbitratorAddress === address
              const isDecided = submission.arbitrationCase?.decision !== 'pending'
              
              return (
                <div key={submission.id} className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-blue-400 font-medium">{submission.bountyTitle}</h5>
                        <span className={`text-sm px-2 py-0.5 rounded ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)} {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><span className="text-gray-400">Bounty Reward:</span> {submission.bountyReward} tTRUST</p>
                        <p><span className="text-gray-400">Submitter:</span> {(submission.submitterAddress || 'Unknown').slice(0, 10)}...{(submission.submitterAddress || 'Unknown').slice(-6)}</p>
                        <p><span className="text-gray-400">Submitted:</span> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <a
                        href={submission.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm mt-2 inline-block"
                      >
                        View Solution →
                      </a>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-400 mb-1">Stake Ratio</div>
                      <div className="flex gap-2">
                        <div className="text-center">
                          <div className="text-green-400 font-bold">{submission.forRatio.toFixed(1)}%</div>
                          <div className="text-xs text-green-500">FOR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400 font-bold">{submission.againstRatio.toFixed(1)}%</div>
                          <div className="text-xs text-red-500">AGAINST</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arbitration Status */}
                  {!hasArbitrationCase ? (
                    <div className="flex items-center justify-between p-3 bg-yellow-900 border border-yellow-600 rounded">
                      <div>
                        <p className="text-yellow-300 font-medium">⚠️ Needs Arbitration</p>
                        <p className="text-yellow-200 text-sm">Community staking is inconclusive</p>
                      </div>
                      <button
                        onClick={() => handleCreateArbitrationCase(submission)}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                      >
                        Take Case
                      </button>
                    </div>
                  ) : isAssigned && !isDecided ? (
                    <div className="p-3 bg-purple-900 border border-purple-600 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-300 font-medium">📋 Your Active Case</p>
                        <button
                          onClick={() => setSelectedCase(submission.arbitrationCase!.id)}
                          className="text-purple-400 hover:text-purple-300 underline text-sm"
                        >
                          Make Decision
                        </button>
                      </div>
                      <p className="text-purple-200 text-sm">Case ID: {submission.arbitrationCase?.id}</p>
                    </div>
                  ) : isDecided ? (
                    <div className={`p-3 border rounded ${
                      submission.arbitrationCase?.decision === 'approve'
                        ? 'bg-green-900 border-green-600'
                        : 'bg-red-900 border-red-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${
                            submission.arbitrationCase?.decision === 'approve'
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}>
                            {submission.arbitrationCase?.decision === 'approve' ? '✅ Approved' : '❌ Rejected'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Decided: {submission.arbitrationCase?.decidedAt?.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-400">Arbitrator</p>
                          <p className="text-gray-300 font-mono text-xs">
                            {submission.arbitrationCase?.arbitratorAddress === address 
                              ? 'You' 
                              : `${submission.arbitrationCase?.arbitratorAddress?.slice(0, 6)}...`
                            }
                          </p>
                        </div>
                      </div>
                      {submission.arbitrationCase?.reasoning && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <p className="text-sm text-gray-300">
                            <span className="text-gray-400">Reasoning:</span> {submission.arbitrationCase?.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-600 border border-gray-500 rounded">
                      <p className="text-gray-300 font-medium">📋 Under Arbitration</p>
                      <p className="text-gray-400 text-sm">
                        Assigned to: {submission.arbitrationCase?.arbitratorAddress?.slice(0, 10)}...
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Decision Form */}
          {selectedCase && (
            <div className="p-6 bg-gray-700 border border-gray-600 rounded-lg">
              <h4 className="text-lg font-medium text-white mb-4">📝 Make Arbitration Decision</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decision *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="decision"
                        value="approve"
                        checked={decision === 'approve'}
                        onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                        className="mr-2"
                      />
                      <span className="text-green-400">✅ Approve - Solution meets requirements</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="decision"
                        value="reject"
                        checked={decision === 'reject'}
                        onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                        className="mr-2"
                      />
                      <span className="text-red-400">❌ Reject - Solution inadequate</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Case ID
                  </label>
                  <div className="p-2 bg-gray-600 border border-gray-500 rounded text-gray-300 font-mono text-sm">
                    {selectedCase}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reasoning * (Required for transparency)
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Provide detailed reasoning for your decision. Consider data quality, completeness, format compliance, and bounty requirements..."
                  rows={4}
                  className="w-full p-3 bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Minimum 50 characters. Your reasoning will be publicly visible.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitDecision}
                  disabled={isLoading || !reasoning.trim() || reasoning.length < 50}
                  className={`flex-1 py-3 px-4 rounded font-semibold transition-colors disabled:opacity-50 ${
                    decision === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isLoading 
                    ? 'Submitting Decision...' 
                    : `${decision === 'approve' ? '✅ Approve' : '❌ Reject'} Solution`
                  }
                </button>
                
                <button
                  onClick={() => {
                    setSelectedCase('')
                    setReasoning('')
                    setDecision('approve')
                  }}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded text-blue-200 text-sm">
                <strong>⚖️ Arbitrator Guidelines:</strong> Evaluate based on data quality, format compliance, completeness, and alignment with bounty requirements. Your decision affects the submitter's reputation and community trust.
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