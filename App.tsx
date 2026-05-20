import React, { useState } from 'react';
import LandingForm from './components/LandingForm';
import LoadingScreen from './components/LoadingScreen';
import PreviewSite from './components/PreviewSite';
import SuccessPage from './components/SuccessPage';
import DirectoryPage from './components/DirectoryPage';
import DirectorySuccessPage from './components/DirectorySuccessPage';
import BarberSamplePage from './components/BarberSamplePage';
import BarberGeneratorPage from './components/BarberGeneratorPage';
import { useWebsiteGenerator } from './hooks/useWebsiteGenerator';
import { FormData } from './types';

type Region = 'us' | 'aus' | 'ten' | 'five' | 'nineteen' | 'barber' | 'localbusiness' | 'freewebsite' | 'freewebsite49' | 'home' | 'barberleads' | 'barberFive' | 'barberFiveMonth' | 'barberTrial' | 'barber19' | 'barber19Hosting' | 'barberNine' | 'localbusinessNine' | 'barberNineLeads' | 'localbusinessNineLeads' | 'localbusinessNineSpanish' | 'barberFiveNine' | 'localbusinessVoice';

const dirPaths: Record<string, Region> = {
  '/': 'home',
  '/1': 'us',
  '/aus': 'aus',
  '/10': 'ten',
  '/5': 'five',
  '/19': 'nineteen',
  '/barber': 'barber',
  '/barber-5': 'barberFive',
  '/barber-5-month': 'barberFiveMonth',
  '/barber-trial': 'barberTrial',
  '/barber-19': 'barber19',
  '/barber-19-hosting': 'barber19Hosting',
  '/barber-9': 'barberNine',
  '/localbusiness-9': 'localbusinessNine',
  '/barber-9-leads': 'barberNineLeads',
  '/localbusiness-9-leads': 'localbusinessNineLeads',
  '/localbusiness-9-spanish': 'localbusinessNineSpanish',
  '/barber-5-9': 'barberFiveNine',
  '/localbusiness-voice': 'localbusinessVoice',
  '/local-business': 'localbusiness',
  '/freewebsite': 'freewebsite',
  '/freewebsite49': 'freewebsite49',
  '/barberleads': 'barberleads',
};

const LandingFlow: React.FC = () => {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const statusParam = urlParams.get('status');
  const pendingIdParam = urlParams.get('pendingId');
  const companyNameParam = urlParams.get('companyName');

  const {
    isGenerating,
    progress,
    statusMessage,
    generatedData,
    generatedImages,
    error,
    generateWebsite,
    resetGenerator
  } = useWebsiteGenerator();

  const [lastUsedName, setLastUsedName] = useState('');

  if (statusParam === 'success' && pendingIdParam && companyNameParam) {
    return <SuccessPage pendingId={pendingIdParam} companyName={companyNameParam} />;
  }

  if (statusParam === 'cancelled') {
    window.history.replaceState({}, '', '/generator');
  }

  const handleGenerate = (data: FormData) => {
    setLastUsedName(data.companyName);
    import('./services/leadService').then(({ captureLead }) => {
      captureLead(data).catch(err => console.error('Lead capture failed:', err));
    }).catch(err => console.error('Lead service import failed:', err));
    generateWebsite(data);
  };

  if (isGenerating) {
    return <LoadingScreen progress={progress} statusMessage={statusMessage} companyName={lastUsedName} />;
  }

  if (generatedData && generatedImages) {
    return (
      <PreviewSite
        data={generatedData}
        images={generatedImages}
        onExit={resetGenerator}
      />
    );
  }

  return (
    <div className="relative">
      <LandingForm onGenerate={handleGenerate} />

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-[100]">
          {error}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const status = params.get('status');
  const pendingId = params.get('pendingId');
  const companyName = params.get('companyName');

  // Legacy generator success on '/' (kept for any in-flight Stripe sessions created before the move)
  if (status === 'success' && pendingId && companyName) {
    return <SuccessPage pendingId={pendingId} companyName={companyName} />;
  }

  // /generator — landing form / website generator flow
  if (pathname === '/generator') {
    return <LandingFlow />;
  }

  // /barber-sample — live Euphoria iframe with sticky pricing CTA
  if (pathname === '/barber-sample') {
    if (status === 'success') {
      return <DirectorySuccessPage />;
    }
    if (status === 'cancelled') {
      window.history.replaceState({}, '', pathname);
    }
    return <BarberSamplePage />;
  }

  // /barber-generator — barber enters shop+phone, sees personalized sample
  if (pathname === '/barber-generator') {
    if (status === 'success') {
      return <DirectorySuccessPage />;
    }
    if (status === 'cancelled') {
      window.history.replaceState({}, '', pathname);
    }
    return <BarberGeneratorPage />;
  }

  // Directory pages incl. new luxurious home '/'
  if (pathname in dirPaths) {
    const region = dirPaths[pathname];

    // /barber-19 success = design fee paid → forward to the hosting
    // selection page, NOT the GHL onboarding form. Hosting step does
    // the final onboarding redirect itself.
    if (pathname === '/barber-19' && status === 'success' && typeof window !== 'undefined') {
      // Carry the session_id forward so the hosting page can read it
      // for Pixel attribution if it wants.
      const sid = params.get('session_id') || '';
      const next = `/barber-19-hosting${sid ? `?design_session_id=${encodeURIComponent(sid)}` : ''}`;
      window.location.replace(next);
      return null;
    }

    if (status === 'success') {
      return <DirectorySuccessPage />;
    }
    if (status === 'cancelled') {
      window.history.replaceState({}, '', pathname);
    }
    return <DirectoryPage region={region} />;
  }

  // 404 fallback → home
  return <DirectoryPage region="home" />;
};

export default App;
