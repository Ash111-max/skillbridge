import React from "react";

export default function QuestionCard({ question }) {
  if (!question) return null;
  return (
    <div className="card w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Question:</h2>
      <p>{question.q}</p>
    </div>
  );
}
