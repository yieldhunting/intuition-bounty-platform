 'use client'

  import { useState } from 'react'
  import { useAccount } from 'wagmi'
  import { SubmissionStatus } from '@/lib/escrow'

  interface SubmitSolutionProps {
    bountyId: string
    bountyTitle: string
    onClose: () => void
    onSubmit: (submission: any) => void
  }

  export function SubmitSolution({ bountyId, bountyTitle, onClose, onSubmit }: SubmitSolutionProps) {
    const { address } = useAccount()
    const [portalUrl, setPortalUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<string>('')

    const validatePortalUrl = (url: string): { isValid: boolean, error?: string } => {
      // Check if URL contains intuition.systems
      if (!url.includes('intuition.systems')) {
        return { isValid: false, error: 'URL must be from intuition.systems' }
      }
      
      // Check if it's testnet (not mainnet)
      if (!url.includes('testnet.portal.intuition.systems')) {
        if (url.includes('portal.intuition.systems') && !url.includes('testnet')) {
          return { isValid: false, error: 'Only testnet Portal URLs are accepted. Please use testnet.portal.intuition.systems' }
        }
      }
      
      // Check if it contains list structure
      const hasListStructure = url.includes('/explore/list/') || url.includes('/list/') || url.includes('0x')
      if (!hasListStructure) {
        return { isValid: false, error: 'URL must contain a list or data identifier' }
      }
      
      return { isValid: true }
    }

    const handleSubmitSolution = async () => {
      if (!portalUrl.trim()) {
        alert('Please enter a Portal URL')
        return
      }

      const validation = validatePortalUrl(portalUrl)
      if (!validation.isValid) {
        alert(validation.error || 'Please enter a valid Portal URL')
        return
      }

      setIsLoading(true)

      try {
        // Create submission object with all required fields for localStorage persistence
        const submission = {
          id: `local_${Date.now()}`,
          bountyId: bountyId, // Required for proper bounty association
          bountyTitle: bountyTitle, // Required for display
          submitterAddress: address || 'Unknown', // Required for validation
          portalUrl: portalUrl.trim(),
          submittedAt: new Date().toISOString(),
          forStake: BigInt(0), // Required bigint field
          againstStake: BigInt(0), // Required bigint field
          status: SubmissionStatus.STAKING_PERIOD, // Required enum
          isLocal: true // Local submission flag
        }


        // Add to local submissions immediately
        onSubmit(submission)

        setResult(`✅ Solution submitted instantly!
          Portal URL: ${portalUrl}
          
          Your solution is now visible on the bounty!`)

        setPortalUrl('')

        // Auto-close modal after short delay
        setTimeout(() => {
          onClose()
        }, 2000)

      } catch (error) {
        setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Submit Solution</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-2">
            Submitting solution for: <span className="font-semibold text-blue-400">"{bountyTitle}"</span>
          </p>
          <p className="text-sm text-gray-400">
            Provide a testnet Portal URL that displays your data solution list.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Intuition Testnet Portal URL *
            </label>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => setPortalUrl(e.target.value)}
              placeholder="https://testnet.portal.intuition.systems/explore/list/0x7ec36d..."
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2
  focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              URL must be from testnet.portal.intuition.systems - mainnet URLs will be rejected
            </p>
          </div>

          <button
            onClick={handleSubmitSolution}
            disabled={isLoading || !portalUrl.trim()}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold 
  transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Solution Instantly'}
          </button>

          {result && (
            <div className={`p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
              <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line`}>
                {result}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
