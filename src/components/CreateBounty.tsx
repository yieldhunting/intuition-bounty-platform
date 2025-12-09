  'use client'

  import { useState } from 'react'
  import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
  import { createAtomFromString, getMultiVaultAddressFromChainId } from '@0xintuition/sdk'
  import { EscrowManager } from './EscrowManager'

  interface BountyFormData {
    title: string
    description: string
    reward: string
    deadline: string
    bountyType: 'data' | 'reputation'
    targetAtomId?: string
    targetAtomName?: string
    expertiseRequired?: string
    reputationCriteria?: string
  }

  export function CreateBounty() {
    const { isConnected, chainId, address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()

    const [formData, setFormData] = useState<BountyFormData>({
      title: '',
      description: '',
      reward: '',
      deadline: '',
      bountyType: 'data',
      targetAtomId: '',
      targetAtomName: '',
      expertiseRequired: '',
      reputationCriteria: ''
    })

    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<string>('')
    const [createdBounty, setCreatedBounty] = useState<{
      id: string
      title: string
      description: string
      reward: number
      deadline: string
      transactionHash: string
    } | null>(null)

    const handleInputChange = (field: keyof BountyFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleStartOver = () => {
      setCreatedBounty(null)
      setFormData({
        title: '',
        description: '',
        reward: '',
        deadline: '',
        bountyType: 'data',
        targetAtomId: '',
        targetAtomName: '',
        expertiseRequired: '',
        reputationCriteria: ''
      })
      setResult('')
    }

    const handleCreateBounty = async () => {
      // Validation
      if (!formData.title.trim()) {
        alert('Please enter a bounty title')
        return
      }
      
      // Different validation for different bounty types
      if (formData.bountyType === 'reputation') {
        if (!formData.reputationCriteria?.trim()) {
          alert('Please enter reputation analysis criteria')
          return
        }
        if (!formData.targetAtomId?.trim()) {
          alert('Please enter a target atom ID or search term')
          return
        }
        if (!formData.expertiseRequired?.trim()) {
          alert('Please select required expertise area')
          return
        }
      } else {
        if (!formData.description.trim()) {
          alert('Please enter a description')
          return
        }
      }
      if (!formData.reward || parseFloat(formData.reward) <= 0) {
        alert('Please enter a valid reward amount')
        return
      }
      if (!formData.deadline) {
        alert('Please select a deadline')
        return
      }

      if (!walletClient || !publicClient || !chainId) {
        alert('Please make sure your wallet is connected')
        return
      }

      setIsLoading(true)
      setResult('')

      try {
        // Create bounty string based on type
        const bountyString = formData.bountyType === 'reputation'
          ? `REPUTATION_BOUNTY: ${formData.title} | Target: ${formData.targetAtomName || formData.targetAtomId} | Expertise: ${formData.expertiseRequired} | Criteria: ${formData.reputationCriteria} | Reward: ${formData.reward} tTRUST | Deadline: ${formData.deadline}`
          : `DATA_BOUNTY: ${formData.title} | ${formData.description} | Reward: ${formData.reward} tTRUST | Deadline: ${formData.deadline}`

        const multivaultAddress = getMultiVaultAddressFromChainId(chainId)

        // Use createAtomFromString to avoid IPFS issues
        const bountyResult = await createAtomFromString(
          { walletClient, publicClient, address: multivaultAddress },
          bountyString
        )

        // Set created bounty for escrow setup
        setCreatedBounty({
          id: bountyResult.state.termId,
          title: formData.title,
          description: formData.description,
          reward: parseFloat(formData.reward),
          deadline: formData.deadline,
          transactionHash: bountyResult.transactionHash
        })

        setResult(`✅ Bounty created successfully! 
          Bounty ID: ${bountyResult.state.termId}
          Title: "${formData.title}"
          Reward: ${formData.reward} tTRUST
          Transaction: ${bountyResult.transactionHash}
          
          Next: Set up secure escrow to lock your reward funds.`)

      } catch (error) {
        console.error('Error creating bounty:', error)
        setResult(`❌ Error: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isConnected) {
      return (
        <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-300">Connect your wallet to create bounties!</p>
        </div>
      )
    }

    // Show escrow manager if bounty is created
    if (createdBounty && address) {
      return (
        <div className="space-y-6">
          {/* Bounty Success Summary */}
          <div className="bg-green-900 border border-green-600 p-4 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-2">🎉 Bounty Created Successfully!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-green-400">Title:</span>
                <p className="text-white">{createdBounty.title}</p>
              </div>
              <div>
                <span className="text-green-400">Reward:</span>
                <p className="text-green-300 font-bold">{createdBounty.reward} tTRUST</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <a 
                href={`https://testnet.explorer.intuition.systems/tx/${createdBounty.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline text-sm"
              >
                View Transaction →
              </a>
              <button 
                onClick={handleStartOver}
                className="text-green-400 hover:text-green-300 underline text-sm"
              >
                Create Another Bounty
              </button>
            </div>
          </div>

          {/* Escrow Manager */}
          <EscrowManager
            bountyId={createdBounty.id}
            bountyTitle={createdBounty.title}
            rewardAmount={createdBounty.reward}
            creatorAddress={address}
            deadline={createdBounty.deadline}
            onEscrowCreated={(escrowId) => {
              console.log('Escrow created:', escrowId)
            }}
          />
        </div>
      )
    }

    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-6 text-white">Create New Bounty</h3>

        {/* Bounty Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Bounty Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleInputChange('bountyType', 'data')}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                formData.bountyType === 'data'
                  ? 'border-blue-500 bg-blue-900 text-blue-200'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <span className="font-semibold">Data Bounty</span>
              </div>
              <p className="text-sm opacity-90">
                Request specific datasets, analysis, or data collection
              </p>
            </button>

            <button
              onClick={() => handleInputChange('bountyType', 'reputation')}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                formData.bountyType === 'reputation'
                  ? 'border-purple-500 bg-purple-900 text-purple-200'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <span className="font-semibold">Reputation Bounty</span>
              </div>
              <p className="text-sm opacity-90">
                Request expert analysis of reputation for any Intuition atom
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bounty Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={formData.bountyType === 'reputation' ? 'e.g., Reputation Analysis: Tesla Inc.' : 'e.g., Flight Delay Dataset'}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
  focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Reputation Bounty Target Atom */}
            {formData.bountyType === 'reputation' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Atom ID or Search *
                  </label>
                  <input
                    type="text"
                    value={formData.targetAtomId}
                    onChange={(e) => handleInputChange('targetAtomId', e.target.value)}
                    placeholder="0x123abc... or search term"
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
      focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter an Intuition atom ID or search for a person/company/product
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Name/Description
                  </label>
                  <input
                    type="text"
                    value={formData.targetAtomName}
                    onChange={(e) => handleInputChange('targetAtomName', e.target.value)}
                    placeholder="e.g., Tesla Inc., Elon Musk, iPhone 15"
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
      focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Expertise *
                  </label>
                  <select
                    value={formData.expertiseRequired}
                    onChange={(e) => handleInputChange('expertiseRequired', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2
      focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select expertise area...</option>
                    <option value="financial_analysis">Financial Analysis</option>
                    <option value="tech_industry">Technology Industry</option>
                    <option value="business_operations">Business Operations</option>
                    <option value="product_quality">Product Quality</option>
                    <option value="market_research">Market Research</option>
                    <option value="academic_research">Academic Research</option>
                    <option value="regulatory_compliance">Regulatory Compliance</option>
                    <option value="other">Other (specify in description)</option>
                  </select>
                </div>
              </div>
            )}


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reward Amount (tTRUST) *
              </label>
              <input
                type="number"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                placeholder="100"
                min="0"
                step="0.01"
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
  focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500
  focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {formData.bountyType === 'reputation' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reputation Analysis Criteria *
                </label>
                <textarea
                  value={formData.reputationCriteria}
                  onChange={(e) => handleInputChange('reputationCriteria', e.target.value)}
                  placeholder="What specific aspects of reputation should be analyzed? e.g., financial stability, product quality, customer satisfaction, regulatory compliance..."
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
    focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Specify what reputation dimensions you want analyzed and any specific sources or methodologies
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what data you need and how it should be formatted..."
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
    focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Reputation Bounty Info Box */}
            {formData.bountyType === 'reputation' && (
              <div className="bg-purple-900 border border-purple-600 p-4 rounded-lg">
                <h4 className="text-purple-300 font-medium mb-2">📋 Reputation Analysis Framework</h4>
                <ul className="text-purple-200 text-sm space-y-1">
                  <li>• <strong>Credibility:</strong> Track record and expertise verification</li>
                  <li>• <strong>Performance:</strong> Quantitative metrics and outcomes</li>
                  <li>• <strong>Sentiment:</strong> Public perception and community feedback</li>
                  <li>• <strong>Risk Assessment:</strong> Potential issues and red flags</li>
                  <li>• <strong>Context:</strong> Industry benchmarks and comparisons</li>
                </ul>
              </div>
            )}

          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCreateBounty}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold 
  transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isLoading ? 'Creating Bounty on Intuition...' : `Create ${formData.bountyType === 'reputation' ? 'Reputation' : 'Data'} Bounty (${formData.reward || '0'} tTRUST Reward)`}
          </button>
        </div>

        {result && (
          <div className={`mt-4 p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
            <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line`}>
              {result}
            </p>
          </div>
        )}
      </div>
    )
  }