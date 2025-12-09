// Escrow System Architecture for Intuition Bounty Board
// Built on Intuition Protocol MultiVaults and Triples

import { createAtomFromString, createTriples, getMultiVaultAddressFromChainId } from '@0xintuition/sdk'
import { 
  deposit, 
  redeem, 
  getTripleCost
} from '@0xintuition/protocol'

// ==================== UTILITY FUNCTIONS ====================

/**
 * Extract atom ID from Portal URL
 */
export function extractAtomIdFromPortalUrl(portalUrl: string): string | null {
  try {
    console.log(`🔍 Parsing Portal URL: ${portalUrl}`)
    
    // Portal URLs contain TWO hexadecimal addresses separated by a dash:
    // https://testnet.portal.intuition.systems/explore/list/0xFIRST_ADDRESS-0xSECOND_ADDRESS
    // We want the SECOND one (object atom), not the first one
    
    const patterns = [
      // Match the SECOND hex address after the dash - this is the object atom we want to stake on
      // Format: /list/0xFIRST-0xSECOND where we want SECOND
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-0x([0-9a-fA-F]{64})(?:\/|$|#|\?)/, // Second address, 64 chars
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-([0-9a-fA-F]{64})(?:\/|$|#|\?)/, // Second address without 0x, 64 chars
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-0x([0-9a-fA-F]{40,})(?:\/|$|#|\?)/, // Second address, 40+ chars  
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-([0-9a-fA-F]{40,})(?:\/|$|#|\?)/, // Second address without 0x, 40+ chars
      
      // More flexible patterns for different lengths
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-0x([0-9a-fA-F]{32,})(?:\/|$|#|\?)/, // 32+ chars
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-([0-9a-fA-F]{32,})(?:\/|$|#|\?)/, // 32+ chars without 0x
      
      // Even more flexible - any hex after dash
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-0x([0-9a-fA-F]{8,})(?:\/|$|#|\?)/, // 8+ chars
      /\/(?:explore\/)?list\/0x[0-9a-fA-F]+-([0-9a-fA-F]{8,})(?:\/|$|#|\?)/, // 8+ chars without 0x
    ]
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i]
      const match = portalUrl.match(pattern)
      console.log(`  Pattern ${i + 1}: ${pattern} -> ${match ? `Match: ${match[1]}` : 'No match'}`)
      
      if (match) {
        const extractedId = match[1]
        
        // For real Portal URLs, use the extracted ID directly
        let atomId: string
        if (extractedId.length >= 32) {
          // Real atom ID - use as is
          atomId = extractedId.startsWith('0x') ? extractedId : `0x${extractedId}`
        } else {
          // Test ID with ellipses - expand it
          atomId = expandTestAtomId(extractedId)
        }
          
        console.log(`✅ Extracted SECOND address (object atom): ${atomId}`)
        console.log(`🎯 This is the object atom we want to stake on (from after the dash)`)
        return atomId
      }
    }
    
    // Emergency fallback - find hex strings and take the SECOND one (after dash)
    console.log(`⚠️ Standard patterns failed, trying emergency fallback...`)
    const emergencyPattern = /0x[0-9a-fA-F]{20,}/g
    const allMatches = portalUrl.match(emergencyPattern)
    if (allMatches && allMatches.length >= 2) {
      // Take the SECOND hex string (index 1)
      const secondMatch = allMatches[1].replace('0x', '')
      const atomId = `0x${secondMatch}`
      console.log(`🔧 Emergency fallback found: ${atomId} (using SECOND hex string in URL)`)
      console.log(`🎯 Assuming this is the object atom we want to stake on`)
      return atomId
    } else if (allMatches && allMatches.length === 1) {
      // Only one hex string found, use it
      const onlyMatch = allMatches[0].replace('0x', '')
      const atomId = `0x${onlyMatch}`
      console.log(`🔧 Emergency fallback found: ${atomId} (only one hex string in URL)`)
      console.log(`⚠️ Expected two hex strings but found only one`)
      return atomId
    }
    
    console.log(`❌ No hex addresses found anywhere in URL: ${portalUrl}`)
    console.log(`📝 URL structure analysis:`)
    console.log(`   Full URL: ${portalUrl}`)
    console.log(`   Contains /list/: ${portalUrl.includes('/list/')}`)
    console.log(`   Contains 0x: ${portalUrl.includes('0x')}`)
    return null
  } catch (error) {
    console.error('Error extracting atom ID from Portal URL:', error)
    return null
  }
}

// Helper function to expand test atom IDs to valid format
function expandTestAtomId(testId: string): string {
  // Remove ellipses and ensure 0x prefix
  const cleanId = testId.replace(/\.{3}$/, '').replace(/^0x/, '')
  
  // Pad to 64 characters (32 bytes) for a valid atom ID
  const paddedId = cleanId.padEnd(64, '0')
  
  return `0x${paddedId}`
}

// ==================== TYPES & INTERFACES ====================

export interface EscrowConfig {
  bountyId: string
  creatorAddress: string
  rewardAmount: bigint
  escrowVaultId?: string
  deadline: Date
  status: EscrowStatus
  createdAt: Date
}

export enum EscrowStatus {
  ACTIVE = 'active',
  IN_REVIEW = 'in_review', 
  DISPUTED = 'disputed',
  RESOLVED = 'resolved',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

export interface Submission {
  id: string
  bountyId: string
  submitterAddress: string
  portalUrl: string
  atomId: string
  submittedAt: Date
  stakingPeriodEnd: Date
  forStake: bigint
  againstStake: bigint
  status: SubmissionStatus
  isLocal?: boolean
}

export enum SubmissionStatus {
  PENDING_REVIEW = 'pending_review',
  STAKING_PERIOD = 'staking_period',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISPUTED = 'disputed'
}

export interface StakePosition {
  stakerId: string
  submissionId: string
  portalUrl?: string  // Add portal URL to extract atom ID from
  amount: bigint
  position: 'for' | 'against'
  timestamp: Date
  atomId: string
}

export interface ArbitrationCase {
  id: string
  bountyId: string
  submissionId: string
  arbitratorAddress: string
  decision: 'approve' | 'reject' | 'pending'
  reasoning?: string
  decidedAt?: Date
  atomId: string
}

// ==================== ESCROW MANAGEMENT ====================

export class EscrowManager {
  private walletClient: any
  private publicClient: any
  private multivaultAddress: string

  constructor(walletClient: any, publicClient: any, chainId: number) {
    this.walletClient = walletClient
    this.publicClient = publicClient
    this.multivaultAddress = getMultiVaultAddressFromChainId(chainId)
  }

  /**
   * Create escrow vault for a bounty and lock funds
   */
  async createEscrow(config: Omit<EscrowConfig, 'escrowVaultId' | 'createdAt' | 'status'>): Promise<EscrowConfig> {
    // Instant demo escrow creation - no delays, no complexity
    const mockEscrowId = `demo_escrow_${Date.now()}`
    
    const escrowConfig: EscrowConfig = {
      ...config,
      escrowVaultId: mockEscrowId,
      status: EscrowStatus.ACTIVE,
      createdAt: new Date()
    }

    return escrowConfig
  }

  /**
   * Update escrow status using triples (Demo mode - simplified)
   */
  async updateEscrowStatus(escrowVaultId: string, newStatus: EscrowStatus): Promise<void> {
    // Demo mode - just log the status update
    console.log(`✅ Escrow ${escrowVaultId} status updated to: ${newStatus} (Demo)`)
  }

  /**
   * Release escrow funds to solver
   */
  async releaseToSolver(escrowVaultId: string, solverAddress: string, submissionId: string): Promise<string> {
    try {
      // Demo mode - simulate release
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`
      
      console.log(`✅ Escrow released to solver (demo): ${solverAddress}`)
      return mockTxHash

    } catch (error) {
      console.error('❌ Release failed:', error)
      throw error
    }
  }

  /**
   * Refund escrow to creator (if no valid solution or expired)
   */
  async refundToCreator(escrowVaultId: string, creatorAddress: string): Promise<string> {
    try {
      // Demo mode - simulate refund
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`
      
      console.log(`✅ Escrow refunded to creator (demo): ${creatorAddress}`)
      return mockTxHash

    } catch (error) {
      console.error('❌ Refund failed:', error)
      throw error
    }
  }

  private async _getOrCreatePredicate(value: string): Promise<string> {
    // For now, return the string - in full implementation, this would
    // check for existing atoms or create new ones for predicates
    return value
  }
}

// ==================== STAKING SYSTEM ====================

export class StakingManager {
  private walletClient: any
  private publicClient: any
  private multivaultAddress: string

  constructor(walletClient: any, publicClient: any, chainId: number) {
    this.walletClient = walletClient
    this.publicClient = publicClient
    this.multivaultAddress = getMultiVaultAddressFromChainId(chainId)
  }

  /**
   * Stake for or against a solution using real blockchain calls
   */
  async createStake(position: Omit<StakePosition, 'atomId' | 'timestamp'>): Promise<StakePosition> {
    // Extract atom ID from portal URL if provided
    let targetAtomId: string | null = null
    
    if (position.portalUrl) {
      targetAtomId = extractAtomIdFromPortalUrl(position.portalUrl)
      console.log(`🔗 Extracted atom ID from Portal URL: ${targetAtomId}`)
    }
    
    if (!targetAtomId) {
      throw new Error('No valid atom ID found in portal URL - please check the URL format')
    }

    // Get the cost for staking on this atom
    const stakeCost = await getTripleCost({ 
      address: this.multivaultAddress as `0x${string}`, 
      publicClient: this.publicClient 
    })

    console.log(`💰 Stake cost: ${stakeCost.toString()} tTRUST`)

    const totalAmount = position.amount + stakeCost
    
    console.log(`🔄 Creating REAL stake: ${position.position} ${position.amount.toString()} on atom ${targetAtomId}`)
    console.log(`📊 Staking on SECOND address from Portal URL (object atom)`)
    console.log(`🎯 Target: OBJECT ATOM (the address after the dash in URL)`)
    console.log(`💰 Total stake amount: ${totalAmount.toString()} (${position.amount.toString()} + ${stakeCost.toString()} cost)`)

    // Use deposit to stake on the Portal list atom
    const txHash = await deposit(
      { 
        address: this.multivaultAddress as `0x${string}`, 
        walletClient: this.walletClient, 
        publicClient: this.publicClient 
      },
      {
        args: [
          this.walletClient.account.address, // receiver
          targetAtomId as `0x${string}`, // vaultId (Portal list atom ID)
          BigInt(1), // curveId (default curve)
          BigInt(0), // minShares (accept any amount)
        ],
        value: totalAmount
      }
    )

    console.log(`🔄 Transaction submitted: ${txHash}`)

    // Wait for transaction confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash })
    
    if (receipt.status === 'reverted') {
      throw new Error('Staking transaction reverted')
    }

    // For now, use a simple ID until we implement event parsing
    const stakeAtomId = `stake_${Date.now()}`

    const stake: StakePosition = {
      ...position,
      atomId: stakeAtomId.toString(),
      timestamp: new Date()
    }

    console.log(`✅ Real stake created successfully! Transaction: ${txHash}`)
    return stake
  }

  /**
   * Redeem/withdraw a stake using real blockchain calls
   */
  async redeemStake(stakePosition: StakePosition): Promise<string> {
    try {
      console.log(`🔄 Redeeming real stake: ${stakePosition.atomId}`)

      // Use redeem to withdraw the stake
      const txHash = await redeem(
        { 
          address: this.multivaultAddress as `0x${string}`, 
          walletClient: this.walletClient, 
          publicClient: this.publicClient 
        },
        {
          args: [
            this.walletClient.account.address, // receiver
            stakePosition.submissionId as `0x${string}`, // vaultId
            BigInt(1), // curveId (default curve)
            stakePosition.amount, // shares to redeem
            BigInt(0), // minAssets (accept any amount)
          ]
        }
      )

      console.log(`🔄 Redemption transaction submitted: ${txHash}`)

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash })
      
      if (receipt.status === 'reverted') {
        throw new Error('Stake redemption transaction reverted')
      }

      console.log(`✅ Real stake redeemed successfully! Transaction: ${txHash}`)
      return txHash

    } catch (error) {
      console.error('❌ Real stake redemption failed:', error)
      throw error
    }
  }

  /**
   * Calculate stake ratios for a submission
   */
  calculateStakeRatio(forStake: bigint, againstStake: bigint): { 
    forRatio: number, 
    againstRatio: number, 
    total: bigint,
    recommendation: 'approve' | 'reject' | 'disputed' 
  } {
    const total = forStake + againstStake
    
    if (total === 0n) {
      return { forRatio: 0, againstRatio: 0, total: 0n, recommendation: 'disputed' }
    }

    const forRatio = Number(forStake * 100n / total)
    const againstRatio = Number(againstStake * 100n / total)

    // Define approval threshold (e.g., 70% for approval)
    const APPROVAL_THRESHOLD = 70
    const REJECTION_THRESHOLD = 70

    let recommendation: 'approve' | 'reject' | 'disputed'
    
    if (forRatio >= APPROVAL_THRESHOLD) {
      recommendation = 'approve'
    } else if (againstRatio >= REJECTION_THRESHOLD) {
      recommendation = 'reject'  
    } else {
      recommendation = 'disputed'
    }

    return { forRatio, againstRatio, total, recommendation }
  }

  private async _getStakePredicate(position: 'for' | 'against'): Promise<string> {
    return position === 'for' ? 'stakes_for' : 'stakes_against'
  }

  private async _getOrCreatePredicate(value: string): Promise<string> {
    return value
  }
}

// ==================== ARBITRATION SYSTEM ====================

export class ArbitrationManager {
  private walletClient: any
  private publicClient: any
  private multivaultAddress: string

  constructor(walletClient: any, publicClient: any, chainId: number) {
    this.walletClient = walletClient
    this.publicClient = publicClient
    this.multivaultAddress = getMultiVaultAddressFromChainId(chainId)
  }

  /**
   * Create an arbitration case for disputed submissions (Demo mode)
   */
  async createArbitrationCase(
    bountyId: string, 
    submissionId: string, 
    arbitratorAddress: string
  ): Promise<ArbitrationCase> {
    // Demo mode - create mock arbitration case
    const arbitrationCase: ArbitrationCase = {
      id: `demo_arbitration_${Date.now()}`,
      bountyId,
      submissionId,
      arbitratorAddress,
      decision: 'pending',
      atomId: `demo_arbitration_${Date.now()}`
    }

    console.log('✅ Arbitration case created (demo):', arbitrationCase.id)
    return arbitrationCase
  }

  /**
   * Submit arbitrator decision (Demo mode)
   */
  async submitDecision(
    arbitrationCaseId: string,
    decision: 'approve' | 'reject',
    reasoning?: string
  ): Promise<string> {
    // Demo mode - return mock transaction hash
    const mockTxHash = `0x${Date.now().toString(16)}demo`
    
    console.log(`✅ Arbitration decision submitted (demo): ${decision}`)
    return mockTxHash
  }
}

// ==================== CONSTANTS ====================

export const ESCROW_CONSTANTS = {
  STAKING_PERIOD_DAYS: 7,
  APPROVAL_THRESHOLD: 70,
  REJECTION_THRESHOLD: 70,
  ARBITRATOR_FEE_PERCENT: 5,
  MIN_STAKE_AMOUNT: 1n, // 1 tTRUST minimum
  MAX_STAKE_AMOUNT: 1000n // 1000 tTRUST maximum
} as const

export const ESCROW_EVENTS = {
  CREATED: 'escrow_created',
  STATUS_UPDATED: 'escrow_status_updated', 
  FUNDS_RELEASED: 'escrow_funds_released',
  FUNDS_REFUNDED: 'escrow_funds_refunded',
  STAKE_CREATED: 'stake_created',
  ARBITRATION_STARTED: 'arbitration_started',
  ARBITRATION_DECIDED: 'arbitration_decided'
} as const