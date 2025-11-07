import React, { useEffect, useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import FeedbackCard from "./components/FeedbackCard";
import QuestionCard from "./components/QuestionCard";
import { fetchDomains, fetchQuestion, submitInterview, downloadReport } from "./utils/api";

export default function App() {
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
      setQuestion(data.question);
    } catch (e) {
      alert("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!recordedAudio) return alert("Record your answer first!");
    setLoading(true);
    try {
      const data = await submitInterview(selectedDomain, recordedAudio);
      setFeedback(data.feedback);
      setInterviewId(data.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!interviewId) return alert("Submit interview first");
    downloadReport(interviewId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center p-6 gap-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-3">SkillBridge Mock Interview</h1>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <select
          className="bg-gray-800 text-white px-3 py-2 rounded-lg"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="">-- Select Domain --</option>
          {domains.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={handleGetQuestion}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium"
        >
          {loading ? "Loading..." : "Get Question"}
        </button>
      </div>

      <QuestionCard question={question} />

      {question && <AudioRecorder onRecordingComplete={setRecordedAudio} />}

      {recordedAudio && (
        <button
          onClick={handleSubmit}
          className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-medium mt-3"
        >
          {loading ? "Submitting..." : "Submit Answer"}
        </button>
      )}

      {feedback && <FeedbackCard feedback={feedback} />}

      {feedback && interviewId && (
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-medium mt-3"
        >
          Download Report
        </button>
      )}
    </div>
  );
}
