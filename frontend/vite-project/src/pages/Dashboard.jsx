// // // Dashboard.jsx

// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import {
// //   Sparkles,
// //   TrendingUp,
// //   Award,
// //   Clock,
// //   Target,
// //   LogOut,
// //   Play,
// //   ChevronRight,
// // } from "lucide-react";
// // import { useAuth } from "../contexts/AuthContext";
// // import { getDashboard, getHistory } from "../utils/api";

// // export default function Dashboard() {
// //   const { user, logout, isAuthenticated } = useAuth();
// //   const navigate = useNavigate();
// //   const [dashboardData, setDashboardData] = useState(null);
// //   const [history, setHistory] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [view, setView] = useState("overview");

// //   // ✅ Redirect unauthenticated users
// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       navigate("/login", { replace: true });
// //       return;
// //     }
// //     loadDashboardData();
// //   }, [isAuthenticated, navigate]);

// //   const loadDashboardData = async () => {
// //     try {
// //       setLoading(true);
// //       const [dashData, historyData] = await Promise.all([
// //         getDashboard(),
// //         getHistory(10, 0),
// //       ]);
// //       setDashboardData(dashData);
// //       setHistory(historyData);
// //     } catch (error) {
// //       console.error("Failed to load dashboard:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleStartInterview = () => {
// //     navigate("/interview");
// //   };

// //   const handleLogout = () => {
// //     logout();
// //     // Small delay ensures context clears before redirect
// //     setTimeout(() => navigate("/"), 300);
// //   };

// //   const formatDate = (dateString) =>
// //     new Date(dateString).toLocaleDateString("en-US", {
// //       month: "short",
// //       day: "numeric",
// //       year: "numeric",
// //     });

// //   const getScoreColor = (score) => {
// //     if (score >= 8) return "text-green-400";
// //     if (score >= 6) return "text-yellow-400";
// //     return "text-red-400";
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
// //           <p className="text-white">Loading dashboard...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
// //       {/* Animated background */}
// //       <div className="absolute inset-0 overflow-hidden">
// //         <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
// //         <div
// //           className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse"
// //           style={{ animationDelay: "1s" }}
// //         ></div>
// //       </div>

// //       <div className="relative z-10">
// //         {/* Header */}
// //         <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
// //           <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
// //             <div className="flex items-center gap-3">
// //               <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
// //                 <Sparkles className="w-6 h-6 text-white" />
// //               </div>
// //               <div>
// //                 <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
// //                 <p className="text-sm text-purple-300">
// //                   Welcome back, {user?.name || "User"}!
// //                 </p>
// //               </div>
// //             </div>
// //             <button
// //               onClick={handleLogout}
// //               className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all"
// //             >
// //               <LogOut className="w-4 h-4" />
// //               Logout
// //             </button>
// //           </div>
// //         </header>

// //         {/* Main Content */}
// //         <main className="max-w-7xl mx-auto px-6 py-12">
// //           <div className="mb-8">
// //             <h2 className="text-4xl font-bold text-white mb-3">
// //               Your Interview Dashboard
// //             </h2>
// //             <p className="text-gray-400">
// //               Track your progress and continue practicing
// //             </p>
// //           </div>

// //           {/* Start New Interview Button */}
// //           <div className="mb-8">
// //             <button
// //               onClick={handleStartInterview}
// //               className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 flex items-center justify-center gap-3"
// //             >
// //               <Play className="w-5 h-5" />
// //               Start New Interview Practice
// //               <ChevronRight className="w-5 h-5" />
// //             </button>
// //           </div>

