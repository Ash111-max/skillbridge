import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete, onRecordingStart }) {
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setRecordedAudio(blob);
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      if (onRecordingStart) onRecordingStart();
    } catch (err) {
      alert("Microphone access denied. Please allow microphone access to record your answer.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    onRecordingComplete(null);
    if (onRecordingStart) onRecordingStart();
  };

  return (
    <div className="space-y-6">
      {!recording && !recordedAudio && (
        <button
          onClick={startRecording}
          className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50 flex items-center justify-center gap-3"
        >
          <Mic className="w-5 h-5" />
          Start Recording Your Answer
        </button>
      )}

      {recording && !recordedAudio && (
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-12 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <Mic className="w-16 h-16 text-red-400 relative z-10" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">Recording in Progress...</h3>
          <p className="text-5xl font-bold text-red-400 mb-4">{formatTime(recordingTime)}</p>
          <p className="text-gray-400 mb-6">Speak clearly into your microphone</p>
          
          <button
            onClick={stopRecording}
            className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
          >
            <StopCircle className="w-5 h-5" />
            Stop Recording
          </button>
        </div>
      )}

      {recordedAudio && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4">Preview Your Answer</h4>
          <audio controls src={URL.createObjectURL(recordedAudio)} className="w-full mb-4 rounded-lg" />
          <div className="flex gap-3">
            <button
              onClick={resetRecording}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Re-record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}