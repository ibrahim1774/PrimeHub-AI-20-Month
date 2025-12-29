import React from 'react';

interface LoadingScreenProps {
  progress: number;
  statusMessage: string;
  companyName?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, statusMessage, companyName }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#05070A] flex flex-col items-center justify-center p-6 text-center font-inter overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>

      <div className="max-w-2xl mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight tracking-tight px-4 transition-all duration-500 ease-in-out">
          {statusMessage}
        </h2>
        <p className="text-gray-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">
          PrimeHub Automated Deployment
        </p>
      </div>

      <div className="w-full max-w-[340px] mb-12">
        <div className="bg-white/5 border border-white/10 rounded-full h-[6px] overflow-hidden mb-5">
          <div 
            className="bg-blue-600 h-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Processing Data</span>
          </div>
          <span className="text-white font-bold text-sm tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Subtle Animation Hub */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-t border-blue-500/40 animate-spin"></div>
        </div>
      </div>
      
      <div className="mt-16 text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] opacity-40">
        {companyName ? `Optimizing Assets for ${companyName}` : 'Finalizing Configuration'}
      </div>
    </div>
  );
};

export default LoadingScreen;
