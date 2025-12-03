import React, { useState } from 'react';
import { jd as jdApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Link2, FileText, Plus } from 'lucide-react';

interface JobInput {
  id: string;
  region: 'US' | 'EU' | 'GL';
  company: string;
  title: string;
  jd_text: string;
}

interface JDComposerProps {
  onAddJob: (job: JobInput) => void;
  defaultRegion?: 'US' | 'EU' | 'GL';
}

export default function JDComposer({ onAddJob, defaultRegion = 'US' }: JDComposerProps) {
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [region, setRegion] = useState<'US' | 'EU' | 'GL'>(defaultRegion);
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchFromUrl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a job URL');
      return;
    }

    setIsFetching(true);
    try {
      const response = await jdApi.fetchFromUrl(url);
      if (response.data.success) {
        setJdText(response.data.jd_text || '');
        setCompany(response.data.company || '');
        setTitle(response.data.title || '');
        toast.success('Job description extracted successfully!');
        setInputMode('text'); // Switch to text mode to edit
      } else {
        toast.error(response.data.message || 'Failed to fetch job description');
      }
    } catch (error) {
      console.error('Error fetching JD:', error);
      toast.error('Failed to fetch job description. Please paste manually.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddJob = () => {
    // Validation
    if (!company.trim()) {
      toast.error('Please enter a company name');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    if (jdText.trim().length < 50) {
      toast.error('Job description must be at least 50 characters');
      return;
    }

    // Create job object
    const job: JobInput = {
      id: `${company}-${title}`.replace(/\s+/g, '_'),
      region,
      company: company.trim(),
      title: title.trim(),
      jd_text: jdText.trim()
    };

    onAddJob(job);

    // Reset form
    setCompany('');
    setTitle('');
    setJdText('');
    setUrl('');
    toast.success(`Added ${title} at ${company}`);
  };

  return (
    <div className="space-y-4">
      {/* Input Mode Toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            inputMode === 'text'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={18} />
          Paste JD Text
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            inputMode === 'url'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link2 size={18} />
          Paste Job Link
        </button>
      </div>

      {/* URL Input Mode */}
      {inputMode === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Posting URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/jobs/view/..."
              />
              <button
                onClick={handleFetchFromUrl}
                disabled={isFetching}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFetching ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We'll try to extract the job details automatically. If it fails, you can paste manually.
            </p>
          </div>
        </div>
      )}

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as 'US' | 'EU' | 'GL')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="EU">🇪🇺 Europe</option>
                <option value="GL">🌍 Global</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste the full job description here..."
              rows={10}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Minimum 50 characters ({jdText.length} / 50)
              </p>
              {jdText.length >= 50 && (
                <span className="text-xs text-green-600 font-medium">✓ Valid</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddJob}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Job to Queue
          </button>
        </div>
      )}
    </div>
  );
}
