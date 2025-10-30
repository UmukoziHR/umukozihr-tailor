import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { profile as profileApi } from '@/lib/api';
import { ProfileV3, createEmptyProfile } from '@/lib/types';
import OnboardingStepper from '@/components/onboarding/OnboardingStepper';
import BasicsSection from '@/components/onboarding/BasicsSection';
import ExperienceSection from '@/components/onboarding/ExperienceSection';
import EducationSection from '@/components/onboarding/EducationSection';
import { ProjectsSection, SkillsSection, LinksExtrasSection } from '@/components/onboarding/ProjectsSkillsSection';
import ReviewSection from '@/components/onboarding/ReviewSection';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const STEPS = ['Basics', 'Experience', 'Education', 'Projects', 'Skills', 'Extras', 'Review'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [profile, setProfile] = useState<ProfileV3>(createEmptyProfile());
  const [completeness, setCompleteness] = useState(0);
  const [breakdown, setBreakdown] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      router.push('/');
      return;
    }

    // Try to load existing profile
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await profileApi.get();
      if (response.data.profile) {
        setProfile(response.data.profile);
        setCompleteness(response.data.completeness);
        toast.success('Loaded your existing profile');
      }
    } catch (error: any) {
      // 404 means no profile yet, which is expected for onboarding
      if (error.response?.status !== 404) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const saveProfile = async (showToast = true) => {
    setIsSaving(true);
    try {
      const response = await profileApi.update(profile);
      setCompleteness(response.data.completeness);
      if (showToast) {
        toast.success('Profile saved!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (showToast) {
        toast.error('Failed to save profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on blur (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profile.basics.full_name) {
        saveProfile(false);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [profile]);

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1 && (!profile.basics.full_name || !profile.basics.email)) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (currentStep === 2 && profile.experience.length === 0) {
      toast.error('Please add at least one work experience');
      return;
    }

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Save before moving to next step
    await saveProfile(false);

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    await saveProfile(true);

    // Fetch completeness
    try {
      const response = await profileApi.getCompleteness();
      setCompleteness(response.data.completeness);
      setBreakdown(response.data.breakdown);

      if (response.data.completeness < 50) {
        toast('Profile saved! Consider adding more details for better results', { icon: '⚠️' });
      } else {
        toast.success('Profile complete! Redirecting to app...');
      }

      // Redirect to main app
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    } catch (error) {
      console.error('Error fetching completeness:', error);
      router.push('/app');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicsSection
            data={profile.basics}
            onChange={(basics) => setProfile({ ...profile, basics })}
          />
        );
      case 2:
        return (
          <ExperienceSection
            data={profile.experience}
            onChange={(experience) => setProfile({ ...profile, experience })}
          />
        );
      case 3:
        return (
          <EducationSection
            data={profile.education}
            onChange={(education) => setProfile({ ...profile, education })}
          />
        );
      case 4:
        return (
          <ProjectsSection
            data={profile.projects}
            onChange={(projects) => setProfile({ ...profile, projects })}
          />
        );
      case 5:
        return (
          <SkillsSection
            data={profile.skills}
            onChange={(skills) => setProfile({ ...profile, skills })}
          />
        );
      case 6:
        return (
          <LinksExtrasSection
            certifications={profile.certifications}
            awards={profile.awards}
            languages={profile.languages}
            onCertificationsChange={(certifications) => setProfile({ ...profile, certifications })}
            onAwardsChange={(awards) => setProfile({ ...profile, awards })}
            onLanguagesChange={(languages) => setProfile({ ...profile, languages })}
          />
        );
      case 7:
        return <ReviewSection profile={profile} completeness={completeness} breakdown={breakdown} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to UmukoziHR!</h1>
          <p className="text-gray-600">Let's set up your profile to generate amazing tailored resumes</p>
        </div>

        {/* Stepper */}
        <OnboardingStepper
          currentStep={currentStep}
          steps={STEPS}
          completedSteps={completedSteps}
        />

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
            {isSaving && <span className="ml-2 text-orange-600">Saving...</span>}
          </div>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Finish & Continue
            </button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/app')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
