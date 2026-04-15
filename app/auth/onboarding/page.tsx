'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Building2, Users, Shield } from 'lucide-react';

const ROLES = [
  { id: 'owner', label: 'Owner', description: 'Full access to all projects and settings', icon: Building2 },
  { id: 'pm', label: 'Project Manager', description: 'Manage projects and team assignments', icon: Users },
  { id: 'contractor', label: 'Contractor', description: 'Execute tasks and upload proofs', icon: Shield },
  { id: 'engineer', label: 'Engineer', description: 'Review and approve work', icon: Shield },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('pm');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              role: selectedRole,
              companyName,
              teamSize,
            },
          }),
        });
        if (response.ok) {
          // Wait a moment for the response to be fully processed
          setTimeout(() => {
            router.push('/dashboard');
          }, 300);
        } else {
          console.error('Onboarding failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Onboarding error:', error);
        setLoading(false);
      }
    }
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              L
            </div>
            <h1 className="text-2xl font-bold text-foreground">Conzimer</h1>
          </div>
          <p className="text-muted-foreground">Let's set up your account</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Step {step} of 3</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Welcome to Conzimer</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Streamline your construction projects</p>
                    <p className="text-sm text-muted-foreground">Manage workflows, assign teams, and track progress all in one place</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Proof & compliance tracking</p>
                    <p className="text-sm text-muted-foreground">Upload and organize documentation, photos, and inspections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Legal audit trail</p>
                    <p className="text-sm text-muted-foreground">Immutable logs for every action, change, and approval</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 font-medium"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Company</h2>
              <p className="text-muted-foreground text-sm mb-6">Tell us about your organization</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g., BuildCorp Construction"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Team Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['1-10', '11-50', '50+'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setTeamSize(size)}
                        className={`px-4 py-2 border rounded-lg hover:border-primary hover:bg-primary/10 transition text-sm font-medium ${
                          teamSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 rounded-lg py-2.5 font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!companyName || !teamSize}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Role */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Role</h2>
              <p className="text-muted-foreground text-sm mb-6">What's your role in the organization?</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-input'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Icon className={`w-5 h-5 mt-0.5 ${
                          selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="font-medium text-foreground">{role.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 rounded-lg py-2.5 font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
