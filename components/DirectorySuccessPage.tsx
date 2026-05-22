import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const GHL_FORM_URL = 'https://app.gohighlevel.com/v2/preview/4Cfl2ya9UdYFoYuW868F';
// /barber-29 + /localbusiness-29 share this dedicated onboarding form
// (asks the customer to authorize $10/mo hosting).
const BARBER29_FORM_URL = 'https://api.leadconnectorhq.com/widget/form/sNiyT3yMdXdEgBG9nxjJ';

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
      const denmarkMonthly = tier === 'multi' ? 349.00 : 149.00;
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
      const barberGeneratorMonthly = tier === 'multi' ? 20.00 : 10.00;
      const barberGeneratorYearly = tier === 'multi' ? 144.00 : 72.00;
      const barberNineMonthly = tier === 'multi' ? 19.00 : 9.00;
      const barberNineYearly = tier === 'multi' ? 137.00 : 65.00;
      // /barber-9 was repriced to $5/$9 monthly · $36/$65 yearly (the
      // localbusiness-9 variants stay at $9/$19 · $65/$137).
      const barber9Monthly = tier === 'multi' ? 9.00 : 5.00;
      const barber9Yearly = tier === 'multi' ? 65.00 : 36.00;
      // /barber-29 = one-time $29 single / $49 multi (no recurring)
      const barberTwentyNineAmount = tier === 'multi' ? 29.00 : 19.00;
      // /localbusiness-29 = $29 single / $49 multi (no recurring)
      const localbusiness29Amount = tier === 'multi' ? 49.00 : 29.00;
      // /localbusiness-9-monthly = $9/mo single / $19/mo multi (subscription)
      const localbusiness9Monthly = tier === 'multi' ? 19.00 : 9.00;
      const barberFiveNineMonthly = 7.00;
      const barberFiveNineYearly = 50.00;
      const localbusinessVoiceMonthly = 29.00;
      // /barber-19 = $19 one-time design fee (no yearly)
      // /barber-19-hosting = $5/mo or $36/yr hosting subscription
      const barber19HostingMonthly = 5.00;
      const barber19HostingYearly = 36.00;
      const monthly = pathname === '/10' || pathname === '/barber' ? 10.00 : pathname === '/5' ? fiveMonthly : pathname === '/barber-5' ? barberFiveMonthly : pathname === '/barber-5-month' ? barberFiveMonthMonthly : pathname === '/barber-trial' ? barberTrialMonthly : pathname === '/barber-sample' ? barberSampleMonthly : pathname === '/barber-generator' ? barberGeneratorMonthly : pathname === '/barber-5-9' ? barberFiveNineMonthly : pathname === '/localbusiness-voice' ? localbusinessVoiceMonthly : pathname === '/barber-29' ? barberTwentyNineAmount : pathname === '/localbusiness-29' ? localbusiness29Amount : pathname === '/localbusiness-9-monthly' ? localbusiness9Monthly : pathname === '/barber-9' ? barber9Monthly : (pathname === '/localbusiness-9' || pathname === '/localbusiness-9-spanish') ? barberNineMonthly : pathname === '/barber-19' ? 19.00 : pathname === '/barber-19-hosting' ? barber19HostingMonthly : pathname === '/19' ? 19.00 : pathname === '/denmark' ? denmarkMonthly : pathname === '/' ? homeMonthly : 20.00;
      const yearly = pathname === '/5' ? fiveYearly : pathname === '/barber-5' ? barberFiveYearly : pathname === '/barber-5-month' ? barberFiveMonthYearly : pathname === '/barber-trial' ? barberTrialYearly : pathname === '/barber-sample' ? barberSampleYearly : pathname === '/barber-generator' ? barberGeneratorYearly : pathname === '/barber-5-9' ? barberFiveNineYearly : pathname === '/localbusiness-voice' ? localbusinessVoiceMonthly : pathname === '/barber-29' ? barberTwentyNineAmount : pathname === '/localbusiness-29' ? localbusiness29Amount : pathname === '/localbusiness-9-monthly' ? localbusiness9Monthly : pathname === '/barber-9' ? barber9Yearly : (pathname === '/localbusiness-9' || pathname === '/localbusiness-9-spanish') ? barberNineYearly : pathname === '/barber-19-hosting' ? barber19HostingYearly : pathname === '/barber-19' ? 19.00 : (pathname === '/10' || pathname === '/barber') ? 49.00 : pathname === '/local-business' ? 135.00 : 99.00;
      // pathname '/' (home) → $20/mo single or $50/mo multi based on ?tier=
      const value = isYearly ? yearly : monthly;
      const currency = isAus ? 'AUD' : pathname === '/denmark' ? 'DKK' : 'USD';
      const w = window as any;
      if (w.fbq) {
        w.fbq('track', 'Purchase', { currency, value }, { eventID });
      }
      if (w.ttq) {
        // TikTok purchase event. Same event_id as FB → CAPI dedupes.
        w.ttq.track('Purchase', {
          value,
          currency,
          contents: [{
            content_id: pathname,
            content_type: 'product',
            content_name: pathname,
          }],
        }, { event_id: eventID });
      }
    }

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const usesBarber29Form = pathname === '/barber-29' || pathname === '/localbusiness-29';
    const formUrl = usesBarber29Form ? BARBER29_FORM_URL : GHL_FORM_URL;

    // Show the "you must fill out the onboarding form" message ~2s in,
    // then redirect to the onboarding form shortly after.
    const onboardingTimer = setTimeout(() => setPhase('onboarding'), 2000);

    // Redirect to the onboarding form.
    const redirectTimer = setTimeout(() => {
      window.location.href = formUrl;
    }, 3800);

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
