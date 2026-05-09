import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const GHL_FORM_URL = 'https://app.gohighlevel.com/v2/preview/4Cfl2ya9UdYFoYuW868F';

const DirectorySuccessPage: React.FC = () => {
  const [phase, setPhase] = useState<'success' | 'onboarding'>('success');

  useEffect(() => {
    // Fire FB + TikTok Pixel Purchase event with dedup eventID from Stripe session
    if (typeof window !== 'undefined' && ((window as any).fbq || (window as any).ttq)) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const plan = params.get('plan') || 'monthly';
      const eventID = sessionId ? `purchase_${sessionId}` : `purchase_${Date.now()}`;
      const pathname = window.location.pathname;
      const tier = params.get('tier');
      const isAus = pathname === '/aus';
      const isYearly = plan === 'yearly';
      const homeMonthly = tier === 'multi' ? 50.00 : 20.00;
      const fiveMonthly = tier === 'multi' ? 10.00 : 5.00;
      const fiveYearly = tier === 'multi' ? 72.00 : 36.00;
      const barberFiveMonthly = tier === 'multi' ? 10.00 : 5.00;
      const barberFiveYearly = tier === 'multi' ? 72.00 : 36.00;
      const barberFiveMonthMonthly = tier === 'multi' ? 10.00 : 5.00;
      const barberFiveMonthYearly = tier === 'multi' ? 72.00 : 36.00;
      const barberTrialMonthly = tier === 'multi' ? 20.00 : 10.00;
      const barberTrialYearly = tier === 'multi' ? 144.00 : 72.00;
      const barberSampleMonthly = tier === 'multi' ? 10.00 : 5.00;
      const barberSampleYearly = tier === 'multi' ? 72.00 : 36.00;
      const barberGeneratorMonthly = tier === 'multi' ? 10.00 : 5.00;
      const barberGeneratorYearly = tier === 'multi' ? 72.00 : 36.00;
      const monthly = pathname === '/10' || pathname === '/barber' ? 10.00 : pathname === '/5' ? fiveMonthly : pathname === '/barber-5' ? barberFiveMonthly : pathname === '/barber-5-month' ? barberFiveMonthMonthly : pathname === '/barber-trial' ? barberTrialMonthly : pathname === '/barber-sample' ? barberSampleMonthly : pathname === '/barber-generator' ? barberGeneratorMonthly : pathname === '/19' ? 19.00 : pathname === '/' ? homeMonthly : 20.00;
      const yearly = pathname === '/5' ? fiveYearly : pathname === '/barber-5' ? barberFiveYearly : pathname === '/barber-5-month' ? barberFiveMonthYearly : pathname === '/barber-trial' ? barberTrialYearly : pathname === '/barber-sample' ? barberSampleYearly : pathname === '/barber-generator' ? barberGeneratorYearly : (pathname === '/10' || pathname === '/barber') ? 49.00 : pathname === '/local-business' ? 135.00 : 99.00;
      // pathname '/' (home) → $20/mo single or $50/mo multi based on ?tier=
      const value = isYearly ? yearly : monthly;
      const currency = isAus ? 'AUD' : 'USD';
      const w = window as any;
      if (w.fbq) {
        w.fbq('track', 'Purchase', { currency, value }, { eventID });
      }
      if (w.ttq) {
        // TikTok's purchase event is "CompletePayment".
        w.ttq.track('CompletePayment', { currency, value }, { event_id: eventID });
      }
    }

    // After 2.5s, show onboarding message
    const onboardingTimer = setTimeout(() => setPhase('onboarding'), 2500);

    // After 4s, redirect to GHL form
    const redirectTimer = setTimeout(() => {
      window.location.href = GHL_FORM_URL;
    }, 4000);

    return () => {
      clearTimeout(onboardingTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {phase === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payment Successful!</h1>
              <p className="text-lg text-gray-600">
                Thank you for your purchase. Setting up your account...
              </p>
            </div>
          </div>
        )}

        {phase === 'onboarding' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-black animate-spin" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">One Last Step</h2>
              <p className="text-lg text-gray-700 font-medium">
                You must complete this onboarding form to get your website built.
              </p>
              <p className="text-sm text-gray-400">Redirecting you now...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorySuccessPage;