// //           {/* Summary Cards */}
// //           <div className="grid md:grid-cols-3 gap-6 mb-8">
// //             {[
// //               {
// //                 title: "Practice Sessions",
// //                 value: dashboardData?.total_interviews || 0,
// //                 icon: <Award className="w-6 h-6 text-purple-400" />,
// //                 color: "bg-purple-500/20",
// //                 label: "Total",
// //               },
// //               {
// //                 title: "Different Domains",
// //                 value: dashboardData?.domains_practiced || 0,
// //                 icon: <Target className="w-6 h-6 text-pink-400" />,
// //                 color: "bg-pink-500/20",
// //                 label: "Practiced",
// //               },
// //               {
// //                 title: "Overall Score",
// //                 value: dashboardData?.avg_overall_score?.toFixed(1) || "0.0",
// //                 icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
// //                 color: "bg-blue-500/20",
// //                 label: "Average",
// //               },
// //             ].map((card, i) => (
// //               <div
// //                 key={i}
// //                 className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
// //               >
// //                 <div className="flex items-center justify-between mb-4">
// //                   <div
// //                     className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
// //                   >
// //                     {card.icon}
// //                   </div>
// //                   <span className="text-sm text-gray-400">{card.label}</span>
// //                 </div>
// //                 <h3 className="text-3xl font-bold text-white mb-1">
// //                   {card.value}
// //                 </h3>
// //                 <p className="text-gray-400 text-sm">{card.title}</p>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Tabs */}
// //           <div className="flex gap-4 mb-6">
// //             {["overview", "history"].map((tab) => (
// //               <button
// //                 key={tab}
// //                 onClick={() => setView(tab)}
// //                 className={`px-6 py-3 rounded-xl font-semibold transition-all ${
// //                   view === tab
// //                     ? "bg-purple-500 text-white"
// //                     : "bg-white/5 text-gray-400 hover:bg-white/10"
// //                 }`}
// //               >
// //                 {tab === "overview" ? "Overview" : "History"}
// //               </button>
// //             ))}
// //           </div>

// //           {/* Overview Section */}
// //           {view === "overview" && (
// //             <div className="space-y-6">
// //               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
// //                 <h3 className="text-2xl font-bold text-white mb-6">
// //                   Progress by Domain
// //                 </h3>
// //                 {dashboardData?.progress_by_domain?.length ? (
// //                   <div className="space-y-4">
// //                     {dashboardData.progress_by_domain.map((progress, idx) => (
// //                       <div
// //                         key={idx}
// //                         className="bg-white/5 rounded-xl p-4 border border-white/10"
// //                       >
// //                         <div className="flex items-center justify-between mb-3">
// //                           <h4 className="text-lg font-semibold text-white">
// //                             {progress.domain}
// //                           </h4>
// //                           <span className="text-sm text-gray-400">
// //                             {progress.total_sessions} sessions
// //                           </span>
// //                         </div>
// //                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                           {[
// //                             ["Clarity", progress.avg_clarity_score],
// //                             ["Confidence", progress.avg_confidence_score],
// //                             ["Grammar", progress.avg_grammar_score],
// //                             ["Overall", progress.avg_overall_score],
// //                           ].map(([label, score]) => (
// //                             <div key={label}>
// //                               <p className="text-xs text-gray-400 mb-1">
// //                                 {label}
// //                               </p>
// //                               <p
// //                                 className={`text-lg font-bold ${getScoreColor(
// //                                   score
// //                                 )}`}
// //                               >
// //                                 {score.toFixed(1)}
// //                               </p>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <div className="text-center py-12">
// //                     <p className="text-gray-400">
// //                       No practice sessions yet. Start your first interview!
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}

// //           {/* History Section */}
// //           {view === "history" && (
// //             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
// //               <h3 className="text-2xl font-bold text-white mb-6">
// //                 Recent Interviews
// //               </h3>
// //               {history?.length ? (
// //                 <div className="space-y-4">
// //                   {history.map((interview) => (
// //                     <div
// //                       key={interview.id}
// //                       className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
// //                     >
// //                       <div className="flex items-start justify-between">
// //                         <div className="flex-1">
// //                           <div className="flex items-center gap-3 mb-2">
// //                             <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-semibold">
// //                               {interview.domain}
// //                             </span>
// //                             <span className="text-sm text-gray-400 flex items-center gap-1">
// //                               <Clock className="w-4 h-4" />
// //                               {formatDate(interview.created_at)}
// //                             </span>
// //                           </div>
// //                           <p className="text-white font-medium mb-2">
// //                             {interview.question}
// //                           </p>
// //                           {interview.overall_score && (
// //                             <p
// //                               className={`text-sm font-semibold ${getScoreColor(
// //                                 interview.overall_score
// //                               )}`}
// //                             >
// //                               Score: {interview.overall_score.toFixed(1)}/10
// //                             </p>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <div className="text-center py-12">
// //                   <p className="text-gray-400">No interview history yet</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";
// import {
//   TrendingUp, Target, Award, Clock, BarChart3, Activity,
//   ChevronRight, Calendar, BookOpen, Zap, ArrowLeft
// } from "lucide-react";

