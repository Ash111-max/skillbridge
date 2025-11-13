// // App.jsx

// import React, { useEffect, useState } from "react";
// import { Sparkles, CheckCircle } from "lucide-react";
// import DomainSelector from "./components/DomainSelector";
// import QuestionCard from "./components/QuestionCard";
// import AudioRecorder from "./components/AudioRecorder";
// import FeedbackCard from "./components/FeedbackCard";
// import Loader from "./components/Loader";
// import { fetchDomains, fetchQuestion, submitInterview, downloadReport } from "./utils/api";

// export default function App({ onBack }) {
//   const [currentStep, setCurrentStep] = useState('select');
//   const [domains, setDomains] = useState([]);
//   const [selectedDomain, setSelectedDomain] = useState("");
//   const [question, setQuestion] = useState(null);
//   const [feedback, setFeedback] = useState(null);
//   const [recordedAudio, setRecordedAudio] = useState(null);
//   const [interviewId, setInterviewId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Debug: Log state changes
//   useEffect(() => {
//     console.log("🔄 State changed:", { currentStep, feedback, interviewId, loading });
//   }, [currentStep, feedback, interviewId, loading]);

//   useEffect(() => {
//     fetchDomains().then(setDomains).catch(console.error);
//   }, []);

//   const handleGetQuestion = async () => {
//     if (!selectedDomain) return alert("Select a domain first!");
//     setLoading(true);
//     setFeedback(null);
//     try {
//       const data = await fetchQuestion(selectedDomain);
//       console.log("Question data received:", data); // Debug log
//       setQuestion(data.question || data); // Handle both formats
//       setCurrentStep('question');
//     } catch (e) {
//       console.error("Error fetching question:", e);
//       alert("Failed to load question");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!recordedAudio) {
//       alert("Record your answer first!");
//       return;
//     }
    
//     console.log("Starting submission...", { selectedDomain, recordedAudio });
//     setLoading(true);
    
//     try {
//       const data = await submitInterview(selectedDomain, recordedAudio);
//       console.log("✅ Full response data:", data);
//       console.log("✅ Feedback object:", data.feedback);
//       console.log("✅ Interview ID:", data.id);
      
//       if (!data.feedback) {
//         console.error("❌ No feedback in response!");
//         alert("Error: No feedback received from server");
//         return;
//       }
      
//       setFeedback(data.feedback);
//       setInterviewId(data.id);
//       setCurrentStep('feedback');
//       console.log("✅ State updated, should show feedback now");
      
//     } catch (e) {
//       console.error("❌ Submit error:", e);
//       alert("Submission failed: " + e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     if (!interviewId) return alert("Submit interview first");
//     downloadReport(interviewId);
//   };

//   const resetInterview = () => {
//     setCurrentStep('select');
//     setSelectedDomain('');
//     setQuestion(null);
//     setFeedback(null);
//     setRecordedAudio(null);
//     setInterviewId(null);
//   };

//   const handleRecordingStart = () => {
//     setCurrentStep('recording');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
//         <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
//       </div>

//       <div className="relative z-10">
//         {/* Header */}
//         <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
//           <div className="max-w-7xl mx-auto px-6 py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {onBack && (
//                   <button
//                     onClick={onBack}
//                     className="mr-4 text-gray-400 hover:text-white transition-colors"
//                   >
//                     ← Back to Dashboard
//                   </button>
//                 )}
//                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
//                   <Sparkles className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-white">SkillBridge</h1>
//                   <p className="text-sm text-purple-300">AI-Powered Interview Coach</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
//                   <p className="text-sm text-gray-300">Practice Sessions: <span className="text-purple-400 font-semibold">0</span></p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="max-w-5xl mx-auto px-6 py-12">
//           {/* Progress Steps */}
//           <div className="mb-12 flex items-center justify-center gap-4 flex-wrap">
//             {['Select Domain', 'Get Question', 'Record Answer', 'Get Feedback'].map((step, idx) => (
//               <div key={idx} className="flex items-center gap-4">
//                 <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
//                   ['select', 'question', 'recording', 'feedback'][idx] === currentStep || 
//                   ['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx
//                     ? 'bg-purple-500/20 border border-purple-500/50' 
//                     : 'bg-white/5 border border-white/10'
//                 }`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
//                     ['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx
//                       ? 'bg-purple-500 text-white' 
//                       : 'bg-white/10 text-gray-400'
//                   }`}>
//                     {['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx ? <CheckCircle className="w-5 h-5" /> : idx + 1}
//                   </div>
//                   <span className="text-sm text-white font-medium hidden md:block">{step}</span>
//                 </div>
//                 {idx < 3 && <div className="w-8 h-0.5 bg-white/10 hidden md:block"></div>}
//               </div>
//             ))}
//           </div>

//           {/* Step 1: Domain Selection */}
//           {currentStep === 'select' && (
//             <div className="space-y-6 animate-fadeIn">
//               <div className="text-center mb-8">
//                 <h2 className="text-4xl font-bold text-white mb-3">Choose Your Interview Domain</h2>
//                 <p className="text-gray-400">Select a field to start your mock interview practice</p>
//               </div>
              
