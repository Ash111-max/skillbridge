import React from "react";

const FeedbackCard = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="card mt-6 bg-gradient-to-r from-indigo-800 to-indigo-600">
      <h2 className="text-xl font-bold mb-2">Feedback Summary:</h2>
      <pre className="text-gray-100 whitespace-pre-wrap">{JSON.stringify(feedback, null, 2)}</pre>
    </div>
  );
};

export default FeedbackCard;