// export default function Dashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState(null);
//   const [progressByDomain, setProgressByDomain] = useState([]);
//   const [scoreHistory, setScoreHistory] = useState([]);
//   const [recentInterviews, setRecentInterviews] = useState([]);
//   const [metrics, setMetrics] = useState(null);
//   const [activeTab, setActiveTab] = useState("overview"); // overview or history

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       // Fetch all data in parallel
//       const [statsRes, progressRes, historyRes, recentRes, metricsRes] = await Promise.all([
//         fetch("http://127.0.0.1:8000/api/user/stats", { headers }),
//         fetch("http://127.0.0.1:8000/api/user/progress-by-domain", { headers }),
//         fetch("http://127.0.0.1:8000/api/user/score-history?limit=10", { headers }),
//         fetch("http://127.0.0.1:8000/api/user/recent-interviews?limit=5", { headers }),
//         fetch("http://127.0.0.1:8000/api/user/performance-metrics", { headers })
//       ]);

//       const statsData = await statsRes.json();
//       const progressData = await progressRes.json();
//       const historyData = await historyRes.json();
//       const recentData = await recentRes.json();
//       const metricsData = await metricsRes.json();

//       setStats(statsData);
//       setProgressByDomain(progressData.progress || []);
//       setScoreHistory(historyData.history || []);
//       setRecentInterviews(recentData.recent_interviews || []);
//       setMetrics(metricsData);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getScoreColor = (score) => {
//     if (score >= 8) return "text-green-400";
//     if (score >= 6) return "text-yellow-400";
//     return "text-red-400";
//   };

//   const getScoreBgColor = (score) => {
//     if (score >= 8) return "bg-green-500/20 border-green-500/30";
//     if (score >= 6) return "bg-yellow-500/20 border-yellow-500/30";
//     return "bg-red-500/20 border-red-500/30";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate("/")}
//               className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5 text-white" />
//             </button>
//             <div>
//               <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
//               <p className="text-gray-300 mt-1">Track your interview practice progress</p>
//             </div>
//           </div>
//           <button
//             onClick={logout}
//             className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-all border border-red-500/30"
//           >
//             Logout
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-300 text-sm">Total Interviews</p>
//                 <p className="text-4xl font-bold text-white mt-2">{stats?.total_interviews || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
//                 <BarChart3 className="w-6 h-6 text-purple-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-300 text-sm">Domains Practiced</p>
//                 <p className="text-4xl font-bold text-white mt-2">{stats?.domains_practiced || 0}</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
//                 <BookOpen className="w-6 h-6 text-blue-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-300 text-sm">Average Score</p>
//                 <p className={`text-4xl font-bold mt-2 ${getScoreColor(stats?.avg_overall_score || 0)}`}>
//                   {stats?.avg_overall_score || 0}/10
//                 </p>
//               </div>
//               <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
//                 <Target className="w-6 h-6 text-green-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-300 text-sm">Practice Time</p>
//                 <p className="text-4xl font-bold text-white mt-2">{stats?.total_practice_minutes || 0}<span className="text-xl">m</span></p>
//               </div>
//               <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
//                 <Clock className="w-6 h-6 text-pink-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-4 mb-6">
//           <button
//             onClick={() => setActiveTab("overview")}
//             className={`px-6 py-3 rounded-xl font-semibold transition-all ${
//               activeTab === "overview"
//                 ? "bg-purple-500 text-white"
//                 : "bg-white/10 text-gray-300 hover:bg-white/20"
//             }`}
//           >
//             Overview
//           </button>
//           <button
//             onClick={() => navigate("/interview-history")}
//             className="px-6 py-3 bg-white/10 text-gray-300 hover:bg-white/20 rounded-xl font-semibold transition-all"
//           >
//             Interview History
//           </button>
//         </div>

//         {/* Overview Tab Content */}
//         {activeTab === "overview" && (
//           <div className="space-y-6">
//             {/* Score Trend Chart */}
//             {scoreHistory.length > 0 && (
//               <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
//                   <TrendingUp className="w-6 h-6 text-purple-400" />
//                   Score Progress
//                 </h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={scoreHistory}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//                     <XAxis dataKey="date" stroke="#9ca3af" />
//                     <YAxis domain={[0, 10]} stroke="#9ca3af" />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "rgba(17, 24, 39, 0.9)",
//                         border: "1px solid rgba(255,255,255,0.1)",
//                         borderRadius: "12px",
//                         color: "#fff"
//                       }}
//                     />
//                     <Legend />
//                     <Line type="monotone" dataKey="overall_score" stroke="#a855f7" strokeWidth={3} name="Overall Score" />
//                     <Line type="monotone" dataKey="clarity" stroke="#3b82f6" strokeWidth={2} name="Clarity" />
//                     <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Performance Metrics Radar */}
//               {metrics && (
//                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                   <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
//                     <Activity className="w-6 h-6 text-blue-400" />
//                     Performance Breakdown
//                   </h2>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <RadarChart data={[
//                       { metric: "Clarity", score: metrics.avg_clarity },
//                       { metric: "Fluency", score: metrics.avg_fluency },
//                       { metric: "Grammar", score: metrics.avg_grammar },
//                       { metric: "Confidence", score: metrics.avg_confidence },
//                       { metric: "Pacing", score: metrics.avg_pacing }
//                     ]}>
//                       <PolarGrid stroke="rgba(255,255,255,0.2)" />
//                       <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
//                       <PolarRadiusAxis domain={[0, 10]} stroke="#9ca3af" />
//                       <Radar dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "rgba(17, 24, 39, 0.9)",
//                           border: "1px solid rgba(255,255,255,0.1)",
//                           borderRadius: "12px",
//                           color: "#fff"
//                         }}
//                       />
//                     </RadarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}

