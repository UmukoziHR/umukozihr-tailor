import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { profile as profileApi, generation as generationApi, history as historyApi } from '@/lib/api';
import { ProfileV3, HistoryItem } from '@/lib/types';
import CompletenessBar from '@/components/CompletenessBar';
import JDComposer from '@/components/JDComposer';
import RunCard from '@/components/RunCard';
import JobCard from '@/components/JobCard';
import ThemeToggle from '@/components/ThemeToggle';
import { User, FileText, History, LogOut, Settings } from 'lucide-react';

type Tab = 'profile' | 'generate' | 'history';

interface JobQueue {
  id: string;
  region: 'US' | 'EU' | 'GL';
  company: string;
  title: string;
  jd_text: string;
}

export default function AppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [profile, setProfile] = useState<ProfileV3 | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [breakdown, setBreakdown] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Generate tab state
  const [jobQueue, setJobQueue] = useState<JobQueue[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRun, setCurrentRun] = useState<any>(null);

  // History tab state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Auth check and profile load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in');
      router.push('/');
      return;
    }

    loadProfile();
    loadHistory();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileApi.get();
      setProfile(response.data.profile);
      setCompleteness(response.data.completeness);

      // Get breakdown
      const compResponse = await profileApi.getCompleteness();
      setBreakdown(compResponse.data.breakdown);

      // Check if profile is complete enough
      if (response.data.completeness < 50) {
        toast('Your profile is incomplete. Consider completing it for better results!', {
          icon: '⚠️',
          duration: 5000
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('No profile found. Redirecting to onboarding...');
        router.push('/onboarding');
      } else {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const response = await historyApi.list(page, 10);
      setHistoryItems(response.data.runs);
      setHistoryTotal(response.data.total);
      setHistoryPage(page);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleAddJob = (job: JobQueue) => {
    setJobQueue([...jobQueue, job]);
  };

  const handleRemoveJob = (index: number) => {
    setJobQueue(jobQueue.filter((_, i) => i !== index));
    toast.success('Job removed from queue');
  };

  const handleGenerate = async () => {
    if (jobQueue.length === 0) {
      toast.error('Please add at least one job to the queue');
      return;
    }

    if (!profile) {
      console.error('❌ Generate failed: Profile not loaded');
      toast.error('Profile not loaded');
      return;
    }

    console.log('🚀 Starting document generation...', {
      jobQueueLength: jobQueue.length,
      jobs: jobQueue.map(j => ({ company: j.company, title: j.title, region: j.region })),
      profileLoaded: !!profile
    });

    setIsGenerating(true);
    try {
      // Note: Backend will use database profile for authenticated users
      // We pass null as profile (backend loads from database for authenticated users)
      console.log('📡 Calling generation API with null profile (backend will load from DB)...');
      const response = await generationApi.generate(null, jobQueue);

      console.log('✅ Generation successful!', {
        runId: response.data.run_id,
        artifactsCount: response.data.artifacts?.length || 0,
        bundlePath: response.data.bundle_path
      });

      setCurrentRun(response.data);
      setJobQueue([]); // Clear queue after successful generation
      toast.success('Documents generated successfully!');

      // Reload history
      loadHistory();
    } catch (error: any) {
      console.error('❌ Error generating documents:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.data?.detail,
        fullError: error
      });
      toast.error(error.response?.data?.detail || 'Failed to generate documents');
    } finally {
      setIsGenerating(false);
      console.log('🏁 Generation process ended');
    }
  };

  const handleRegenerate = async (runId: string) => {
    try {
      toast.loading('Regenerating...');
      const response = await historyApi.regenerate(runId);
      toast.dismiss();
      toast.success(response.data.message);
      loadHistory(); // Reload history
    } catch (error) {
      toast.dismiss();
      console.error('Error regenerating:', error);
      toast.error('Failed to regenerate');
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const link = document.createElement('a');
    link.href = `${apiUrl}${url}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${filename}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-50">UmukoziHR Resume Tailor</h1>
              {profile && (
                <p className="text-sm text-gray-600 dark:text-neutral-300">Welcome, {profile.basics.full_name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => router.push('/onboarding')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings size={18} />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'generate'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={18} />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History size={18} />
              History ({historyTotal})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Overview</h2>
              <CompletenessBar
                completeness={completeness}
                breakdown={breakdown}
                showBreakdown={true}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{profile.basics.full_name}</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{profile.basics.email}</span></div>
                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{profile.basics.phone || '-'}</span></div>
                <div><span className="text-gray-600">Location:</span> <span className="font-medium">{profile.basics.location || '-'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience ({profile.experience.length})</h3>
              <div className="space-y-3">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                    <div className="font-medium text-gray-900">{exp.title}</div>
                    <div className="text-gray-600">{exp.company} • {exp.start} - {exp.end}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills ({profile.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: JD Input */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Job Descriptions</h2>
                <JDComposer
                  onAddJob={handleAddJob}
                  defaultRegion={profile?.preferences.regions[0] || 'US'}
                />
              </div>

              {/* Job Queue */}
              {jobQueue.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Job Queue ({jobQueue.length})
                  </h3>
                  <div className="space-y-2">
                    {jobQueue.map((job, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-600">{job.company}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveJob(idx)}
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? 'Generating...' : `Generate ${jobQueue.length} Resume${jobQueue.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Documents</h2>
              {currentRun && currentRun.artifacts ? (
                <div className="space-y-4">
                  {currentRun.artifacts.map((artifact: any, idx: number) => (
                    <JobCard key={idx} data={artifact} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No documents generated yet. Add jobs and click Generate!
                </p>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Generation History ({historyTotal} total runs)
              </h2>
              <p className="text-gray-600 text-sm">
                View and re-generate past resumes. Re-generation uses your current profile version.
              </p>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            ) : historyItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {historyItems.map((run) => (
                    <RunCard
                      key={run.run_id}
                      run={run}
                      onRegenerate={handleRegenerate}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {historyTotal > 10 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => loadHistory(historyPage - 1)}
                      disabled={historyPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {historyPage} of {Math.ceil(historyTotal / 10)}
                    </span>
                    <button
                      onClick={() => loadHistory(historyPage + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 10)}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <History size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No generation history yet</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Generate Your First Resume
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
