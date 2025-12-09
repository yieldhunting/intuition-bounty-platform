 'use client'

  import { useState } from 'react'

  interface SubmitSolutionProps {
    bountyId: string
    bountyTitle: string
    onClose: () => void
    onSubmit: (submission: any) => void
  }

  export function SubmitSolution({ bountyId, bountyTitle, onClose, onSubmit }: SubmitSolutionProps) {
    const [portalUrl, setPortalUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<string>('')

    const validatePortalUrl = (url: string): boolean => {
      return url.includes('intuition.systems') && (
        url.includes('/explore/list/') ||
        url.includes('/list/') ||
        url.includes('0x')
      )
    }

    const handleSubmitSolution = async () => {
      if (!portalUrl.trim()) {
        alert('Please enter a Portal URL')
        return
      }

      if (!validatePortalUrl(portalUrl)) {
        alert('Please enter a valid Intuition Portal URL that contains a list or data identifier')
        return
      }

      setIsLoading(true)

      try {
        // Create submission object for instant local storage
          const submission = {
    id: `local_${Date.now()}`,
    portalUrl: portalUrl.trim(),
    submitter: 'You',
    submittedAt: new Date().toISOString(),
    transactionHash: null, // Local submission, no transaction
    isLocal: true // Add this flag
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
        setResult(`❌ Error: ${error.message}`)
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
              URL should link directly to your data list in Intuition Testnet Portal
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
