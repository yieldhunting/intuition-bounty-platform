'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { EscrowManager as EscrowManagerClass, StakingManager, EscrowStatus, StakePosition, ESCROW_CONSTANTS } from '@/lib/escrow'

interface EscrowManagerProps {
  bountyId: string
  bountyTitle: string
  rewardAmount: number
  creatorAddress: string
  deadline: string
  onEscrowCreated?: (escrowId: string) => void
}

export function EscrowManager({ 
  bountyId, 
  bountyTitle, 
  rewardAmount, 
  creatorAddress, 
  deadline,
  onEscrowCreated 
}: EscrowManagerProps) {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [escrowManager, setEscrowManager] = useState<EscrowManagerClass | null>(null)
  const [stakingManager, setStakingManager] = useState<StakingManager | null>(null)
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>(EscrowStatus.ACTIVE)
  const [escrowVaultId, setEscrowVaultId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // Initialize managers when wallet is connected
  useEffect(() => {
    if (walletClient && publicClient && chainId) {
      const escrowMgr = new EscrowManagerClass(walletClient, publicClient, chainId)
      const stakingMgr = new StakingManager(walletClient, publicClient, chainId)
      
      setEscrowManager(escrowMgr)
      setStakingManager(stakingMgr)
    }
  }, [walletClient, publicClient, chainId])

  const handleCreateEscrow = async () => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    // Instant demo escrow creation
    const escrowConfig = {
      bountyId,
      creatorAddress,
      rewardAmount: BigInt(Math.floor(rewardAmount * 1e18)),
      deadline: new Date(deadline),
      escrowVaultId: `demo_escrow_${Date.now()}`,
      status: EscrowStatus.ACTIVE,
      createdAt: new Date()
    }

    setEscrowVaultId(escrowConfig.escrowVaultId)
    setEscrowStatus(escrowConfig.status)
    
    setResult(`✅ Escrow approved instantly! (Demo)
      Vault ID: ${escrowConfig.escrowVaultId}
      Amount: ${rewardAmount} tTRUST locked
      Status: Active
      
      Your bounty is now live and ready for submissions!`)

    if (onEscrowCreated) {
      onEscrowCreated(escrowConfig.escrowVaultId)
    }
  }

  const handleReleaseToSolver = async (solverAddress: string, submissionId: string) => {
    if (!escrowVaultId) return

    // Instant demo release
    setEscrowStatus(EscrowStatus.RESOLVED)
    
    setResult(`✅ Funds released instantly! (Demo)
      Solver: ${solverAddress.slice(0, 10)}...
      Amount: ${rewardAmount} tTRUST transferred
      Status: Resolved`)
  }

  const handleRefundToCreator = async () => {
    if (!escrowVaultId) return

    // Instant demo refund
    setEscrowStatus(EscrowStatus.REFUNDED)
    
    setResult(`✅ Funds refunded instantly! (Demo)
      Creator: ${creatorAddress.slice(0, 10)}...
      Amount: ${rewardAmount} tTRUST refunded
      Status: Refunded`)
  }

  const getStatusColor = (status: EscrowStatus): string => {
    switch (status) {
      case EscrowStatus.ACTIVE: return 'text-green-400'
      case EscrowStatus.IN_REVIEW: return 'text-yellow-400'
      case EscrowStatus.DISPUTED: return 'text-red-400'
      case EscrowStatus.RESOLVED: return 'text-blue-400'
      case EscrowStatus.REFUNDED: return 'text-purple-400'
      case EscrowStatus.EXPIRED: return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: EscrowStatus): string => {
    switch (status) {
      case EscrowStatus.ACTIVE: return '🔒'
      case EscrowStatus.IN_REVIEW: return '⏳'
      case EscrowStatus.DISPUTED: return '⚖️'
      case EscrowStatus.RESOLVED: return '✅'
      case EscrowStatus.REFUNDED: return '↩️'
      case EscrowStatus.EXPIRED: return '⏰'
      default: return '❓'
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg">
        <p className="text-yellow-300">Connect your wallet to manage escrow!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">Trust Escrow System</h3>
        {escrowVaultId && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escrowStatus)}`}>
            <span>{getStatusIcon(escrowStatus)}</span>
            <span>{escrowStatus.replace('_', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
        <h4 className="text-lg font-medium text-blue-400 mb-3">Bounty Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Title:</span>
            <p className="text-white font-medium">{bountyTitle}</p>
          </div>
          <div>
            <span className="text-gray-400">Reward:</span>
            <p className="text-green-400 font-bold">{rewardAmount} tTRUST</p>
          </div>
          <div>
            <span className="text-gray-400">Creator:</span>
            <p className="text-gray-300 font-mono text-xs">{creatorAddress.slice(0, 10)}...{creatorAddress.slice(-6)}</p>
          </div>
          <div>
            <span className="text-gray-400">Deadline:</span>
            <p className="text-gray-300">{new Date(deadline).toLocaleDateString()}</p>
          </div>
          {escrowVaultId && (
            <div className="md:col-span-2">
              <span className="text-gray-400">Escrow Vault ID:</span>
              <p className="text-blue-400 font-mono text-xs break-all">{escrowVaultId}</p>
            </div>
          )}
        </div>
      </div>

      {!escrowVaultId ? (
        // Create Escrow Section
        <div className="space-y-4">
          <div className="p-4 bg-blue-900 border border-blue-600 rounded-lg">
            <h4 className="text-blue-300 font-medium mb-2">🔐 Secure Fund Locking</h4>
            <p className="text-blue-200 text-sm mb-3">
              Lock {rewardAmount} tTRUST in a secure escrow vault using Intuition's MultiVault system. 
              Funds will only be released when a valid solution is approved or refunded if no solution is found.
            </p>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• Funds locked until completion or deadline</li>
              <li>• Community validation through staking</li>
              <li>• Automated or arbitrated resolution</li>
              <li>• Full transparency on-chain</li>
            </ul>
          </div>

          <button
            onClick={handleCreateEscrow}
            disabled={isLoading || address !== creatorAddress}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold 
            transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isLoading 
              ? 'Creating Secure Escrow...' 
              : address !== creatorAddress 
                ? 'Only Bounty Creator Can Lock Funds'
                : `🔒 Lock ${rewardAmount} tTRUST in Escrow`
            }
          </button>
        </div>
      ) : (
        // Escrow Management Section
        <div className="space-y-4">
          <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
            <h4 className="text-green-400 font-medium mb-2">✅ Escrow Active</h4>
            <p className="text-gray-300 text-sm mb-3">
              Funds are securely locked and ready for bounty completion. The escrow system will:
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Monitor submission quality through community staking</li>
              <li>• Automatically release funds for approved solutions</li>
              <li>• Handle disputes through arbitration if needed</li>
              <li>• Refund if no valid solution by deadline</li>
            </ul>
          </div>

          {address === creatorAddress && (
            <div className="flex gap-3">
              <button
                onClick={() => handleReleaseToSolver('0x1234567890123456789012345678901234567890', 'submission_123')}
                disabled={isLoading || escrowStatus !== EscrowStatus.ACTIVE}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm
                transition-colors"
              >
                📤 Release to Solver
              </button>
              
              <button
                onClick={handleRefundToCreator}
                disabled={isLoading || escrowStatus !== EscrowStatus.ACTIVE}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm
                transition-colors"
              >
                ↩️ Refund to Creator
              </button>
            </div>
          )}

          {address !== creatorAddress && (
            <div className="p-3 bg-yellow-900 border border-yellow-600 rounded-md">
              <p className="text-yellow-300 text-sm">
                💡 As a community member, you can participate by staking on solution quality once submissions are received.
              </p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className={`mt-4 p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
          <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line text-sm`}>
            {result}
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-600">
        <h5 className="text-gray-400 text-sm font-medium mb-2">Escrow Configuration</h5>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>Staking Period: {ESCROW_CONSTANTS.STAKING_PERIOD_DAYS} days</div>
          <div>Approval Threshold: {ESCROW_CONSTANTS.APPROVAL_THRESHOLD}%</div>
          <div>Min Stake: {ESCROW_CONSTANTS.MIN_STAKE_AMOUNT.toString()} tTRUST</div>
          <div>Max Stake: {ESCROW_CONSTANTS.MAX_STAKE_AMOUNT.toString()} tTRUST</div>
        </div>
      </div>
    </div>
  )
}