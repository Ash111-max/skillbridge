// Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  Target,
  LogOut,
  Play,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboard, getHistory } from "../utils/api";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");

  // ✅ Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, historyData] = await Promise.all([
        getDashboard(),
        getHistory(10, 0),
      ]);
      setDashboardData(dashData);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    navigate("/interview");
  };

  const handleLogout = () => {
    logout();
    // Small delay ensures context clears before redirect
    setTimeout(() => navigate("/"), 300);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
                <p className="text-sm text-purple-300">
                  Welcome back, {user?.name || "User"}!
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Your Interview Dashboard
            </h2>
            <p className="text-gray-400">
              Track your progress and continue practicing
            </p>
          </div>

          {/* Start New Interview Button */}
          <div className="mb-8">
            <button
              onClick={handleStartInterview}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Start New Interview Practice
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Practice Sessions",
                value: dashboardData?.total_interviews || 0,
                icon: <Award className="w-6 h-6 text-purple-400" />,
                color: "bg-purple-500/20",
                label: "Total",
              },
              {
                title: "Different Domains",
                value: dashboardData?.domains_practiced || 0,
                icon: <Target className="w-6 h-6 text-pink-400" />,
                color: "bg-pink-500/20",
                label: "Practiced",
              },
              {
                title: "Overall Score",
                value: dashboardData?.avg_overall_score?.toFixed(1) || "0.0",
                icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
                color: "bg-blue-500/20",
                label: "Average",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
                  >
                    {card.icon}
                  </div>
                  <span className="text-sm text-gray-400">{card.label}</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {card.value}
                </h3>
                <p className="text-gray-400 text-sm">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {["overview", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  view === tab
                    ? "bg-purple-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {tab === "overview" ? "Overview" : "History"}
              </button>
            ))}
          </div>

          {/* Overview Section */}
          {view === "overview" && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Progress by Domain
                </h3>
                {dashboardData?.progress_by_domain?.length ? (
                  <div className="space-y-4">
                    {dashboardData.progress_by_domain.map((progress, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-white">
                            {progress.domain}
                          </h4>
                          <span className="text-sm text-gray-400">
                            {progress.total_sessions} sessions
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            ["Clarity", progress.avg_clarity_score],
                            ["Confidence", progress.avg_confidence_score],
                            ["Grammar", progress.avg_grammar_score],
                            ["Overall", progress.avg_overall_score],
                          ].map(([label, score]) => (
                            <div key={label}>
                              <p className="text-xs text-gray-400 mb-1">
                                {label}
                              </p>
                              <p
                                className={`text-lg font-bold ${getScoreColor(
                                  score
                                )}`}
                              >
                                {score.toFixed(1)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">
                      No practice sessions yet. Start your first interview!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Section */}
          {view === "history" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6">
                Recent Interviews
              </h3>
              {history?.length ? (
                <div className="space-y-4">
                  {history.map((interview) => (
                    <div
                      key={interview.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-semibold">
                              {interview.domain}
                            </span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(interview.created_at)}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-2">
                            {interview.question}
                          </p>
                          {interview.overall_score && (
                            <p
                              className={`text-sm font-semibold ${getScoreColor(
                                interview.overall_score
                              )}`}
                            >
                              Score: {interview.overall_score.toFixed(1)}/10
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No interview history yet</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
