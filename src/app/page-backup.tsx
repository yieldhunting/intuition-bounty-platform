'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CyberNav } from '@/components/CyberNav'
import { VisitorStats } from '@/components/VisitorStats'
import { globalDataManager } from '@/lib/globalData'
import Link from 'next/link'

export default function Terminal() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState({ bounties: 0, submissions: 0 })
  const [displayStats, setDisplayStats] = useState({ bounties: 0, submissions: 0 })
  const [terminalText, setTerminalText] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Manual refresh function
  const refreshStats = async () => {
    setIsLoading(true)
    try {
      const globalData = await globalDataManager.fetchGlobalData()
      const newStats = {
        bounties: globalData.bounties?.length || 0,
        submissions: globalData.submissions?.length || 0
      }
      setStats(newStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('❌ Error refreshing stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load global stats once on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        console.log('📊 Loading global stats...')
        const globalData = await globalDataManager.fetchGlobalData()
        console.log('📊 Raw global data:', globalData)
        
        // Count only real bounties (not demo data)
        const realBounties = globalData.bounties?.filter(b => !b.id.startsWith('demo_')) || []
        const realSubmissions = globalData.submissions?.filter(s => !s.id.startsWith('demo_')) || []
        
        // Include demo data in total count for now since that's what users see
        const totalBounties = globalData.bounties?.length || 0
        const totalSubmissions = globalData.submissions?.length || 0
        
        const newStats = {
          bounties: totalBounties,
          submissions: totalSubmissions
        }
        
        console.log('📊 Stats breakdown:')
        console.log('- Total bounties:', totalBounties)
        console.log('- Real bounties:', realBounties.length) 
        console.log('- Total submissions:', totalSubmissions)
        console.log('- Real submissions:', realSubmissions.length)
        
        setStats(newStats)
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading stats:', error)
        // Set fallback stats on error
        setStats({ bounties: 0, submissions: 0 })
        setIsLoading(false)
      }
    }
    
    // Load stats once
    loadStats()
    
    // Refresh only when user manually triggers (you can add a refresh button later)
    // No automatic interval refresh
  }, [])

  // Terminal animation effect
  useEffect(() => {
    const messages = [
      'INITIALIZING INTUITION PROTOCOL...',
      'CONNECTING TO BLOCKCHAIN...',
      'LOADING BOUNTY MATRIX...',
      'SYSTEM READY ◉',
    ]
    
    let messageIndex = 0
    let charIndex = 0
    
    const typeWriter = () => {
      if (messageIndex < messages.length) {
        if (charIndex < messages[messageIndex].length) {
          setTerminalText(prev => prev + messages[messageIndex][charIndex])
          charIndex++
        } else {
          setTerminalText(prev => prev + '\n')
          messageIndex++
          charIndex = 0
        }
      }
    }
    
    const interval = setInterval(typeWriter, 100)
    return () => clearInterval(interval)
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Test function to add sample data (development only)
  const addTestData = async () => {
    try {
      // Add test bounty
      const testBounty = {
        id: `test_bounty_${Date.now()}`,
        title: 'Test Data Collection Bounty',
        description: 'Test bounty for verification',
        reward: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Data Collection',
        creator: 'Test Creator',
        creatorAddress: address || '0x1234567890123456789012345678901234567890',
        submissions: 0,
        totalStake: 0,
        atomId: `test_atom_${Date.now()}`,
        transactionHash: `0x${Date.now().toString(16)}`,
        createdAt: new Date().toISOString(),
        bountyType: 'data' as const
      }
      
      await globalDataManager.addBounty(testBounty)
      
      // Add test submission
      const testSubmission = {
        id: `test_submission_${Date.now()}`,
        bountyId: testBounty.id,
        bountyTitle: testBounty.title,
        submitterAddress: address || '0x1234567890123456789012345678901234567890',
        portalUrl: 'https://testnet.portal.intuition.systems/explore/list/0x123',
        submittedAt: new Date().toISOString(),
        forStake: '0',
        againstStake: '0',
        status: 'STAKING_PERIOD',
        isLocal: true
      }
      
      await globalDataManager.addSubmission(testSubmission)
      console.log('✅ Added test data successfully')
    } catch (error) {
      console.error('❌ Error adding test data:', error)
    }
  }

  // Animate counter changes
  useEffect(() => {
    const animateCounter = (key: 'bounties' | 'submissions') => {
      const start = displayStats[key]
      const end = stats[key]
      const duration = 1000 // 1 second animation
      const startTime = Date.now()
      
      const updateCounter = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const current = Math.floor(start + (end - start) * progress)
        
        setDisplayStats(prev => ({ ...prev, [key]: current }))
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter)
        }
      }
      
      if (start !== end) {
        updateCounter()
      }
    }
    
    animateCounter('bounties')
    animateCounter('submissions')
  }, [stats, displayStats])

  const QuickAction = ({ href, title, description, icon, color }: {
    href: string
    title: string
    description: string
    icon: string
    color: string
  }) => (
    <Link href={href} className="group">
      <div className="cyber-card p-6 h-full hover:bg-cyan-400/5 transition-all duration-300 group-hover:border-cyan-400">
        <div className={`text-3xl mb-4 ${color}`}>{icon}</div>
        <h3 className={`text-xl font-bold mb-2 ${color} cyber-glow group-hover:cyber-glow`}>
          {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
        <div className="mt-4 text-xs text-cyan-400 uppercase tracking-wider">
          ACCESS →
        </div>
      </div>
    </Link>
  )

  // Debug what's calling preventDefault on navigation links
  useEffect(() => {
    const originalPreventDefault = Event.prototype.preventDefault
    
    Event.prototype.preventDefault = function(this: Event) {
      const target = this.target as HTMLElement
      if (target?.closest && (target.closest('a') || target.closest('.nav-link'))) {
        console.log('🚫 preventDefault called on navigation link!', {
          event: this,
          target: this.target,
          type: this.type,
          stack: new Error().stack
        })
      }
      return originalPreventDefault.call(this)
    }

    return () => {
      Event.prototype.preventDefault = originalPreventDefault
    }
  }, [])

  return (
    <div className="min-h-screen scanlines">
      <CyberNav />
      {/* <VisitorStats /> - Temporarily disabled to test navigation */}
      
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Terminal Header */}
          <div className="cyber-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold neon-text-cyan cyber-glow font-orbitron mb-2">
                  INTUITION PROTOCOL
                </h1>
                <p className="text-cyan-300 text-lg font-rajdhani">
                  Decentralized Bounty Intelligence Network
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  SYSTEM TIME
                </div>
                <div className="text-cyan-400 font-mono">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="bg-black/40 border border-green-400/30 p-4 rounded font-mono text-sm">
              <div className="text-green-400">
                <span className="text-green-300">root@intuition:</span>
                <span className="text-white">~#</span>
              </div>
              <pre className="text-green-300 whitespace-pre-wrap leading-relaxed mt-2">
                {terminalText}
              </pre>
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="cyber-card p-6 text-center relative">
              <div className="text-4xl font-bold neon-text-cyan mb-2 transition-all duration-300">
                {isLoading ? (
                  <div className="animate-pulse">•••</div>
                ) : (
                  displayStats.bounties
                )}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Active Bounties</div>
              {lastUpdated && !isLoading && (
                <div className="text-xs text-cyan-500/70">
                  Live • Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              {isLoading && (
                <div className="text-xs text-cyan-500/70 animate-pulse">
                  Syncing...
                </div>
              )}
            </div>
            <div className="cyber-card p-6 text-center relative">
              <div className="text-4xl font-bold neon-text-green mb-2 transition-all duration-300">
                {isLoading ? (
                  <div className="animate-pulse">•••</div>
                ) : (
                  displayStats.submissions
                )}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Total Submissions</div>
              {lastUpdated && !isLoading && (
                <div className="text-xs text-green-500/70">
                  Live • Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              {isLoading && (
                <div className="text-xs text-green-500/70 animate-pulse">
                  Syncing...
                </div>
              )}
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-orange mb-2">
                {isConnected ? '◉' : '○'}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                {isConnected ? 'Connected' : 'Offline'}
              </div>
              <div className="text-xs text-orange-500/70">
                {isConnected ? 'Intuition Testnet' : 'Connect Wallet'}
              </div>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-pink mb-2">∞</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Trust Network</div>
              <div className="text-xs text-pink-500/70">
                Global Knowledge Graph
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <QuickAction
              href="/discover"
              title="DISCOVER"
              description="Explore active bounties from the Intuition Protocol network and find opportunities that match your expertise."
              icon="◎"
              color="neon-text-cyan"
            />
            <QuickAction
              href="/create"
              title="CREATE"
              description="Deploy new data bounties to the network and incentivize the community to gather valuable information."
              icon="⬢"
              color="neon-text-green"
            />
            <QuickAction
              href="/validate"
              title="VALIDATE"
              description="Stake on submissions and participate in the community validation process to earn rewards."
              icon="⬡"
              color="neon-text-pink"
            />
          </div>

          {/* About Section */}
          <div className="cyber-card p-8">
            <h2 className="text-2xl font-bold neon-text-cyan mb-6 font-orbitron">
              PROTOCOL OVERVIEW
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">NETWORK ARCHITECTURE</h3>
                <p className="text-gray-300 leading-relaxed text-sm mb-4">
                  A decentralized marketplace for data bounties, built natively on the Intuition Protocol.
                  All bounties are atoms, all relationships are triples, and all settlements are in TRUST.
                </p>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• Blockchain-native bounty creation</li>
                  <li>• Community-driven validation</li>
                  <li>• Automated dispute resolution</li>
                  <li>• Reputation-based scoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">PROTOCOL IMPACT</h3>
                <p className="text-gray-300 leading-relaxed text-sm mb-4">
                  Every interaction contributes to the global Intuition knowledge graph and generates 
                  protocol utilization, creating a self-reinforcing network of valuable data.
                </p>
                <div className="text-sm text-gray-400 space-y-2">
                  <div>• Global knowledge graph expansion</div>
                  <div>• Incentivized data collection</div>
                  <div>• Trust-based validation mechanisms</div>
                  <div>• Decentralized governance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}