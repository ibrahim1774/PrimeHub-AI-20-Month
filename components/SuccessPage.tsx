import React, { useEffect, useState } from 'react';
import { Rocket, CheckCircle2, Globe, ExternalLink, Loader2 } from 'lucide-react';

interface SuccessPageProps {
    pendingId: string;
    companyName: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ pendingId, companyName }) => {
    const [status, setStatus] = useState<'loading' | 'deploying' | 'success' | 'error'>('loading');
    const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Trigger FB Pixel Purchase Event
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Purchase', {
                currency: 'USD',
                value: 20.00,
            });
        }
    }, []);

    useEffect(() => {
        const deploySite = async () => {
            try {
                setStatus('deploying');
                const response = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pendingId, companyName }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Deployment failed');
                }

                const data = await response.json();

                // Wait 8 seconds for DNS propagation
                await new Promise(resolve => setTimeout(resolve, 8000));

                const finalUrl = data.publicDomainUrl || data.url;
                setDeployedUrl(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`);
                setStatus('success');
            } catch (err: any) {
                console.error('Deployment error:', err);
                setError(err.message);
                setStatus('error');
            }
        };

        if (pendingId && companyName) {
            deploySite();
        }
    }, [pendingId, companyName]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
                {status === 'deploying' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-primary/10 rounded-full animate-ping" />
                            </div>
                            <div className="relative flex items-center justify-center">
                                <Loader2 className="w-16 h-16 text-black animate-spin" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Finalizing Your Site</h2>
                            <p className="text-gray-500 font-medium italic">
                                "PAY ONLY $20/MONTH FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE"
                            </p>
                            <p className="text-sm text-gray-400">Deploying {companyName} to Vercel...</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                        <div className="flex justify-center">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle2 className="w-16 h-16 text-green-600" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payment Successful!</h1>
                            <p className="text-lg text-gray-600">
                                Your professional website is now live and under management by PrimeHub.
                            </p>
                        </div>

                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium uppercase tracking-wider">Live URL</span>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded text-uppercase">Production</span>
                            </div>

                            <div className="relative group">
                                <a
                                    href={deployedUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-left p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-black transition-all group-hover:shadow-md"
                                >
                                    <p className="text-black font-semibold truncate pr-8">{deployedUrl}</p>
                                    <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                </a>
                            </div>

                            <a
                                href={deployedUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-black text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                            >
                                <Rocket className="w-5 h-5" />
                                VISIT YOUR NEW WEBSITE
                            </a>
                        </div>

                        <p className="text-gray-400 text-sm">
                            Bookmark this link. You can also manage your site through the PrimeHub dashboard.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="bg-red-50 p-4 rounded-full inline-block">
                            <Rocket className="w-12 h-12 text-red-500 rotate-180" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                        <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 italic">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessPage;
