import { useState } from "react";
import { api } from "../lib/api";
import ProfileForm from "../components/ProfileForm";
import JDInput from "../components/JDInput";
import JobCard from "../components/JobCard";
import toast from 'react-hot-toast';
import { FileText, Zap, Download, ExternalLink, Briefcase, User, Target } from "lucide-react";

type Artifact = {
  job_id: string;
  region: "US" | "EU" | "GL";
  resume_pdf: string;
  cover_letter_pdf: string;
  resume_tex: string;
  cover_letter_tex: string;
  created_at: string;
  updated_at: string;
};

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [result, setResult] = useState<{ run: string; artifacts: Artifact[]; zip: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const canGenerate = !!profile && jobs.length > 0 && !loading;

  async function generate() {
    setLoading(true);
    const loadingToast = toast.loading('🤖 AI is crafting your tailored documents...');
    
    try {
      const res = await api.post("/generate/generate", { profile, jobs, prefs:{} });
      setResult(res.data);
      
      toast.success(
        `🎉 Successfully generated ${res.data.artifacts.length} document${res.data.artifacts.length !== 1 ? 's' : ''}!`,
        { id: loadingToast }
      );
      
      // Show additional success details
      setTimeout(() => {
        toast.success('📁 ZIP bundle ready for download', {
          icon: '📦',
        });
      }, 1000);
      
    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || "Generation failed";
      toast.error(
        `❌ ${errorMessage}`,
        { id: loadingToast }
      );
      
      // Show helpful tips for common errors
      if (errorMessage.includes('API key')) {
        setTimeout(() => {
          toast.error('🔑 Please check your Gemini API key configuration');
        }, 1000);
      } else if (errorMessage.includes('validation')) {
        setTimeout(() => {
          toast.error('📝 Please verify your profile information is complete');
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  }

  function removeJob(idx:number){
    const job = jobs[idx];
    setJobs(prev => prev.filter((_,i)=>i!==idx));
    
    toast.success(
      `🗑️ Removed "${job.title}" from ${job.company}`,
      {
        icon: '❌',
        duration: 2000,
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Resurator</h1>
              <p className="text-lg text-gray-600 mt-1">AI-Powered Resume & Cover Letter Generator</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-3xl">
            Create a profile once, add multiple job descriptions, and generate perfectly tailored resumes and cover letters for each position. 
            Powered by advanced AI with ATS optimization.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Section */}
        <section className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <User className="w-6 h-6 text-brand-orange" />
            </div>
            <h2 className="text-2xl font-semibold text-brand-black">Your Profile</h2>
            {profile && (
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✓ Saved
              </span>
            )}
          </div>
          <ProfileForm onSave={setProfile} />
        </section>

        {/* Jobs Section */}
        <section className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-brand-orange" />
            </div>
            <h2 className="text-2xl font-semibold text-brand-black">Job Descriptions</h2>
            {jobs.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} added
              </span>
            )}
          </div>
          
          <JDInput onAdd={(j:any)=>setJobs(s=>[...s,j])} />
          
          {jobs.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-brand-black flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-orange" />
                Target Positions
              </h3>
              {jobs.map((j, idx)=>(
                <div key={idx} className="flex items-center justify-between p-4 bg-brand-gray-warm rounded-lg border border-brand-gray-cool">
                  <div className="flex-1">
                    <div className="font-semibold text-brand-black text-lg">{j.company} — {j.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ID: {j.id || "(auto-generated)"} • Region: 
                      <span className="ml-1 px-2 py-1 bg-white rounded text-xs font-medium">{j.region}</span>
                    </div>
                  </div>
                  <button 
                    onClick={()=>removeJob(idx)} 
                    className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-brand-gray-cool">
            <button 
              onClick={generate} 
              disabled={!canGenerate}
              className={`btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 ${
                !canGenerate ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Generate Tailored Documents
                </>
              )}
            </button>
            {!profile && (
              <p className="text-center text-gray-500 mt-3 text-sm">Please save your profile first</p>
            )}
            {profile && jobs.length === 0 && (
              <p className="text-center text-gray-500 mt-3 text-sm">Add at least one job description to continue</p>
            )}
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-brand-black">Generated Documents</h2>
                  <p className="text-gray-600 mt-1">Run ID: {result.run} • {result.artifacts.length} output{result.artifacts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <a 
                  href={result.zip} 
                  download 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => toast.success('📦 ZIP bundle download started!')}
                >
                  <Download className="w-5 h-5" />
                  Download ZIP
                </a>
                <form action="https://www.overleaf.com/docs" method="post" target="_blank">
                  <input type="hidden" name="snip_uri" value={`${location.origin}${result.zip}`} />
                  <button 
                    type="submit" 
                    className="btn-primary flex items-center gap-2"
                    onClick={() => toast.success('🚀 Opening in Overleaf...')}
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open in Overleaf
                  </button>
                </form>
              </div>
            </div>
            
            <div className="space-y-4">
              {result.artifacts.map(a => <JobCard key={a.job_id} data={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
