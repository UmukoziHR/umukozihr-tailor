import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { profile as profileApi } from "../lib/api";
import LoginForm from "../components/LoginForm";
import ThemeToggle from "../components/ThemeToggle";
import { FileText, Zap, Target, CheckCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      // No token, stay on landing/login page
      setIsCheckingAuth(false);
      return;
    }

    // Token exists, check if profile exists
    try {
      const response = await profileApi.get();
      if (response.data.profile) {
        // Profile exists, redirect to /app
        router.push('/app');
      } else {
        // No profile, redirect to onboarding
        router.push('/onboarding');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No profile found, redirect to onboarding
        router.push('/onboarding');
      } else {
        // Other error, token might be invalid
        localStorage.removeItem('token');
        setIsCheckingAuth(false);
      }
    }
  };

  const handleLogin = async (token: string) => {
    // After login, check if profile exists
    console.log('handleLogin called with token:', token ? 'present' : 'missing');

    // Small delay to ensure token is properly stored
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log('Checking for existing profile...');
      const response = await profileApi.get();
      console.log('Profile response:', response.data);

      if (response.data && response.data.profile) {
        console.log('Profile exists, redirecting to /app');
        await router.push('/app');
      } else {
        console.log('No profile data, redirecting to /onboarding');
        await router.push('/onboarding');
      }
    } catch (error: any) {
      console.log('Profile check error:', error);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);

      // For 404 or any error, redirect to onboarding (new user flow)
      console.log('Redirecting to /onboarding for new user');
      await router.push('/onboarding');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-neutral-50 mb-4">
              UmukoziHR Resume Tailor
            </h1>
            <p className="text-xl text-gray-700 dark:text-neutral-300 mb-2">
              AI-Powered Resume & Cover Letter Generation
            </p>
            <p className="text-gray-600 dark:text-neutral-400">
              Tailor your resume to any job posting in seconds
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-orange-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-2">
                Smart Tailoring
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 text-sm">
                AI analyzes job descriptions and highlights your most relevant experience
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 text-sm">
                Generate professional PDFs and LaTeX files in seconds
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-2">
                Region-Specific
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 text-sm">
                Templates optimized for US, EU, and Global job markets
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-50 mb-6 text-center">
                Get Started
              </h2>
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                <CheckCircle className="text-green-600" size={16} />
                Profile Once, Reuse Forever
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                <CheckCircle className="text-green-600" size={16} />
                ATS-Optimized Output
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                <CheckCircle className="text-green-600" size={16} />
                Overleaf Integration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
