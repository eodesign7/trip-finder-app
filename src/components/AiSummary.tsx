import React from "react";

type AiSummaryProps = {
  aiSummary: string;
};

export default function AiSummary({ aiSummary }: AiSummaryProps) {
  if (!aiSummary) return null;
  return (
    <div className="w-full max-w-3xl mx-auto mt-4 mb-2 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-900 rounded shadow">
      <strong>AI odporúčanie:</strong> {aiSummary}
    </div>
  );
} 