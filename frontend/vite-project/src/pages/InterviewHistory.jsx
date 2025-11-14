// Create this as: frontend/src/pages/InterviewHistory.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Download, Filter, Search, ChevronLeft, ChevronRight,
  Calendar, TrendingUp, Award, Clock
} from "lucide-react";

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchInterviews(currentPage, selectedDomain);
  }, [currentPage, selectedDomain]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && interviews.length > 0) {
      const interview = interviews.find(i => i.id === parseInt(id));
      if (interview) {
        setSelectedInterview(interview);
      }
    }
  }, [searchParams, interviews]);

  const fetchInterviews = async (page = 1, domain = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `http://127.0.0.1:8000/api/user/interview-history?page=${page}&limit=10${domain ? `&domain=${domain}` : ''}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setInterviews(data.interviews || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Error fetching interview history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (interviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/download_report/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Interview_${interviewId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return "bg-green-500/20 border-green-500/30";
    if (score >= 6) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && interviews.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Interview History</h1>
              <p className="text-gray-300 mt-1">
                {pagination.total_count || 0} total interviews
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or responses..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Domain Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="">All Domains</option>
                <option value="HR">HR</option>
                <option value="Technical">Technical</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interview List */}
        {filteredInterviews.length > 0 ? (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold">
                        {interview.domain}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreBgColor(interview.scores.overall)}`}>
                        {interview.scores.overall.toFixed(1)}/10
                      </span>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {interview.created_at_formatted}
                      </span>
                    </div>

                    {/* Question */}
                    <h3 className="text-white font-semibold mb-2">Question:</h3>
                    <p className="text-gray-300 mb-4">{interview.question}</p>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Clarity</p>
                        <p className={`text-lg font-bold ${getScoreColor(interview.scores.clarity)}`}>
                          {interview.scores.clarity.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Fluency</p>
                        <p className={`text-lg font-bold ${getScoreColor(interview.scores.fluency)}`}>
                          {interview.scores.fluency.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Grammar</p>
                        <p className={`text-lg font-bold ${getScoreColor(interview.scores.grammar)}`}>
                          {interview.scores.grammar.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Confidence</p>
                        <p className={`text-lg font-bold ${getScoreColor(interview.scores.confidence)}`}>
                          {interview.scores.confidence.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs mb-1">Pacing</p>
                        <p className={`text-lg font-bold ${getScoreColor(interview.scores.pacing)}`}>
                          {interview.scores.pacing.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-4 text-gray-400 text-sm">
                      {interview.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {interview.duration.toFixed(1)}s
                        </span>
                      )}
                      {interview.word_count && (
                        <span>{interview.word_count} words</span>
                      )}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadReport(interview.id);
                    }}
                    className="ml-4 p-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No interviews found</h2>
            <p className="text-gray-300 mb-6">
              {searchQuery || selectedDomain 
                ? "Try adjusting your filters" 
                : "Start practicing to see your history!"}
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Start Interview
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === pagination.total_pages ||
                  Math.abs(page - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                        page === currentPage
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.has_next}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedInterview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
               onClick={() => setSelectedInterview(null)}>
            <div className="bg-slate-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
                 onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold">
                      {selectedInterview.domain}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreBgColor(selectedInterview.scores.overall)}`}>
                      {selectedInterview.scores.overall.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{selectedInterview.created_at_formatted}</p>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold mb-2">Question</h3>
                  <p className="text-gray-300">{selectedInterview.question}</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Your Response</h3>
                  <p className="text-gray-300">{selectedInterview.response}</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4">Performance Scores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedInterview.scores).map(([key, value]) => (
                      <div key={key} className="bg-white/5 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1 capitalize">{key}</p>
                        <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
                          {value.toFixed(1)}/10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedInterview.feedback && (
                  <div>
                    <h3 className="text-white font-bold mb-2">Feedback</h3>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-blue-200">{selectedInterview.feedback}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleDownloadReport(selectedInterview.id)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Full Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}