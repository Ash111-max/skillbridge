//Welcome.jsx

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Sparkles,
  Mic,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle,
  Brain,
  Target,
  Zap,
} from "lucide-react";

export default function Welcome() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SkillBridge</h1>
                  <p className="text-xs text-purple-300">
                    AI-Powered Interview Coach
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-white hover:text-purple-300 font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-semibold">
                AI-Powered Mock Interviews
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master Your
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Interview Skills
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Practice with AI-powered feedback, track your progress, and ace
              your next interview with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 flex items-center justify-center gap-3"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                <Mic className="w-5 h-5" />
                Take a Demo Interview
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">10K+</p>
                <p className="text-gray-400 text-sm mt-1">Practice Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-pink-400">95%</p>
                <p className="text-gray-400 text-sm mt-1">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">8+</p>
                <p className="text-gray-400 text-sm mt-1">Domains</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Why Choose SkillBridge?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Our AI-powered platform gives you everything you need to succeed
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                AI-Powered Feedback
              </h3>
              <p className="text-gray-400">
                Get instant, detailed feedback on clarity, confidence, grammar,
                and pacing from our advanced AI engine.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Track Progress
              </h3>
              <p className="text-gray-400">
                Monitor your improvement over time with detailed analytics and
                performance metrics across all domains.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Multiple Domains
              </h3>
              <p className="text-gray-400">
                Practice for HR, Technical, Marketing, Finance, DSA interviews
                and more with domain-specific questions.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Choose Domain
              </h3>
              <p className="text-gray-400">
                Select from HR, Tech, Marketing, Finance, or other interview
                domains
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Record Answer
              </h3>
              <p className="text-gray-400">
                Answer interview questions using your microphone and get
                real-time transcription
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Get Feedback
              </h3>
              <p className="text-gray-400">
                Receive detailed AI-powered feedback with scores and improvement
                tips
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-white text-center mb-12">
                What You'll Get
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Comprehensive Feedback
                    </h3>
                    <p className="text-gray-300">
                      Detailed analysis of clarity, confidence, grammar, pacing,
                      and sentiment
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Downloadable Reports
                    </h3>
                    <p className="text-gray-300">
                      Get PDF reports with complete transcriptions and feedback
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Progress Dashboard
                    </h3>
                    <p className="text-gray-300">
                      Track your improvement with visual analytics and domain-wise
                      stats
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Practice Anywhere
                    </h3>
                    <p className="text-gray-300">
                      No scheduling needed - practice whenever and wherever you
                      want
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-center">
            <Award className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who improved their
              interview skills with SkillBridge
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 SkillBridge. All rights reserved.
              </p>
              {/* <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div> */}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}