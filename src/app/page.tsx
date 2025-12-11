'use client'

import { CyberNav } from '@/components/CyberNav'

export default function HomePage() {
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
            Testing navigation - working simple version. Let me add features back step by step.
          </p>
        </div>
      </main>
    </div>
  )
}