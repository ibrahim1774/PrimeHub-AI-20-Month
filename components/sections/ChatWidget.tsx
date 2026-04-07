import React from 'react';

interface ChatWidgetProps {
  brandColor: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ brandColor }) => {
  const handleClick = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{ backgroundColor: brandColor }}
      className="fixed bottom-40 right-4 z-[9997] w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
      aria-label="Get a free quote"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};

export default ChatWidget;
