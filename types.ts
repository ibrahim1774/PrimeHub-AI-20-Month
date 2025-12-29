export interface GeneratedWebsite {
  companyName: string;
  brandColor: string;
  industry: string;
  location: string;
  phone: string;
  hero: {
    badge: string;
    headline: {
      line1: string;
      line2: string; 
      line3: string;
    };
    subtext: string;
    trustIndicators: Array<{
      icon: string;
      label: string;
      sublabel: string;
    }>;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  industryValue: {
    title: string;
    content: string;
    subtext: string;
  };
  featureHighlight: {
    badge: string;
    headline: string;
    cards: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  benefits: {
    title: string;
    intro: string;
    items: string[];
  };
  processSteps: {
    badge: string;
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  emergencyCTA: {
    headline: string;
    subtext: string;
    buttonText: string;
  };
  credentials: {
    badge: string;
    headline: string;
    description: string;
    items: string[];
    certificationText: string;
  };
  ctaVariations: {
    requestQuote: string;
    getEstimate: string;
    speakWithTeam: string;
    callAndText: string;
  };
}

export interface GeneratedImages {
  heroBackground: string;
  industryValue: string;
  credentialsShowcase: string;
}

export interface FormData {
  industry: string;
  companyName: string;
  serviceArea: string;
  phone: string;
  brandColor: string;
}
