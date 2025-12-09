'use client'

import { useState } from 'react'

interface ReputationAnalysisProps {
  bountyId: string
  bountyTitle: string
  targetAtom: string
  expertiseRequired: string
  reputationCriteria: string
  onClose: () => void
  onSubmit: (analysis: any) => void
}

interface ReputationScore {
  category: string
  score: number // 1-10 scale
  reasoning: string
  sources: string[]
}

export function ReputationAnalysis({ 
  bountyId, 
  bountyTitle, 
  targetAtom, 
  expertiseRequired, 
  reputationCriteria,
  onClose, 
  onSubmit 
}: ReputationAnalysisProps) {
  const [analysisData, setAnalysisData] = useState({
    analystCredentials: '',
    executiveSummary: '',
    overallScore: 5,
    methodology: '',
    sources: '',
    riskFactors: '',
    recommendations: ''
  })

  const [reputationScores, setReputationScores] = useState<ReputationScore[]>([
    { category: 'Credibility', score: 5, reasoning: '', sources: [] },
    { category: 'Performance', score: 5, reasoning: '', sources: [] },
    { category: 'Market Perception', score: 5, reasoning: '', sources: [] },
    { category: 'Risk Assessment', score: 5, reasoning: '', sources: [] },
    { category: 'Innovation', score: 5, reasoning: '', sources: [] }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleScoreUpdate = (index: number, field: string, value: any) => {
    setReputationScores(prev => 
      prev.map((score, i) => 
        i === index ? { ...score, [field]: value } : score
      )
    )
  }

  const handleInputChange = (field: string, value: string | number) => {
    setAnalysisData(prev => ({ ...prev, [field]: value }))
  }

  const validateAnalysis = () => {
    if (!analysisData.analystCredentials.trim()) {
      alert('Please provide your credentials and expertise')
      return false
    }
    if (!analysisData.executiveSummary.trim()) {
      alert('Please provide an executive summary')
      return false
    }
    if (!analysisData.methodology.trim()) {
      alert('Please describe your analysis methodology')
      return false
    }
    
    // Check that at least 3 reputation scores have reasoning
    const scoredCategories = reputationScores.filter(score => score.reasoning.trim())
    if (scoredCategories.length < 3) {
      alert('Please provide reasoning for at least 3 reputation categories')
      return false
    }

    return true
  }

  const handleSubmitAnalysis = async () => {
    if (!validateAnalysis()) return

    setIsLoading(true)

    try {
      // Calculate weighted overall score
      const validScores = reputationScores.filter(score => score.reasoning.trim())
      const weightedScore = validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length

      const analysis = {
        id: `reputation_${Date.now()}`,
        bountyId,
        type: 'reputation_analysis',
        targetAtom,
        analyst: analysisData.analystCredentials,
        submittedAt: new Date().toISOString(),
        data: {
          ...analysisData,
          overallScore: Math.round(weightedScore * 10) / 10, // Round to 1 decimal
          reputationScores: validScores,
          analysisCompleteness: (validScores.length / reputationScores.length) * 100
        },
        isLocal: true
      }

      onSubmit(analysis)

      setResult(`✅ Reputation analysis submitted successfully!
        Target: ${targetAtom}
        Overall Score: ${analysis.data.overallScore}/10
        Categories Analyzed: ${validScores.length}
        
        Your expert analysis is now available for review!`)

      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">🏆 Reputation Analysis Submission</h3>
          <p className="text-gray-300 text-sm mt-1">For: {bountyTitle}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Bounty Context */}
      <div className="mb-6 p-4 bg-purple-900 border border-purple-600 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-400">Target:</span>
            <p className="text-white">{targetAtom}</p>
          </div>
          <div>
            <span className="text-purple-400">Required Expertise:</span>
            <p className="text-purple-300">{expertiseRequired}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-purple-400">Analysis Criteria:</span>
          <p className="text-purple-200 text-sm">{reputationCriteria}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Analyst Credentials */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Credentials & Expertise *
          </label>
          <textarea
            value={analysisData.analystCredentials}
            onChange={(e) => handleInputChange('analystCredentials', e.target.value)}
            placeholder="Describe your relevant experience, qualifications, and expertise in this domain..."
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Executive Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Executive Summary *
          </label>
          <textarea
            value={analysisData.executiveSummary}
            onChange={(e) => handleInputChange('executiveSummary', e.target.value)}
            placeholder="Provide a 2-3 sentence summary of your reputation assessment..."
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Reputation Scoring Matrix */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Reputation Scoring (1-10 scale) *
          </label>
          <div className="space-y-4">
            {reputationScores.map((score, index) => (
              <div key={score.category} className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{score.category}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Score:</span>
                    <select
                      value={score.score}
                      onChange={(e) => handleScoreUpdate(index, 'score', parseInt(e.target.value))}
                      className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  value={score.reasoning}
                  onChange={(e) => handleScoreUpdate(index, 'reasoning', e.target.value)}
                  placeholder={`Explain your ${score.category.toLowerCase()} assessment...`}
                  rows={2}
                  className="w-full p-2 bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Analysis Methodology *
          </label>
          <textarea
            value={analysisData.methodology}
            onChange={(e) => handleInputChange('methodology', e.target.value)}
            placeholder="Describe your research methods, data sources, and analytical approach..."
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sources & References
          </label>
          <textarea
            value={analysisData.sources}
            onChange={(e) => handleInputChange('sources', e.target.value)}
            placeholder="List your sources: URLs, reports, databases, expert interviews, etc..."
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Risk Factors */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Key Risk Factors
          </label>
          <textarea
            value={analysisData.riskFactors}
            onChange={(e) => handleInputChange('riskFactors', e.target.value)}
            placeholder="Identify any significant risks, red flags, or concerns..."
            rows={2}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recommendations
          </label>
          <textarea
            value={analysisData.recommendations}
            onChange={(e) => handleInputChange('recommendations', e.target.value)}
            placeholder="Provide actionable recommendations based on your analysis..."
            rows={2}
            className="w-full p-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <button
          onClick={handleSubmitAnalysis}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 font-semibold transition-colors"
        >
          {isLoading ? 'Submitting Analysis...' : 'Submit Reputation Analysis'}
        </button>

        {result && (
          <div className={`p-3 rounded-md border ${result.startsWith('✅') ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
            <p className={`${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'} whitespace-pre-line text-sm`}>
              {result}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}