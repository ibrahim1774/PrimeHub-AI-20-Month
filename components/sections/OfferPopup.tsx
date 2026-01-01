
import React from 'react';

interface OfferPopupProps {
  onClaim: () => void;
  isClaiming: boolean;
}

const OfferPopup: React.FC<OfferPopupProps> = ({ onClaim, isClaiming }) => {
  return (
    <div className="fixed bottom-24 right-6 left-6 md:left-auto md:right-12 z-[60] animate-fade-in max-w-none md:max-w-[280px]">
      <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6 flex flex-col items-center text-center border border-gray-100 max-sm:flex-row max-sm:items-center max-sm:text-left max-sm:gap-4 max-sm:p-4">
        <div className="max-sm:flex-1">
          <h3 className="text-[#000] font-black text-lg uppercase tracking-tighter mb-2 leading-tight max-sm:text-sm max-sm:mb-1">
            OWN THIS SITE
          </h3>
          <p className="text-gray-500 font-bold text-[8px] uppercase tracking-wide leading-relaxed mb-4 px-1 max-sm:mb-0 max-sm:px-0 max-sm:normal-case max-sm:text-[10px]">
            $20/mo hosting. PrimeHub handles all edits and design finalization.
          </p>
        </div>

        <button
          onClick={onClaim}
          disabled={isClaiming}
          className="w-full bg-[#05070A] text-white font-black text-[10px] py-4 rounded-[12px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all max-sm:w-auto max-sm:px-6 flex items-center justify-center text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaiming ? "LAUNCHING..." : "Launch Website"}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default OfferPopup;
