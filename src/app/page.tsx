'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CyberNav } from '@/components/CyberNav'

export default function HomePage() {
  const { isConnected } = useAccount()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [terminalText, setTerminalText] = useState('')
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Terminal animation effect
  useEffect(() => {
    const messages = [
      'INITIALIZING INTUITION PROTOCOL...',
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
  
  return (
    <div className="min-h-screen">
      <CyberNav />
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold neon-text-cyan cyber-glow font-orbitron mb-4">
            INTUITION PROTOCOL
          </h1>
          <p className="text-cyan-300 text-lg font-rajdhani mb-8">
            Decentralized Bounty Intelligence Network
          </p>
          <p className="text-gray-300">
            Testing navigation - now with useState and useEffect hooks.
          </p>
          <p className="text-cyan-400 mt-4">
            Wallet Status: {isConnected ? 'Connected' : 'Not Connected'}
          </p>
          <p className="text-green-400 mt-2">
            Current Time: {currentTime.toLocaleTimeString()}
          </p>
          <div className="mt-4 p-4 bg-black/40 border border-green-400/30 rounded font-mono text-sm">
            <pre className="text-green-300 whitespace-pre-wrap">{terminalText}</pre>
          </div>
        </div>
      </main>
    </div>
  )
}