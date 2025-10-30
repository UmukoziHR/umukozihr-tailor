import React from 'react';
import { Experience } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface ExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const addExperience = () => {
    onChange([
      ...data,
      {
        title: '',
        company: '',
        location: '',
        start: '',
        end: 'present',
        employment_type: 'full-time',
        bullets: ['']
      }
    ]);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addBullet = (expIndex: number) => {
    const newData = [...data];
    newData[expIndex].bullets.push('');
    onChange(newData);
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const newData = [...data];
    newData[expIndex].bullets[bulletIndex] = value;
    onChange(newData);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const newData = [...data];
    newData[expIndex].bullets = newData[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
        <p className="text-gray-600">Add your professional experience</p>
      </div>

      <div className="space-y-6">
        {data.map((exp, expIndex) => (
          <div key={expIndex} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Experience #{expIndex + 1}
              </h3>
              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(expIndex)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(expIndex, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tech Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(expIndex, 'location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={exp.employment_type}
                  onChange={(e) => updateExperience(expIndex, 'employment_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (YYYY-MM)
                </label>
                <input
                  type="month"
                  value={exp.start}
                  onChange={(e) => updateExperience(expIndex, 'start', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (YYYY-MM or "present")
                </label>
                <div className="flex gap-2">
                  <input
                    type={exp.end === 'present' ? 'text' : 'month'}
                    value={exp.end}
                    onChange={(e) => updateExperience(expIndex, 'end', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={exp.end === 'present'}
                  />
                  <button
                    type="button"
                    onClick={() => updateExperience(expIndex, 'end', exp.end === 'present' ? '' : 'present')}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    {exp.end === 'present' ? 'Set End' : 'Present'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bullets */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements & Responsibilities
              </label>
              <div className="space-y-2">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <textarea
                      value={bullet}
                      onChange={(e) => updateBullet(expIndex, bulletIndex, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="• Built scalable microservices that improved performance by 40%..."
                      rows={2}
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBullet(expIndex, bulletIndex)}
                        className="px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(expIndex)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
                >
                  + Add Achievement
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addExperience}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Experience
      </button>
    </div>
  );
}
