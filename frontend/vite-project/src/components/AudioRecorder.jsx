import React, { useState, useRef } from "react";

export default function AudioRecorder({ onRecordingComplete }) {
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [timeLeft, setTimeLeft] = useState(12);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setTimeLeft(12);
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer);
            stopRecording();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access denied");
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
    setTimeLeft(12);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-lg flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-white">🎙 Audio Recorder</h2>
      {!recording && !recordedAudio && (
        <button
          onClick={startRecording}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-medium"
        >
          Start Recording
        </button>
      )}
      {recording && (
        <div className="text-center">
          <p className="text-red-400 font-semibold">Recording... {timeLeft}s left</p>
          <button
            onClick={stopRecording}
            className="mt-3 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium"
          >
            Stop
          </button>
        </div>
      )}
      {recordedAudio && (
        <div className="flex flex-col gap-3 items-center w-full">
          <audio controls src={URL.createObjectURL(recordedAudio)} className="w-full" />
          <button
            onClick={resetRecording}
            className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg font-medium"
          >
            Attempt Again
          </button>
        </div>
      )}
    </div>
  );
}