//               {/* Progress by Domain */}
//               {progressByDomain.length > 0 && (
//                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                   <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
//                     <Award className="w-6 h-6 text-yellow-400" />
//                     Domain Performance
//                   </h2>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={progressByDomain}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//                       <XAxis dataKey="domain" stroke="#9ca3af" />
//                       <YAxis domain={[0, 10]} stroke="#9ca3af" />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "rgba(17, 24, 39, 0.9)",
//                           border: "1px solid rgba(255,255,255,0.1)",
//                           borderRadius: "12px",
//                           color: "#fff"
//                         }}
//                       />
//                       <Bar dataKey="avg_overall_score" fill="#a855f7" name="Avg Score" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>

//             {/* Recent Activity */}
//             {recentInterviews.length > 0 && (
//               <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-2xl font-bold text-white flex items-center gap-2">
//                     <Calendar className="w-6 h-6 text-green-400" />
//                     Recent Activity
//                   </h2>
//                   <button
//                     onClick={() => navigate("/interview-history")}
//                     className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
//                   >
//                     View All
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <div className="space-y-4">
//                   {recentInterviews.map((interview) => (
//                     <div
//                       key={interview.id}
//                       className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
//                       onClick={() => navigate(`/interview-history?id=${interview.id}`)}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold">
//                               {interview.domain}
//                             </span>
//                             <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreBgColor(interview.overall_score)}`}>
//                               {interview.overall_score.toFixed(1)}/10
//                             </span>
//                           </div>
//                           <p className="text-gray-300 text-sm">{interview.question}</p>
//                           <p className="text-gray-500 text-xs mt-2">{interview.created_at_formatted}</p>
//                         </div>
//                         <ChevronRight className="w-5 h-5 text-gray-400" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Quick Stats */}
//             {metrics && (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                   <div className="flex items-center gap-3 mb-2">
//                     <Zap className="w-5 h-5 text-yellow-400" />
//                     <h3 className="text-lg font-semibold text-white">Speaking Pace</h3>
//                   </div>
//                   <p className="text-3xl font-bold text-white">{metrics.avg_wpm}</p>
//                   <p className="text-gray-400 text-sm mt-1">Words per minute</p>
//                 </div>

//                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                   <div className="flex items-center gap-3 mb-2">
//                     <Activity className="w-5 h-5 text-red-400" />
//                     <h3 className="text-lg font-semibold text-white">Filler Words</h3>
//                   </div>
//                   <p className="text-3xl font-bold text-white">{metrics.avg_filler_per_interview.toFixed(1)}</p>
//                   <p className="text-gray-400 text-sm mt-1">Average per interview</p>
//                 </div>

//                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
//                   <div className="flex items-center gap-3 mb-2">
//                     <TrendingUp className="w-5 h-5 text-green-400" />
//                     <h3 className="text-lg font-semibold text-white">Improvement</h3>
//                   </div>
//                   <p className={`text-3xl font-bold ${metrics.improvement_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {metrics.improvement_rate >= 0 ? '+' : ''}{metrics.improvement_rate}%
//                   </p>
//                   <p className="text-gray-400 text-sm mt-1">Last 5 vs First 5</p>
//                 </div>
//               </div>
//             )}

