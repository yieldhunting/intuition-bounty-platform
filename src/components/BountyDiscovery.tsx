 'use client'

  import { useState, useEffect } from 'react'
  import { graphqlClient, GET_BOUNTIES_QUERY, transformAtomToBounty, groupSubmissionsByBounty } from '@/lib/graphql'
  import { SubmitSolution } from './SubmitSolution'
  import { ReputationAnalysis } from './ReputationAnalysis'
  import { ReputationAnalysisViewer } from './ReputationAnalysisViewer'

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

  interface BountyDiscoveryProps {
    bounties: Bounty[]
    onSubmissionCreated?: (submission: any, bountyId: string) => void
  }

  export function BountyDiscovery({ bounties: propBounties, onSubmissionCreated }: BountyDiscoveryProps) {
    const [graphqlBounties, setGraphqlBounties] = useState<Bounty[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [submissionsByBounty, setSubmissionsByBounty] = useState<{ [bountyId: string]: any[] }>({})
    const [localSubmissions, setLocalSubmissions] = useState<{ [bountyId: string]: any[] }>({})
    const [expandedSubmissions, setExpandedSubmissions] = useState<{ [bountyId: string]: boolean }>({})
    const [submissionModal, setSubmissionModal] = useState<{
      isOpen: boolean
      bountyId: string
      bountyTitle: string
      bountyType?: 'data' | 'reputation'
      targetAtom?: string
      expertiseRequired?: string
      reputationCriteria?: string
    }>({
      isOpen: false,
      bountyId: '',
      bountyTitle: '',
      bountyType: 'data'
    })

    // Combine GraphQL bounties with locally created bounties
    const allBounties = [...propBounties, ...graphqlBounties]

    // Fetch real bounties from Intuition
    useEffect(() => {
      const fetchBounties = async () => {
        try {
          setLoading(true)
          setError('')

          const response = await graphqlClient.request(GET_BOUNTIES_QUERY, {
            limit: 50
          })

          console.log('Raw GraphQL response:', response)
          console.log('Number of atoms returned:', response.atoms?.length || 0)

          // Transform atoms into bounties
          const transformedBounties = response.atoms
            .map(transformAtomToBounty)
            .filter((bounty: any) => bounty !== null)

          // Group submissions by bounty
          const groupedSubmissions = groupSubmissionsByBounty(response.atoms)

          console.log('Transformed bounties:', transformedBounties)
          console.log('Grouped submissions:', groupedSubmissions)

          setGraphqlBounties(transformedBounties)
          setSubmissionsByBounty(groupedSubmissions)

        } catch (err) {
          console.error('Error fetching bounties:', err)
          setError('Failed to load bounties. Please try again.')
        } finally {
          setLoading(false)
        }
      }

      fetchBounties()
    }, [])

    // Filter and sort bounties
    const filteredBounties = allBounties
      .sort((a, b) => {
        if (sortBy === 'reward') return b.reward - a.reward
        if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        if (sortBy === 'stake') return b.totalStake - a.totalStake
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })

    const handleSubmitClick = (bounty: Bounty) => {
      setSubmissionModal({
        isOpen: true,
        bountyId: bounty.id,
        bountyTitle: bounty.title,
        bountyType: bounty.bountyType || 'data',
        targetAtom: bounty.targetAtom,
        expertiseRequired: bounty.expertiseRequired,
        reputationCriteria: bounty.reputationCriteria
      })
    }

    const closeSubmissionModal = () => {
      setSubmissionModal({
        isOpen: false,
        bountyId: '',
        bountyTitle: '',
        bountyType: 'data'
      })
    }

   const handleAddSubmission = (submission: any) => {
    setLocalSubmissions(prev => ({
      ...prev,
      [submissionModal.bountyId]: [...(prev[submissionModal.bountyId] || []), submission]
    }))
    
    // Also notify the parent component for global submission tracking
    onSubmissionCreated?.(submission, submissionModal.bountyId)
    
    closeSubmissionModal()
  }

    const toggleSubmissions = (bountyId: string) => {
      setExpandedSubmissions(prev => ({
        ...prev,
        [bountyId]: !prev[bountyId]
      }))
    }

    // Combine blockchain submissions with local submissions
    const getAllSubmissions = (bountyId: string) => {
      const blockchainSubmissions = submissionsByBounty[bountyId] || []
      const localSubs = localSubmissions[bountyId] || []
      return [...blockchainSubmissions, ...localSubs]
    }

    if (loading) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading bounties from Intuition Protocol...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Discover Real Bounties</h2>
          <div className="text-sm text-gray-400">
            {filteredBounties.length} bounties from Intuition Protocol
          </div>
        </div>

        {/* Sorting */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sort by
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="reward">Highest Reward</option>
              <option value="deadline">Deadline</option>
              <option value="stake">Total Stake</option>
            </select>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="self-end bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-md text-sm border border-gray-600"
          >
            🔄 Refresh
          </button>
        </div>

        {/* No bounties state */}
        {filteredBounties.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-300 mb-4">No bounties found matching your criteria.</p>
            <p className="text-sm text-gray-400">Try creating the first bounty using the Create tab!</p>
          </div>
        )}

        {/* Bounty Cards */}
        <div className="space-y-4">
          {filteredBounties.map((bounty) => {
            const allSubmissions = getAllSubmissions(bounty.id)
            const isReputationBounty = bounty.bountyType === 'reputation' || bounty.title.toLowerCase().includes('reputation')
            return (
              <div key={bounty.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-blue-400">
                        {bounty.title}
                      </h3>
                      {isReputationBounty ? (
                        <span className="text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded">
                          🏆 Reputation
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-600 text-blue-100 px-2 py-0.5 rounded">
                          📊 Data
                        </span>
                      )}
                    </div>
                    {isReputationBounty && bounty.targetAtom && (
                      <p className="text-sm text-purple-300">
                        Target: {bounty.targetAtom}
                      </p>
                    )}
                    {isReputationBounty && bounty.expertiseRequired && (
                      <p className="text-xs text-purple-400">
                        Expertise: {bounty.expertiseRequired.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {bounty.reward} tTRUST
                    </div>
                    {bounty.totalStake > 0 && (
                      <div className="text-xs text-gray-400">
                        Stake: {bounty.totalStake.toFixed(2)} tTRUST
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  {isReputationBounty ? (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">
                        <span className="font-medium">Analysis Criteria:</span> {bounty.reputationCriteria || bounty.description}
                      </p>
                      {bounty.reputationCriteria && bounty.description !== bounty.reputationCriteria && (
                        <p className="text-gray-400 text-sm">{bounty.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-300">
                      {bounty.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                  <div className="flex gap-4">
                    <span>📅 Due: {bounty.deadline}</span>
                    <span>📝 {allSubmissions.length} submissions</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>
                    By: {bounty.creator}
                  </div>
                  <div>
                    Created: {new Date(bounty.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <a 
                    href={`https://testnet.explorer.intuition.systems/tx/${bounty.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700"
                  >
                    View on Explorer
                  </a>
                  <button 
                    onClick={() => handleSubmitClick(bounty)}
                    className={`px-4 py-1 rounded-md text-sm border transition-colors ${
                      isReputationBounty
                        ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border-gray-500'
                    }`}
                  >
                    {isReputationBounty ? 'Submit Analysis' : 'Submit Solution'}
                  </button>
                </div>

                {/* Submissions Section */}
                {allSubmissions.length > 0 && (
                  <div className="mt-4 border-t border-gray-600 pt-3">
                    <button
                      onClick={() => toggleSubmissions(bounty.id)}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                    >
                      <span>📝 {allSubmissions.length} Solution{allSubmissions.length !== 1 ? 's' : ''} Submitted</span>
                      <span>{expandedSubmissions[bounty.id] ? '▼' : '▶'}</span>
                    </button>

                    {expandedSubmissions[bounty.id] && (
                      <div className="mt-3 space-y-2">
                        {allSubmissions.map((submission, index) => {
                          // Check if this is a reputation analysis submission
                          if (submission.type === 'reputation_analysis') {
                            return (
                              <ReputationAnalysisViewer 
                                key={submission.id}
                                analysis={submission}
                              />
                            )
                          }
                          
                          // Regular data submission
                          return (
                            <div key={submission.id} className="bg-gray-600 border border-gray-500 rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-300 mb-2">
                                    <span className="font-medium">Solution:</span>
                                    {submission.isLocal && (
                                      <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded">
                                        Local
                                      </span>
                                    )}
                                  </p>
                                  <a
                                    href={submission.portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                  >
                                    {submission.portalUrl}
                                  </a>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Submitted by: {submission.submitter.slice(0, 10)}...
                                  </p>
                                </div>

                                <div className="text-right">
                                  {submission.transactionHash ? (
                                    <a
                                      href={`https://testnet.explorer.intuition.systems/tx/${submission.transactionHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      View Tx
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-500">Pending</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submission Modal */}
        {submissionModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full mx-4 ${
              submissionModal.bountyType === 'reputation' ? 'max-w-4xl' : 'max-w-md'
            }`}>
              {submissionModal.bountyType === 'reputation' ? (
                <ReputationAnalysis
                  bountyId={submissionModal.bountyId}
                  bountyTitle={submissionModal.bountyTitle}
                  targetAtom={submissionModal.targetAtom || 'Unknown Target'}
                  expertiseRequired={submissionModal.expertiseRequired || 'General Analysis'}
                  reputationCriteria={submissionModal.reputationCriteria || 'Comprehensive reputation assessment'}
                  onClose={closeSubmissionModal}
                  onSubmit={handleAddSubmission}
                />
              ) : (
                <SubmitSolution
                  bountyId={submissionModal.bountyId}
                  bountyTitle={submissionModal.bountyTitle}
                  onClose={closeSubmissionModal}
                  onSubmit={handleAddSubmission}
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

