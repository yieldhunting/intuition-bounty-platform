'use client'

import { useEffect, useState } from 'react'

interface VisitorData {
  totalVisits: number
  uniqueVisitors: Set<string>
  lastVisit: string
  activeBounties: number
  submissions: number
}

export function VisitorStats() {
  const [stats, setStats] = useState<VisitorData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Track current visit
    const trackVisit = async () => {
      try {
        // Get or create visitor ID
        let visitorId = localStorage.getItem('visitorId')
        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('visitorId', visitorId)
        }

        // Get existing stats from localStorage
        const storedStats = localStorage.getItem('visitorStats')
        const currentStats: VisitorData = storedStats ? JSON.parse(storedStats) : {
          totalVisits: 0,
          uniqueVisitors: new Set(),
          lastVisit: new Date().toISOString(),
          activeBounties: 0,
          submissions: 0
        }

        // Update stats
        currentStats.totalVisits++
        currentStats.uniqueVisitors = new Set([...Array.from(currentStats.uniqueVisitors), visitorId])
        currentStats.lastVisit = new Date().toISOString()

        // Fetch current bounty/submission counts
        try {
          const response = await fetch('/api/global-data')
          const data = await response.json()
          currentStats.activeBounties = data.bounties?.length || 0
          currentStats.submissions = data.submissions?.length || 0
        } catch (error) {
          console.error('Error fetching global data:', error)
        }

        // Save updated stats
        localStorage.setItem('visitorStats', JSON.stringify({
          ...currentStats,
          uniqueVisitors: Array.from(currentStats.uniqueVisitors)
        }))

        setStats(currentStats)
      } catch (error) {
        console.error('Error tracking visit:', error)
      }
    }

    trackVisit()

    // Add keyboard shortcut to toggle stats (Ctrl+Shift+S)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible || !stats) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 cyber-card p-4 min-w-[250px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold neon-text-cyan">VISITOR STATS</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-cyan-400 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Visits:</span>
          <span className="text-cyan-400 font-mono">{stats.totalVisits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Unique Visitors:</span>
          <span className="text-green-400 font-mono">{stats.uniqueVisitors.size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Active Bounties:</span>
          <span className="text-orange-400 font-mono">{stats.activeBounties}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Submissions:</span>
          <span className="text-pink-400 font-mono">{stats.submissions}</span>
        </div>
        <div className="border-t border-cyan-400/30 pt-2 mt-2">
          <div className="text-gray-500 text-xs">
            Last Visit: {new Date(stats.lastVisit).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Press Ctrl+Shift+S to toggle
      </div>
    </div>
  )
}