//             {/* CTA Button */}
//             <div className="text-center mt-8">
//               <button
//                 onClick={() => navigate("/interview")}
//                 className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
//               >
//                 Start New Interview Practice
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {stats?.total_interviews === 0 && (
//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
//             <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Zap className="w-10 h-10 text-purple-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-white mb-3">Ready to start practicing?</h2>
//             <p className="text-gray-300 mb-6 max-w-md mx-auto">
//               Complete your first mock interview to see your progress and get personalized feedback!
//             </p>
//             <button
//               onClick={() => navigate("/interview")}
//               className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
//             >
//               Start Your First Interview
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Target, Award, Clock, BarChart3, Activity,
  ChevronRight, Calendar, BookOpen, Zap, ArrowLeft
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [progressByDomain, setProgressByDomain] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, progressRes, historyRes, recentRes, metricsRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/user/stats", { headers }),
        fetch("http://127.0.0.1:8000/api/user/progress-by-domain", { headers }),
        fetch("http://127.0.0.1:8000/api/user/score-history?limit=10", { headers }),
        fetch("http://127.0.0.1:8000/api/user/recent-interviews?limit=5", { headers }),
        fetch("http://127.0.0.1:8000/api/user/performance-metrics", { headers })
      ]);

      setStats(await statsRes.json() ?? {});
      setProgressByDomain((await progressRes.json())?.progress ?? []);
      setScoreHistory((await historyRes.json())?.history ?? []);
      setRecentInterviews((await recentRes.json())?.recent_interviews ?? []);
      setMetrics(await metricsRes.json() ?? {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
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
              onClick={() => navigate("/")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name ?? "User"}!</h1>
              <p className="text-gray-300 mt-1">Track your interview practice progress</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-all border border-red-500/30"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Interviews</p>
                <p className="text-4xl font-bold text-white mt-2">{stats?.total_interviews ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Domains Practiced</p>
                <p className="text-4xl font-bold text-white mt-2">{stats?.domains_practiced ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Average Score</p>
                <p className={`text-4xl font-bold mt-2 ${getScoreColor(stats?.avg_overall_score ?? 0)}`}>
                  {(stats?.avg_overall_score ?? 0).toFixed(1)}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Practice Time</p>
                <p className="text-4xl font-bold text-white mt-2">{stats?.total_practice_minutes ?? 0}<span className="text-xl">m</span></p>
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-purple-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => navigate("/interview-history")}
            className="px-6 py-3 bg-white/10 text-gray-300 hover:bg-white/20 rounded-xl font-semibold transition-all"
          >
            Interview History
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Score Trend Chart */}
            {scoreHistory.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Score Progress
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis domain={[0, 10]} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="overall_score" stroke="#a855f7" strokeWidth={3} name="Overall Score" />
                    <Line type="monotone" dataKey="clarity" stroke="#3b82f6" strokeWidth={2} name="Clarity" />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Metrics Radar */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-400" />
                    Performance Breakdown
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { metric: "Clarity", score: metrics?.avg_clarity ?? 0 },
                      { metric: "Fluency", score: metrics?.avg_fluency ?? 0 },
                      { metric: "Grammar", score: metrics?.avg_grammar ?? 0 },
                      { metric: "Confidence", score: metrics?.avg_confidence ?? 0 },
                      { metric: "Pacing", score: metrics?.avg_pacing ?? 0 }
                    ]}>
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                      <PolarRadiusAxis domain={[0, 10]} stroke="#9ca3af" />
                      <Radar dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff"
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress by Domain */}
                {progressByDomain.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      Domain Performance
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progressByDomain}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="domain" stroke="#9ca3af" />
                        <YAxis domain={[0, 10]} stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff"
                          }}
                        />
                        <Bar dataKey="avg_overall_score" fill="#a855f7" name="Avg Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Recent Interviews */}
            {recentInterviews.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-green-400" />
                    Recent Activity
                  </h2>
                  <button
                    onClick={() => navigate("/interview-history")}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                      onClick={() => navigate(`/interview-history?id=${interview.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold">
                              {interview.domain ?? "-"}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreBgColor(interview?.overall_score ?? 0)}`}>
                              {(interview?.overall_score ?? 0).toFixed(1)}/10
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{interview.question ?? "-"}</p>
                          <p className="text-gray-500 text-xs mt-2">{interview.created_at_formatted ?? "-"}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Speaking Pace</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{metrics?.avg_wpm ?? 0}</p>
                  <p className="text-gray-400 text-sm mt-1">Words per minute</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Filler Words</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{(metrics?.avg_filler_per_interview ?? 0).toFixed(1)}</p>
                  <p className="text-gray-400 text-sm mt-1">Average per interview</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Improvement</h3>
                  </div>
                  <p className={`text-3xl font-bold ${metrics?.improvement_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics?.improvement_rate >= 0 ? '+' : ''}{metrics?.improvement_rate ?? 0}%
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Last 5 vs First 5</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {stats?.total_interviews === 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to start practicing?</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Complete your first mock interview to see your progress and get personalized feedback!
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Start Your First Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
