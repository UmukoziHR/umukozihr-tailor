import React from 'react';

interface CompletenessBarProps {
  completeness: number;
  breakdown?: {
    basics: number;
    experience: number;
    education: number;
    projects: number;
    skills: number;
    links: number;
  };
  showBreakdown?: boolean;
}

export default function CompletenessBar({
  completeness,
  breakdown,
  showBreakdown = false
}: CompletenessBarProps) {
  // Determine color based on completeness
  const getColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMessage = (percent: number) => {
    if (percent >= 90) return 'Excellent! Your profile is nearly complete.';
    if (percent >= 70) return 'Good! A few more details will make it perfect.';
    if (percent >= 50) return 'Getting there! Keep adding information.';
    return 'Let\'s complete your profile for better results.';
  };

  return (
    <div className="w-full">
      {/* Main progress bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            Profile Completeness
          </span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round(completeness)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getColor(completeness)}`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {getMessage(completeness)}
        </p>
      </div>

      {/* Breakdown (optional) */}
      {showBreakdown && breakdown && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Section Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(breakdown).map(([section, score]) => (
              <div key={section} className="flex items-center justify-between text-xs">
                <span className="capitalize text-gray-600">{section}:</span>
                <span className="font-medium text-gray-900">{Math.round(score)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
