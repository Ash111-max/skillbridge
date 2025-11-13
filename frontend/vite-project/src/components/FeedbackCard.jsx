import React from "react";
import { Award, TrendingUp } from "lucide-react";

const FeedbackCard = ({ feedback }) => {
  if (!feedback) return null;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Safely extract scores
  const clarityScore = feedback.clarity_score || feedback.fluency_score;
  const confidenceScore = feedback.confidence_score;
  const pacingScore = feedback.pacing_score || feedback.confidence_score;
  const tone = feedback.tone || (feedback.sentiment?.label);
  const sentiment = feedback.sentiment;
  const overallFeedback = feedback.overall_feedback;
  const fillerWords = feedback.filler_word_count || feedback.filler_words?.length || 0;
  
  // Extract grammar info if it's an object
  const grammarInfo = feedback.grammar;
  const grammarScore = grammarInfo?.score || grammarInfo?.mapped_score * 10 || grammarInfo?.confidence * 10;

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
          <Award className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Interview Performance</h3>
          <p className="text-green-400">Analysis Complete</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {clarityScore !== undefined && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Clarity / Fluency</p>
            <p className={`text-3xl font-bold ${getScoreColor(clarityScore)}`}>
              {clarityScore.toFixed(1)}/10
            </p>
          </div>
        )}
        
        {confidenceScore !== undefined && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Confidence</p>
            <p className={`text-3xl font-bold ${getScoreColor(confidenceScore)}`}>
              {confidenceScore.toFixed(1)}/10
            </p>
          </div>
        )}
        
        {pacingScore !== undefined && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Pacing</p>
            <p className={`text-3xl font-bold ${getScoreColor(pacingScore)}`}>
              {pacingScore.toFixed(1)}/10
            </p>
          </div>
        )}

        {grammarScore !== undefined && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Grammar</p>
            <p className={`text-3xl font-bold ${getScoreColor(grammarScore * 10)}`}>
              {(grammarScore * 10).toFixed(1)}/10
            </p>
          </div>
        )}
        
        {tone && !confidenceScore && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Tone</p>
            <p className="text-xl font-bold text-purple-400">{tone}</p>
          </div>
        )}
        
        {sentiment && !tone && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Sentiment</p>
            <p className="text-xl font-bold text-purple-400">
              {typeof sentiment === 'object' ? sentiment.label : sentiment}
            </p>
          </div>
        )}
      </div>

      {/* Text Analyzed */}
      {feedback.text_analyzed && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <h4 className="text-white font-semibold mb-3">Your Response (Transcribed)</h4>
          <p className="text-gray-300 leading-relaxed">{feedback.text_analyzed}</p>
        </div>
      )}

      {/* Overall Feedback */}
      {overallFeedback && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Detailed Feedback
          </h4>
          <p className="text-gray-300 leading-relaxed">{overallFeedback}</p>
        </div>
      )}

      {/* Grammar Details */}
      {grammarInfo && typeof grammarInfo === 'object' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
          <h4 className="text-blue-300 font-semibold mb-2">Grammar Analysis</h4>
          {grammarInfo.label && (
            <p className="text-sm text-blue-200">
              <span className="font-semibold">Result:</span> {grammarInfo.label}
            </p>
          )}
          {grammarInfo.confidence !== undefined && (
            <p className="text-sm text-blue-200">
              <span className="font-semibold">Confidence:</span> {(grammarInfo.confidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {/* Filler Words Warning */}
      {fillerWords > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-sm text-orange-300">
            <span className="font-semibold">Tip:</span> You used {fillerWords} filler words (um, uh, like). Try to pause instead!
          </p>
        </div>
      )}

      {/* Additional Metrics if available */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {feedback.word_count !== undefined && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Word Count</p>
            <p className="text-lg font-bold text-white">{feedback.word_count}</p>
          </div>
        )}
        {feedback.duration !== undefined && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-lg font-bold text-white">{feedback.duration.toFixed(1)}s</p>
          </div>
        )}
        {feedback.pace && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Pace</p>
            <p className="text-lg font-bold text-white">{feedback.pace}</p>
          </div>
        )}
        {feedback.avg_pitch !== undefined && feedback.avg_pitch !== null && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Avg Pitch</p>
            <p className="text-lg font-bold text-white">{feedback.avg_pitch.toFixed(0)} Hz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackCard;