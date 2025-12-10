import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for demo purposes
// In production, you'd use a database like MongoDB, PostgreSQL, etc.
let globalData: {
  submissions: any[]
  bounties: any[]
  stakes: { [key: string]: { forStake: string, againstStake: string } }
} = {
  submissions: [],
  bounties: [],
  stakes: {}
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