import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for demo purposes
// In production, you'd use a database like MongoDB, PostgreSQL, etc.
let globalData: {
  submissions: any[]
  bounties: any[]
  stakes: { [key: string]: { forStake: string, againstStake: string } }
} = {
  submissions: [
    {
      id: 'demo_submission_1',
      bountyId: 'demo_bounty_1',
      bountyTitle: 'Crypto Market Data Collection',
      submitterAddress: '0x742d35Cc6635C0532925a3b8D427C5C9b1e6b9e0',
      portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x123',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      forStake: '50',
      againstStake: '10',
      status: 'STAKING_PERIOD',
      isLocal: true
    },
    {
      id: 'demo_submission_2',
      bountyId: 'demo_bounty_2',
      bountyTitle: 'DeFi Protocol Analysis',
      submitterAddress: '0x8a42Fc9c8B38DaCD4dcFeC47b51f2B3F7b82F3e1',
      portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x456',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      forStake: '75',
      againstStake: '25',
      status: 'STAKING_PERIOD',
      isLocal: true
    },
    {
      id: 'demo_submission_3',
      bountyId: 'demo_bounty_3',
      bountyTitle: 'Web3 Security Research',
      submitterAddress: '0x9f3Ea21B8c45F6b2Dc7B98F1A5c8E9D3B4F2A1C6',
      portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x789',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      forStake: '30',
      againstStake: '5',
      status: 'APPROVED',
      isLocal: true
    }
  ],
  bounties: [
    {
      id: 'demo_bounty_1',
      title: 'Crypto Market Data Collection',
      description: 'Collect comprehensive cryptocurrency market data from multiple exchanges for analysis',
      reward: 500,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Data Collection',
      creator: 'Research Team Alpha',
      creatorAddress: '0x1234567890123456789012345678901234567890',
      submissions: 1,
      totalStake: 60,
      atomId: 'demo_atom_1',
      transactionHash: '0xabc123def456789',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      bountyType: 'data' as const
    },
    {
      id: 'demo_bounty_2',
      title: 'DeFi Protocol Analysis',
      description: 'Analyze yield farming opportunities and risks across major DeFi protocols',
      reward: 750,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Financial Analysis',
      creator: 'DeFi Research Lab',
      creatorAddress: '0x2345678901234567890123456789012345678901',
      submissions: 1,
      totalStake: 100,
      atomId: 'demo_atom_2',
      transactionHash: '0xdef456ghi789012',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      bountyType: 'data' as const
    },
    {
      id: 'demo_bounty_3',
      title: 'Web3 Security Research',
      description: 'Identify and document common smart contract vulnerabilities in popular protocols',
      reward: 1000,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Security',
      creator: 'Security Collective',
      creatorAddress: '0x3456789012345678901234567890123456789012',
      submissions: 1,
      totalStake: 35,
      atomId: 'demo_atom_3',
      transactionHash: '0xghi789jkl012345',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      bountyType: 'data' as const
    },
    {
      id: 'demo_bounty_4',
      title: 'Reputation Assessment: Top DeFi Developers',
      description: 'Evaluate and rank the reputation of leading developers in the DeFi ecosystem',
      reward: 300,
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Reputation',
      creator: 'Community Validators',
      creatorAddress: '0x4567890123456789012345678901234567890123',
      submissions: 0,
      totalStake: 0,
      atomId: 'demo_atom_4',
      transactionHash: '0xjkl012mno345678',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bountyType: 'reputation' as const,
      targetAtom: 'DeFi Developer Collective',
      expertiseRequired: 'Blockchain Development',
      reputationCriteria: 'Code quality, community contributions, project impact'
    },
    {
      id: 'demo_bounty_5',
      title: 'Cross-Chain Bridge Analysis',
      description: 'Compare security models and fee structures across major cross-chain bridges',
      reward: 600,
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Infrastructure',
      creator: 'Bridge Research Initiative',
      creatorAddress: '0x5678901234567890123456789012345678901234',
      submissions: 0,
      totalStake: 0,
      atomId: 'demo_atom_5',
      transactionHash: '0xmno345pqr678901',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      bountyType: 'data' as const
    }
  ],
  stakes: {
    'demo_submission_1': { forStake: '50', againstStake: '10' },
    'demo_submission_2': { forStake: '75', againstStake: '25' },
    'demo_submission_3': { forStake: '30', againstStake: '5' }
  }
}

export async function GET() {
  return NextResponse.json(globalData)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    switch (type) {
      case 'add_submission':
        // Add submission to global state
        globalData.submissions.push(data)
        console.log('📝 Added global submission:', data.id, data.bountyTitle)
        break
        
      case 'add_bounty':
        // Add bounty to global state
        globalData.bounties.push(data)
        console.log('🏆 Added global bounty:', data.id, data.title)
        break
        
      case 'update_stake':
        // Update stake for a submission
        const { submissionId, forStake, againstStake } = data
        globalData.stakes[submissionId] = { forStake, againstStake }
        console.log('💰 Updated global stake:', submissionId)
        break
        
      case 'reset':
        // Reset all data (for development)
        globalData = { submissions: [], bounties: [], stakes: {} }
        console.log('🗑️ Reset global data')
        break
        
      default:
        return NextResponse.json({ error: 'Unknown action type' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, data: globalData })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}