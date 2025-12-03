import React from 'react';
import { ProfileV3 } from '@/lib/types';
import CompletenessBar from '../CompletenessBar';

interface ReviewSectionProps {
  profile: ProfileV3;
  completeness: number;
  breakdown?: any;
}

export default function ReviewSection({ profile, completeness, breakdown }: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Profile</h2>
        <p className="text-gray-600">Make sure everything looks good before continuing</p>
      </div>

      {/* Completeness Bar */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <CompletenessBar completeness={completeness} breakdown={breakdown} showBreakdown={true} />
      </div>

      {/* Basics */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-600">Name:</span> <span className="font-medium">{profile.basics.full_name || '-'}</span></div>
          <div><span className="text-gray-600">Email:</span> <span className="font-medium">{profile.basics.email || '-'}</span></div>
          <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{profile.basics.phone || '-'}</span></div>
          <div><span className="text-gray-600">Location:</span> <span className="font-medium">{profile.basics.location || '-'}</span></div>
        </div>
        {profile.basics.headline && (
          <div className="mt-3 text-sm">
            <span className="text-gray-600">Headline:</span> <span className="font-medium">{profile.basics.headline}</span>
          </div>
        )}
      </div>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
          <div className="space-y-3">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-gray-900">{exp.title} at {exp.company}</div>
                <div className="text-gray-600">{exp.start} - {exp.end}</div>
                <div className="text-gray-600">{exp.bullets.length} achievement{exp.bullets.length > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
          <div className="space-y-2">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-gray-900">{edu.degree}</div>
                <div className="text-gray-600">{edu.school}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills ({profile.skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {profile.projects.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects ({profile.projects.length})</h3>
          <div className="space-y-2">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-gray-900">{proj.name}</div>
                <div className="text-gray-600">{proj.stack.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completeness < 70 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> A more complete profile (70%+) generates better tailored resumes. Consider going back to add more details!
          </p>
        </div>
      )}
    </div>
  );
}
