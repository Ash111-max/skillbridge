import React from "react";
import { AlertCircle, Clock } from "lucide-react";

export default function QuestionCard({ question, domain }) {
  if (!question) return null;
  
  // Handle different question formats
  const displayQuestion = typeof question === 'string' ? question : question.q || question.question || JSON.stringify(question);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Interview Question</h3>
            <p className="text-sm text-purple-300">Domain: {domain}</p>
          </div>
        </div>
        <p className="text-lg text-gray-200 leading-relaxed">{displayQuestion}</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recording Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Speak clearly and at a moderate pace
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Structure your answer with examples
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            Aim for 1-2 minutes response time
          </li>
        </ul>
      </div>
    </div>
  );
}