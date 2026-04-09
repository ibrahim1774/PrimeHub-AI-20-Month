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
