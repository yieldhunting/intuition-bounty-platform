 import { GraphQLClient } from 'graphql-request'

  // Correct testnet GraphQL endpoint from docs
  const GRAPHQL_ENDPOINT = 'https://testnet.intuition.sh/v1/graphql'

  export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Simplified GraphQL query without offset and with correct syntax
    export const GET_BOUNTIES_QUERY = `
    query GetBounties($limit: Int) {
      atoms(
        limit: $limit
        order_by: { created_at: desc }
      ) {
        term_id
        data
        label
        creator_id
        created_at
        transaction_hash
      }
    }
  `

 // Fixed helper function to parse bounty string with newlines
  export function parseBountyString(bountyData: string) {
    if (!bountyData || (!bountyData.includes('DATA_BOUNTY:') && !bountyData.includes('REPUTATION_BOUNTY:') && !bountyData.includes('BOUNTY:'))) {
      return null
    }

    // Clean up newlines and extra whitespace first
    const cleanedData = bountyData.replace(/\n\s*/g, ' ').trim()
    const parts = cleanedData.split(' | ')

    if (parts.length < 4) {
      console.log('Not enough parts:', parts)
      return null
    }

    try {
      // Detect bounty type
      const isReputationBounty = cleanedData.includes('REPUTATION_BOUNTY:')
      const bountyTypePrefix = isReputationBounty ? 'REPUTATION_BOUNTY: ' : 
                              cleanedData.includes('DATA_BOUNTY:') ? 'DATA_BOUNTY: ' : 'BOUNTY: '
      
      if (isReputationBounty) {
        // Parse reputation bounty: REPUTATION_BOUNTY: title | Target: target | Expertise: expertise | Criteria: criteria | Reward: X tTRUST | Deadline: date
        const title = parts[0].replace('REPUTATION_BOUNTY: ', '').trim()
        const targetMatch = parts[1]?.match(/Target: (.+)/) || ['', '']
        const expertiseMatch = parts[2]?.match(/Expertise: (.+)/) || ['', 'general']
        const criteriaMatch = parts[3]?.match(/Criteria: (.+)/) || ['', '']
        const rewardMatch = parts[4]?.match(/Reward: ([\d.]+) tTRUST/) || parts[5]?.match(/Reward: ([\d.]+) tTRUST/)
        const deadlineMatch = parts[5]?.match(/Deadline: (.+)/) || parts[6]?.match(/Deadline: (.+)/)

        if (!rewardMatch || !deadlineMatch) {
          console.log('Missing reward or deadline for reputation bounty:', { rewardMatch, deadlineMatch })
          return null
        }

        return {
          title,
          description: criteriaMatch[1] || title,
          reward: parseFloat(rewardMatch[1]),
          deadline: deadlineMatch[1].trim(),
          category: 'reputation',
          bountyType: 'reputation' as const,
          targetAtom: targetMatch[1],
          expertiseRequired: expertiseMatch[1],
          reputationCriteria: criteriaMatch[1]
        }
      } else {
        // Parse data bounty
        const title = parts[0].replace(bountyTypePrefix, '').trim()
        const description = parts[1].trim()
        const rewardMatch = parts[2].match(/Reward: ([\d.]+) tTRUST/)
        const deadlineMatch = parts[3].match(/Deadline: (.+)/)
        const categoryMatch = parts[4]?.match(/Category: (.+)/) || ['', 'data']

      if (!rewardMatch || !deadlineMatch) {
        console.log('Missing reward or deadline:', { rewardMatch, deadlineMatch })
        return null
      }

        return {
          title,
          description,
          reward: parseFloat(rewardMatch[1]),
          deadline: deadlineMatch[1].trim(),
          category: categoryMatch[1]?.trim() || 'data',
          bountyType: 'data' as const
        }
      }

    } catch (error) {
      console.error('Error parsing bounty string:', error)
      return null
    }
  }


  // Transform raw atom data into bounty format
  export function transformAtomToBounty(atom: any) {
    const parsedBounty = parseBountyString(atom.data || atom.label || '')

    if (!parsedBounty) {
      return null
    }

    return {
      id: atom.term_id,
      title: parsedBounty.title,
      description: parsedBounty.description,
      reward: parsedBounty.reward,
      deadline: parsedBounty.deadline,
      category: parsedBounty.category,
      creator: atom.creator?.label || atom.creator_id || 'Unknown',
      creatorAddress: atom.creator_id,
      submissions: 0,
      totalStake: 0, // Simplified since we removed the vault query
      atomId: atom.term_id,
      transactionHash: atom.transaction_hash,
      createdAt: atom.created_at,
      bountyType: parsedBounty.bountyType,
      targetAtom: parsedBounty.targetAtom,
      expertiseRequired: parsedBounty.expertiseRequired,
      reputationCriteria: parsedBounty.reputationCriteria
    }
  }

 // Updated function to parse simple submission string
  export function parseSubmissionString(submissionData: string) {
    if (!submissionData || !submissionData.includes('SUBMISSION:')) {
      return null
    }

    // Clean up newlines and extra whitespace first
    const cleanedData = submissionData.replace(/\n\s*/g, ' ').trim()

    try {
      // Parse: "SUBMISSION: https://portal.url | Bounty: bountyId | Title: bountyTitle"
      const parts = cleanedData.split(' | ')

      if (parts.length < 2) {
        return null
      }

      const portalUrl = parts[0].replace('SUBMISSION: ', '').trim()
      const bountyMatch = parts[1]?.match(/Bounty: (.+)/)
      const titleMatch = parts[2]?.match(/Title: (.+)/)

      if (!bountyMatch || !portalUrl) {
        return null
      }

      return {
        portalUrl: portalUrl,
        bountyId: bountyMatch[1],
        title: titleMatch?.[1] || 'Solution'
      }
    } catch (error) {
      console.error('Error parsing submission string:', error)
      return null
    }
  }

 // Updated function to transform submission atoms
  export function transformAtomToSubmission(atom: any) {
    const parsedSubmission = parseSubmissionString(atom.data || atom.label || '')

    if (!parsedSubmission) {
      return null
    }

    return {
      id: atom.term_id,
      portalUrl: parsedSubmission.portalUrl,
      bountyId: parsedSubmission.bountyId,
      title: parsedSubmission.title,
      submitter: atom.creator_id || 'Unknown',
      submittedAt: atom.created_at,
      transactionHash: atom.transaction_hash
    }
  }


  // Function to group submissions by bounty
  export function groupSubmissionsByBounty(atoms: any[]) {
    const submissions = atoms
      .map(transformAtomToSubmission)
      .filter(submission => submission !== null)

    // Group by bountyId
    const grouped: { [bountyId: string]: any[] } = {}
    submissions.forEach(submission => {
      if (!grouped[submission.bountyId]) {
        grouped[submission.bountyId] = []
      }
      grouped[submission.bountyId].push(submission)
    })

    return grouped
  }
