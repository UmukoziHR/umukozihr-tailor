import React from 'react';
import { HistoryItem } from '@/lib/types';
import { Download, FileText, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface RunCardProps {
  run: HistoryItem;
  onRegenerate: (runId: string) => void;
  onDownload: (url: string, filename: string) => void;
}

export default function RunCard({ run, onRegenerate, onDownload }: RunCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'US':
        return '🇺🇸';
      case 'EU':
        return '🇪🇺';
      case 'GL':
        return '🌍';
      default:
        return '🌐';
    }
  };

  const handleDownload = (url: string, type: string) => {
    const filename = `${run.company}_${run.title}_${type}.${type.includes('pdf') ? 'pdf' : 'tex'}`;
    onDownload(url, filename);
  };

  const handleOverleafOpen = () => {
    // Create a form to POST the ZIP to Overleaf
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip_uri[]';
    input.value = `${apiUrl}${run.artifacts_urls.resume_tex}`;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast.success('Opening in Overleaf...');
  };

  const artifacts = run.artifacts_urls;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{run.title}</h3>
            <span className="text-lg">{getRegionFlag(run.region)}</span>
          </div>
          <p className="text-gray-600">{run.company}</p>
          <p className="text-sm text-gray-500 mt-1">{formatDate(run.created_at)}</p>
          {run.profile_version && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Profile v{run.profile_version}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onRegenerate(run.run_id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Re-generate with current profile"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Resume PDF */}
        {artifacts.resume_pdf && (
          <button
            onClick={() => handleDownload(artifacts.resume_pdf!, 'resume_pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Resume PDF</span>
          </button>
        )}

        {/* Cover Letter PDF */}
        {artifacts.cover_letter_pdf && (
          <button
            onClick={() => handleDownload(artifacts.cover_letter_pdf!, 'cover_pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Cover Letter PDF</span>
          </button>
        )}

        {/* Resume TEX */}
        {artifacts.resume_tex && (
          <button
            onClick={() => handleDownload(artifacts.resume_tex!, 'resume_tex')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText size={16} />
            <span className="text-sm font-medium">Resume TEX</span>
          </button>
        )}

        {/* Cover Letter TEX */}
        {artifacts.cover_letter_tex && (
          <button
            onClick={() => handleDownload(artifacts.cover_letter_tex!, 'cover_tex')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText size={16} />
            <span className="text-sm font-medium">Cover Letter TEX</span>
          </button>
        )}
      </div>

      {/* Overleaf Button */}
      {artifacts.resume_tex && (
        <button
          onClick={handleOverleafOpen}
          className="w-full py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <ExternalLink size={16} />
          Open in Overleaf
        </button>
      )}

      {/* Compilation Status */}
      {artifacts.pdf_compilation && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex gap-4 text-xs text-gray-600">
            <span>
              Resume:{' '}
              {artifacts.pdf_compilation.resume_success ? (
                <span className="text-green-600 font-medium">✓ Compiled</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Failed</span>
              )}
            </span>
            <span>
              Cover:{' '}
              {artifacts.pdf_compilation.cover_letter_success ? (
                <span className="text-green-600 font-medium">✓ Compiled</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Failed</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
