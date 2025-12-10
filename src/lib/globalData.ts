// Global data management for demo purposes
// This allows all users to see the same submissions and bounties

export interface GlobalSubmission {
  id: string
  bountyId: string
  bountyTitle: string
  submitterAddress: string
  portalUrl: string
  submittedAt: string
  forStake: string // Stored as string for JSON serialization
  againstStake: string
  status: any
  isLocal?: boolean
}

export interface GlobalBounty {
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

export interface GlobalData {
  submissions: GlobalSubmission[]
  bounties: GlobalBounty[]
  stakes: { [submissionId: string]: { forStake: string, againstStake: string } }
}

class GlobalDataManager {
  private baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://intuition-bounty-platform.vercel.app')

  async fetchGlobalData(): Promise<GlobalData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-data`)
      if (!response.ok) throw new Error('Failed to fetch global data')
      return await response.json()
    } catch (error) {
      console.error('Error fetching global data:', error)
      return { submissions: [], bounties: [], stakes: {} }
    }
  }

  async addSubmission(submission: GlobalSubmission): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'add_submission',
          data: submission
        })
      })
      return response.ok
    } catch (error) {
      console.error('Error adding submission:', error)
      return false
    }
  }

  async addBounty(bounty: GlobalBounty): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'add_bounty',
          data: bounty
        })
      })
      return response.ok
    } catch (error) {
      console.error('Error adding bounty:', error)
      return false
    }
  }

  async updateStake(submissionId: string, forStake: string, againstStake: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_stake',
          data: { submissionId, forStake, againstStake }
        })
      })
      return response.ok
    } catch (error) {
      console.error('Error updating stake:', error)
      return false
    }
  }

  async resetData(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset', data: {} })
      })
      return response.ok
    } catch (error) {
      console.error('Error resetting data:', error)
      return false
    }
  }
}

export const globalDataManager = new GlobalDataManager()