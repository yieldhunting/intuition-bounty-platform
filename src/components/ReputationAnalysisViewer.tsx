'use client'

import { useState } from 'react'

interface ReputationScore {
  category: string
  score: number
  reasoning: string
  sources: string[]
}

interface ReputationAnalysisData {
  analystCredentials: string
  executiveSummary: string
  overallScore: number
  methodology: string
  sources: string
  riskFactors: string
  recommendations: string
  reputationScores: ReputationScore[]
  analysisCompleteness: number
}

interface ReputationAnalysisViewerProps {
  analysis: {
    id: string
    bountyId: string
    type: string
    targetAtom: string
    analyst: string
    submittedAt: string
    data: ReputationAnalysisData
    isLocal?: boolean
  }
}

export function ReputationAnalysisViewer({ analysis }: ReputationAnalysisViewerProps) {
  const [expandedSection, setExpandedSection] = useState<string>('')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    if (score >= 4) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-900 border-green-600'
    if (score >= 6) return 'bg-yellow-900 border-yellow-600'
    if (score >= 4) return 'bg-orange-900 border-orange-600'
    return 'bg-red-900 border-red-600'
  }

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400 font-medium">🏆 Reputation Analysis</span>
          </div>
          <p className="text-sm text-gray-300">
            Target: <span className="font-medium text-white">{analysis.targetAtom}</span>
          </p>
          <p className="text-xs text-gray-400">
            By: {analysis.analyst} • {new Date(analysis.submittedAt).toLocaleDateString()}
          </p>
        </div>
        
        {/* Overall Score */}
        <div className={`text-center p-3 rounded-lg border ${getScoreBackground(analysis.data.overallScore)}`}>
          <div className="text-sm font-medium">Overall Score</div>
          <div className={`text-2xl font-bold ${getScoreColor(analysis.data.overallScore)}`}>
            {analysis.data.overallScore}/10
          </div>
          <div className="text-xs opacity-75">
            {analysis.data.analysisCompleteness.toFixed(0)}% Complete
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-4 p-3 bg-gray-600 border border-gray-500 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">📋 Executive Summary</h4>
        <p className="text-sm text-gray-200">{analysis.data.executiveSummary}</p>
      </div>

      {/* Reputation Scores Grid */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">📊 Reputation Scores</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {analysis.data.reputationScores.map((score, index) => (
            <div
              key={index}
              className={`text-center p-2 rounded border ${getScoreBackground(score.score)} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => toggleSection(`score-${index}`)}
            >
              <div className="text-xs font-medium text-gray-200">{score.category}</div>
              <div className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                {score.score}/10
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Score Details */}
        {expandedSection.startsWith('score-') && (
          <div className="mt-3 p-3 bg-gray-600 border border-gray-500 rounded-lg">
            {(() => {
              const scoreIndex = parseInt(expandedSection.split('-')[1])
              const score = analysis.data.reputationScores[scoreIndex]
              return (
                <div>
                  <h5 className="font-medium text-white mb-2">{score.category} Analysis</h5>
                  <p className="text-sm text-gray-300">{score.reasoning}</p>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* Methodology */}
        {analysis.data.methodology && (
          <div>
            <button
              onClick={() => toggleSection('methodology')}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left"
            >
              <span>🔬 Methodology</span>
              <span>{expandedSection === 'methodology' ? '▼' : '▶'}</span>
            </button>
            {expandedSection === 'methodology' && (
              <div className="mt-2 p-3 bg-gray-600 border border-gray-500 rounded-lg">
                <p className="text-sm text-gray-200">{analysis.data.methodology}</p>
              </div>
            )}
          </div>
        )}

        {/* Risk Factors */}
        {analysis.data.riskFactors && (
          <div>
            <button
              onClick={() => toggleSection('risks')}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left"
            >
              <span>⚠️ Risk Factors</span>
              <span>{expandedSection === 'risks' ? '▼' : '▶'}</span>
            </button>
            {expandedSection === 'risks' && (
              <div className="mt-2 p-3 bg-red-900 border border-red-600 rounded-lg">
                <p className="text-sm text-red-200">{analysis.data.riskFactors}</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {analysis.data.recommendations && (
          <div>
            <button
              onClick={() => toggleSection('recommendations')}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left"
            >
              <span>💡 Recommendations</span>
              <span>{expandedSection === 'recommendations' ? '▼' : '▶'}</span>
            </button>
            {expandedSection === 'recommendations' && (
              <div className="mt-2 p-3 bg-blue-900 border border-blue-600 rounded-lg">
                <p className="text-sm text-blue-200">{analysis.data.recommendations}</p>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {analysis.data.sources && (
          <div>
            <button
              onClick={() => toggleSection('sources')}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left"
            >
              <span>📚 Sources & References</span>
              <span>{expandedSection === 'sources' ? '▼' : '▶'}</span>
            </button>
            {expandedSection === 'sources' && (
              <div className="mt-2 p-3 bg-gray-600 border border-gray-500 rounded-lg">
                <p className="text-sm text-gray-200 whitespace-pre-line">{analysis.data.sources}</p>
              </div>
            )}
          </div>
        )}

        {/* Analyst Credentials */}
        <div>
          <button
            onClick={() => toggleSection('credentials')}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full text-left"
          >
            <span>👨‍🎓 Analyst Credentials</span>
            <span>{expandedSection === 'credentials' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'credentials' && (
            <div className="mt-2 p-3 bg-gray-600 border border-gray-500 rounded-lg">
              <p className="text-sm text-gray-200">{analysis.data.analystCredentials}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}