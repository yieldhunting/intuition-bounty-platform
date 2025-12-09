'use client'

  import { useState } from 'react'
  import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
  import { createAtomFromString, getMultiVaultAddressFromChainId } from
  '@0xintuition/sdk'

  export function CreateAtom() {
    const { isConnected, chainId } = useAccount()
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const [atomText, setAtomText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<string>('')

    const handleCreateAtom = async () => {
      if (!atomText.trim()) {
        alert('Please enter some text for your atom')
        return
      }

      if (!walletClient || !publicClient || !chainId) {
        alert('Please make sure your wallet is connected to Intuition testnet')
        return
      }

      setIsLoading(true)
      setResult('')

      try {
        // Get the MultiVault address for Intuition testnet
        const multivaultAddress = getMultiVaultAddressFromChainId(chainId)

        // Create atom using Intuition SDK
        const atomResult = await createAtomFromString(
          { walletClient, publicClient, address: multivaultAddress },
          atomText
        )

        setResult(`✅ Real Atom created on Intuition! 
          Atom ID: ${atomResult.state.termId}
          Vault ID: ${atomResult.state.vaultId}
          Transaction: ${atomResult.transactionHash}`)
        setAtomText('')

      } catch (error) {
        console.error('Error creating atom:', error)
        setResult(`❌ Error: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isConnected) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">Connect your wallet to Intuition testnet to create atoms!</p>
        </div>
      )
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Create Real Intuition
  Atom</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 
  mb-2">
              Atom Content
            </label>
            <input
              type="text"
              value={atomText}
              onChange={(e) => setAtomText(e.target.value)}
              placeholder="e.g., Machine Learning Dataset"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={handleCreateAtom}
            disabled={isLoading || !atomText.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
  hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Atom on Intuition...' : 'Create RealAtom'}
          </button>

          {result && (
            <div className={`p-3 rounded-md ${result.startsWith('✅') ? 
  'bg-green-50' : 'bg-red-50'}`}>
              <p className={`${result.startsWith('✅') ? 'text-green-700' :
   'text-red-700'} whitespace-pre-line`}>
                {result}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
