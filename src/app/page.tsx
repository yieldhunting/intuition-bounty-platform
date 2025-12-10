'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CyberNav } from '@/components/CyberNav'
import { globalDataManager } from '@/lib/globalData'
import Link from 'next/link'

export default function Terminal() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState({ bounties: 0, submissions: 0 })
  const [terminalText, setTerminalText] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Load global stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const globalData = await globalDataManager.fetchGlobalData()
        setStats({
          bounties: globalData.bounties.length,
          submissions: globalData.submissions.length
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    loadStats()
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

  return (
    <div className="min-h-screen scanlines cyber-grid">
      <CyberNav />
      
      <main className="pt-20 px-6 pb-12">
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
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-cyan mb-2">{stats.bounties}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Active Bounties</div>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-green mb-2">{stats.submissions}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Submissions</div>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-orange mb-2">
                {isConnected ? '◉' : '○'}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                {isConnected ? 'Connected' : 'Offline'}
              </div>
            </div>
            <div className="cyber-card p-6 text-center">
              <div className="text-3xl font-bold neon-text-pink mb-2">∞</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Trust Network</div>
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