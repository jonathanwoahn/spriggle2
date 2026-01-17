'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { useRouter } from 'next/navigation';
import DatabaseUrlStep from './steps/database-url';
import DatabaseStep from './steps/database';
import AdminStep from './steps/admin';
import ApiKeysStep from './steps/api-keys';
import CompleteStep from './steps/complete';

type SetupStep = 'database_url' | 'database' | 'admin' | 'api_keys' | 'complete';

const STEPS: { label: string; key: SetupStep }[] = [
  { label: 'Environment', key: 'database_url' },
  { label: 'Database', key: 'database' },
  { label: 'Admin', key: 'admin' },
  { label: 'API Keys', key: 'api_keys' },
  { label: 'Done', key: 'complete' },
];

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<SetupStep>('database_url');
  const [completedSteps, setCompletedSteps] = useState<SetupStep[]>([]);
  const [needsRestart, setNeedsRestart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSetupStatus();
  }, []);

  const fetchSetupStatus = async () => {
    try {
      // First check if DATABASE_URL is configured
      const envResponse = await fetch('/api/setup/write-env');
      const envData = await envResponse.json();

      if (!envData.configured) {
        // No DATABASE_URL - start at database_url step
        setCurrentStep('database_url');
        setLoading(false);
        return;
      }

      // DATABASE_URL exists, check setup status
      const response = await fetch('/api/setup/status');
      const data = await response.json();

      if (data.isComplete) {
        router.push('/admin');
        return;
      }

      // Build list of completed steps
      const completed: SetupStep[] = ['database_url', ...(data.completedSteps || [])];

      // If admin already exists, mark admin step as completed
      if (data.hasAdmin && !completed.includes('admin')) {
        completed.push('admin');
      }

      setCompletedSteps(completed);

      // Find the first incomplete step
      const stepOrder: SetupStep[] = ['database_url', 'database', 'admin', 'api_keys', 'complete'];
      let nextStep: SetupStep = 'database';

      for (const step of stepOrder) {
        if (!completed.includes(step)) {
          nextStep = step;
          break;
        }
      }

      setCurrentStep(nextStep);
    } catch {
      // Database not accessible, might need URL or connection test
      setCurrentStep('database_url');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (step: SetupStep, options?: { requiresRestart?: boolean }) => {
    if (options?.requiresRestart) {
      setNeedsRestart(true);
      return;
    }

    const stepIndex = STEPS.findIndex(s => s.key === step);
    const nextStep = STEPS[stepIndex + 1]?.key;

    setCompletedSteps(prev => [...prev, step]);

    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      // Setup complete, redirect to admin with full page reload
      // to ensure the setup_complete cookie is properly saved
      window.location.href = '/admin';
    }
  };

  const getActiveStepIndex = () => {
    return STEPS.findIndex(s => s.key === currentStep);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stepper activeStep={getActiveStepIndex()} sx={{ mb: 4 }}>
        {STEPS.map((step) => (
          <Step key={step.key} completed={completedSteps.includes(step.key)}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {currentStep === 'database_url' && (
        <DatabaseUrlStep
          onComplete={(options) => handleStepComplete('database_url', options)}
          needsRestart={needsRestart}
        />
      )}
      {currentStep === 'database' && (
        <DatabaseStep onComplete={() => handleStepComplete('database')} />
      )}
      {currentStep === 'admin' && (
        <AdminStep onComplete={() => handleStepComplete('admin')} />
      )}
      {currentStep === 'api_keys' && (
        <ApiKeysStep onComplete={() => handleStepComplete('api_keys')} />
      )}
      {currentStep === 'complete' && (
        <CompleteStep onComplete={() => handleStepComplete('complete')} />
      )}
    </>
  );
}
