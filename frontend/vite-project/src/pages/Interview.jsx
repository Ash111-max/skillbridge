import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestion, submitInterview, downloadReport } from "../api/interview";
import QuestionCard from "../components/QuestionCard";
import AudioRecorder from "../components/AudioRecorder";
import FeedbackDisplay from "../components/FeedbackCard";

const Interview = () => {
    const { domain } = useParams();
    const [question, setQuestion] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [interviewId, setInterviewId] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    useEffect(() => {
        const getQuestion = async () => {
            const data = await fetchQuestion(domain);
            setQuestion(data.question);
        };
        getQuestion();
    }, [domain]);

    const handleSubmit = async () => {
        if (!audioBlob) return alert("Record your answer first!");
        const data = await submitInterview(domain, audioBlob);
        setFeedback(data.feedback);
        setInterviewId(data.id);
    };

    return (
        <div>
            <h1>Interview: {domain}</h1>
            {question && <QuestionCard question={question} />}
            <AudioRecorder onRecordingComplete={setAudioBlob} />
            <button onClick={handleSubmit}>Submit Answer</button>
            {feedback && <FeedbackDisplay feedback={feedback} />}
            {interviewId && <button onClick={() => downloadReport(interviewId)}>Download PDF Report</button>}
        </div>
    );
};

export default Interview;
