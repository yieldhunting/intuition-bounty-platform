'use client'

import { CyberNav } from '@/components/CyberNav'

export default function TestPage() {
  return (
    <div className="min-h-screen">
      <CyberNav />
      <main className="pt-16 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold neon-text-cyan">Test Page</h1>
          <p className="text-gray-300 mt-4">
            This is a minimal test page to check if navigation works.
          </p>
        </div>
      </main>
    </div>
  )
}