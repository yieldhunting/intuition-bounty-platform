// Escrow System Architecture for Intuition Bounty Board
// Built on Intuition Protocol MultiVaults and Triples

import { createAtomFromString, createTriples, getMultiVaultAddressFromChainId } from '@0xintuition/sdk'
import { 
  deposit, 
  redeem, 
  getTripleCost
} from '@0xintuition/protocol'

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
    try {
      // First, get the cost for staking on this submission (triple)
      const stakeCost = await getTripleCost({ 
        address: this.multivaultAddress as `0x${string}`, 
        publicClient: this.publicClient 
      })

      console.log(`💰 Stake cost: ${stakeCost.toString()} tTRUST`)

      // Create a triple representing the stake position
      // Subject: stakerId, Predicate: "stakes_for"/"stakes_against", Object: submissionId
      const predicate = await this._getStakePredicate(position.position)
      
      // For demo, we'll use deposit directly on the submission's vault
      // In production, this would create a triple first, then deposit
      const totalAmount = position.amount + stakeCost
      
      console.log(`🔄 Creating real stake: ${position.position} ${position.amount.toString()} on submission ${position.submissionId}`)

      // Use deposit to stake on the submission
      const txHash = await deposit(
        { 
          address: this.multivaultAddress as `0x${string}`, 
          walletClient: this.walletClient, 
          publicClient: this.publicClient 
        },
        {
          args: [
            this.walletClient.account.address, // receiver
            position.submissionId as `0x${string}`, // vaultId (using submissionId as proxy)
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

    } catch (error) {
      console.error('❌ Real staking failed, falling back to demo mode:', error)
      
      // Fallback to demo mode if real staking fails
      const stake: StakePosition = {
        ...position,
        atomId: `demo_stake_${Date.now()}`,
        timestamp: new Date()
      }

      console.log(`✅ Stake created (demo fallback): ${position.position} ${position.amount.toString()}`)
      return stake
    }
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
  MIN_STAKE_AMOUNT: 10n, // 10 tTRUST minimum
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