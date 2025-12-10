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
      console.log('📊 Fetching global data from:', `${this.baseUrl}/api/global-data`)
      
      const response = await fetch(`${this.baseUrl}/api/global-data`, {
        cache: 'no-store' // Ensure fresh data
      })
      
      if (!response.ok) {
        console.warn('Failed to fetch global data:', response.status, response.statusText)
        throw new Error(`Failed to fetch global data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Base data fetched - Bounties:', data.bounties?.length || 0, 'Submissions:', data.submissions?.length || 0)
      
      // Try to fetch GraphQL data for additional bounties
      try {
        console.log('📊 Attempting to fetch GraphQL data...')
        const { graphqlClient, GET_BOUNTIES_QUERY, transformAtomToBounty, groupSubmissionsByBounty } = await import('./graphql')
        
        const graphqlResponse = await graphqlClient.request(GET_BOUNTIES_QUERY, { limit: 100 })
        
        if (graphqlResponse?.atoms) {
          const graphqlBounties = graphqlResponse.atoms
            .map(transformAtomToBounty)
            .filter((bounty: any) => bounty !== null)
          
          const graphqlSubmissions = groupSubmissionsByBounty(graphqlResponse.atoms)
          const flatSubmissions = Object.values(graphqlSubmissions).flat()
          
          console.log('📊 GraphQL data fetched - Bounties:', graphqlBounties.length, 'Submissions:', flatSubmissions.length)
          
          // Combine with global storage data (deduplicate by ID)
          const combinedBounties = [...data.bounties]
          const bountyIds = new Set(data.bounties.map((b: any) => b.id))
          
          graphqlBounties.forEach((bounty: any) => {
            if (!bountyIds.has(bounty.id)) {
              combinedBounties.push(bounty)
            }
          })
          
          const combinedSubmissions = [...data.submissions]
          const submissionIds = new Set(data.submissions.map((s: any) => s.id))
          
          flatSubmissions.forEach((sub: any) => {
            const submissionData = {
              id: sub.id || `graphql_${Date.now()}_${Math.random()}`,
              bountyId: sub.bountyId,
              bountyTitle: sub.title || 'GraphQL Submission',
              submitterAddress: sub.submitter || 'Unknown',
              portalUrl: sub.portalUrl || '',
              submittedAt: sub.submittedAt || new Date().toISOString(),
              forStake: '0',
              againstStake: '0',
              status: 'STAKING_PERIOD',
              isLocal: false
            }
            
            if (!submissionIds.has(submissionData.id)) {
              combinedSubmissions.push(submissionData)
            }
          })
          
          const result = {
            submissions: combinedSubmissions,
            bounties: combinedBounties,
            stakes: data.stakes
          }
          
          console.log('📊 Combined data - Total Bounties:', result.bounties.length, 'Total Submissions:', result.submissions.length)
          return result
        }
      } catch (graphqlError) {
        console.warn('GraphQL fetch failed (using base data):', graphqlError)
      }
      
      console.log('📊 Using base data only - Bounties:', data.bounties?.length || 0, 'Submissions:', data.submissions?.length || 0)
      return data
      
    } catch (error) {
      console.error('❌ Error fetching global data:', error)
      // Return minimal fallback data instead of empty
      return { 
        submissions: [], 
        bounties: [], 
        stakes: {} 
      }
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