//               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
//                 <DomainSelector 
//                   domains={domains}
//                   selected={selectedDomain}
//                   setSelected={setSelectedDomain}
//                 />
                
//                 <button
//                   onClick={handleGetQuestion}
//                   disabled={!selectedDomain || loading}
//                   className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50"
//                 >
//                   {loading ? <Loader /> : 'Get Interview Question →'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Question Display */}
//           {(currentStep === 'question' || currentStep === 'recording') && question && (
//             <div className="space-y-6 animate-fadeIn">
//               <QuestionCard question={question} domain={selectedDomain} />

//               <AudioRecorder 
//                 onRecordingComplete={setRecordedAudio}
//                 onRecordingStart={handleRecordingStart}
//               />

//               {recordedAudio && (
//                 <div className="flex gap-4">
//                   <button
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
//                   >
//                     {loading ? <Loader /> : 'Submit Answer →'}
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 3: Feedback */}
//           {currentStep === 'feedback' && (
//             <div className="space-y-6 animate-fadeIn">
//               {feedback ? (
//                 <>
//                   <FeedbackCard feedback={feedback} />

//                   <div className="flex gap-4">
//                     <button
//                       onClick={handleDownload}
//                       className="flex-1 px-6 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/10"
//                     >
//                       Download Report
//                     </button>
//                     <button
//                       onClick={resetInterview}
//                       className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
//                     >
//                       New Interview
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-12">
//                   <Loader />
//                   <p className="text-gray-400 mt-4">Loading feedback...</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle } from "lucide-react";
import DomainSelector from "./components/DomainSelector";
import QuestionCard from "./components/QuestionCard";
import AudioRecorder from "./components/AudioRecorder";
import FeedbackCard from "./components/FeedbackCard";
import Loader from "./components/Loader";
import { fetchDomains, fetchQuestion, submitInterview, downloadReport } from "./utils/api";

export default function App() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('select');
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDomains().then(setDomains).catch(console.error);
  }, []);

  const handleGetQuestion = async () => {
    if (!selectedDomain) return alert("Select a domain first!");
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchQuestion(selectedDomain);
      setQuestion(data.question || data);
      setCurrentStep('question');
    } catch (e) {
      console.error("Error fetching question:", e);
      alert("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!recordedAudio) {
      alert("Record your answer first!");
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await submitInterview(selectedDomain, recordedAudio);
      
      if (!data.feedback) {
        alert("Error: No feedback received from server");
        return;
      }
      
      setFeedback(data.feedback);
      setInterviewId(data.id);
      setCurrentStep('feedback');
      
    } catch (e) {
      console.error("Submit error:", e);
      alert("Submission failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!interviewId) return alert("Submit interview first");
    downloadReport(interviewId);
  };

  const resetInterview = () => {
    setCurrentStep('select');
    setSelectedDomain('');
    setQuestion(null);
    setFeedback(null);
    setRecordedAudio(null);
    setInterviewId(null);
  };

  const handleRecordingStart = () => {
    setCurrentStep('recording');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to Dashboard
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">SkillBridge</h1>
                  <p className="text-sm text-purple-300">AI-Powered Interview Coach</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Progress Steps */}
          <div className="mb-12 flex items-center justify-center gap-4 flex-wrap">
            {['Select Domain', 'Get Question', 'Record Answer', 'Get Feedback'].map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
                  ['select', 'question', 'recording', 'feedback'][idx] === currentStep || 
                  ['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx
                    ? 'bg-purple-500/20 border border-purple-500/50' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    ['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {['select', 'question', 'recording', 'feedback'].indexOf(currentStep) > idx ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-sm text-white font-medium hidden md:block">{step}</span>
                </div>
                {idx < 3 && <div className="w-8 h-0.5 bg-white/10 hidden md:block"></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Domain Selection */}
          {currentStep === 'select' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-3">Choose Your Interview Domain</h2>
                <p className="text-gray-400">Select a field to start your mock interview practice</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <DomainSelector 
                  domains={domains}
                  selected={selectedDomain}
                  setSelected={setSelectedDomain}
                />
                
                <button
                  onClick={handleGetQuestion}
                  disabled={!selectedDomain || loading}
                  className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50"
                >
                  {loading ? <Loader /> : 'Get Interview Question →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Question Display */}
          {(currentStep === 'question' || currentStep === 'recording') && question && (
            <div className="space-y-6 animate-fadeIn">
              <QuestionCard question={question} domain={selectedDomain} />

              <AudioRecorder 
                onRecordingComplete={setRecordedAudio}
                onRecordingStart={handleRecordingStart}
              />

              {recordedAudio && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
                  >
                    {loading ? <Loader /> : 'Submit Answer →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Feedback */}
          {currentStep === 'feedback' && (
            <div className="space-y-6 animate-fadeIn">
              {feedback ? (
                <>
                  <FeedbackCard feedback={feedback} />

                  <div className="flex gap-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-6 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                      Download Report
                    </button>
                    <button
                      onClick={resetInterview}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                      New Interview
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Loader />
                  <p className="text-gray-400 mt-4">Loading feedback...</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}