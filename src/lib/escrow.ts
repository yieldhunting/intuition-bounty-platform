// Escrow System Architecture for Intuition Bounty Board
// Built on Intuition Protocol MultiVaults and Triples

import { createAtomFromString, createTriples, getMultiVaultAddressFromChainId } from '@0xintuition/sdk'

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
   * Update escrow status using triples
   */
  async updateEscrowStatus(escrowVaultId: string, newStatus: EscrowStatus): Promise<void> {
    try {
      // Create new status triple
      await createTriples(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        [{
          subject: escrowVaultId,
          predicate: await this._getOrCreatePredicate('status'),
          object: await this._getOrCreatePredicate(newStatus)
        }]
      )

      console.log(`✅ Escrow ${escrowVaultId} status updated to: ${newStatus}`)
    } catch (error) {
      console.error('❌ Status update failed:', error)
      throw error
    }
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
   * Stake for or against a solution
   */
  async createStake(position: Omit<StakePosition, 'atomId' | 'timestamp'>): Promise<StakePosition> {
    try {
      const stakeAtom = await createAtomFromString(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        `STAKE: ${position.position.toUpperCase()} | Submission: ${position.submissionId} | Amount: ${position.amount.toString()} | Staker: ${position.stakerId}`
      )

      // Create stake relationship triple
      await createTriples(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        [{
          subject: position.stakerId,
          predicate: await this._getStakePredicate(position.position),
          object: position.submissionId
        }]
      )

      const stake: StakePosition = {
        ...position,
        atomId: stakeAtom.state.termId,
        timestamp: new Date()
      }

      console.log(`✅ Stake created: ${position.position} ${position.amount.toString()}`)
      return stake

    } catch (error) {
      console.error('❌ Stake creation failed:', error)
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
   * Create an arbitration case for disputed submissions
   */
  async createArbitrationCase(
    bountyId: string, 
    submissionId: string, 
    arbitratorAddress: string
  ): Promise<ArbitrationCase> {
    try {
      const arbitrationAtom = await createAtomFromString(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        `ARBITRATION: ${bountyId} | Submission: ${submissionId} | Arbitrator: ${arbitratorAddress} | Created: ${new Date().toISOString()}`
      )

      // Create arbitration relationship triple
      await createTriples(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        [{
          subject: arbitratorAddress,
          predicate: 'arbitrates',
          object: submissionId
        }]
      )

      const arbitrationCase: ArbitrationCase = {
        id: arbitrationAtom.state.termId,
        bountyId,
        submissionId,
        arbitratorAddress,
        decision: 'pending',
        atomId: arbitrationAtom.state.termId
      }

      console.log('✅ Arbitration case created:', arbitrationCase.id)
      return arbitrationCase

    } catch (error) {
      console.error('❌ Arbitration case creation failed:', error)
      throw error
    }
  }

  /**
   * Submit arbitrator decision
   */
  async submitDecision(
    arbitrationCaseId: string,
    decision: 'approve' | 'reject',
    reasoning?: string
  ): Promise<string> {
    try {
      const decisionAtom = await createAtomFromString(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        `DECISION: ${arbitrationCaseId} | Decision: ${decision.toUpperCase()} | Reasoning: ${reasoning || 'No reasoning provided'} | Decided: ${new Date().toISOString()}`
      )

      // Create decision relationship triple
      await createTriples(
        { walletClient: this.walletClient, publicClient: this.publicClient, address: this.multivaultAddress },
        [{
          subject: arbitrationCaseId,
          predicate: 'decided_as',
          object: decision
        }]
      )

      console.log(`✅ Arbitration decision submitted: ${decision}`)
      return decisionAtom.transactionHash

    } catch (error) {
      console.error('❌ Decision submission failed:', error)
      throw error
    }
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