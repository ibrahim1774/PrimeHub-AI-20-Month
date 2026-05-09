import { FormData } from '../types';

const WEBHOOK_URL = 'https://hook.us2.make.com/13c5hrlguxltx76dhtl3zvm56ma8sd5t';

export const captureLead = async (inputs: FormData) => {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...inputs,
        timestamp: new Date().toISOString(),
        source: typeof window !== 'undefined' ? window.location.hostname : '',
      }),
    });
    console.log('Lead captured via webhook successfully!');
  } catch (error) {
    console.error('Lead capture failed:', error);
  }
};

export interface BarberGeneratorLead {
  shop: string;
  phone: string;
  city?: string;
}

// Posts barber-generator form submissions to the same Make.com
// webhook the rest of the lead flow uses. The Make scenario behind
// this webhook appends to the team's Google Sheet — see the linked
// PrimeHub-AI-10-Month repo for the Sheet mapping reference.
//
// Field shape mirrors `FormData` where possible (companyName, phone,
// serviceArea) so existing Sheet columns pick the values up without
// remapping. `formType` lets the scenario branch on barber-generator
// rows separately if needed.
export const captureBarberGeneratorLead = async (lead: BarberGeneratorLead) => {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: 'barber-generator',
        companyName: lead.shop,
        phone: lead.phone,
        serviceArea: lead.city || '',
        // Preserve the raw fields too, in case the Sheet mapping uses these names.
        shop: lead.shop,
        city: lead.city || '',
        timestamp: new Date().toISOString(),
        source: typeof window !== 'undefined' ? window.location.hostname : '',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      }),
    });
    console.log('Barber generator lead captured via webhook successfully!');
  } catch (error) {
    console.error('Barber generator lead capture failed:', error);
  }
};
