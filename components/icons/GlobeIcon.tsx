import React from 'react';

interface IconProps {
  className?: string;
}

const GlobeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21a8.956 8.956 0 01-4.25-1.037m4.25 1.037a8.956 8.956 0 004.25-1.037m-4.25 1.037C11.69 20.23 12 18.78 12 17.25c0-1.55-.31-3-1.25-4.25m-4.5 5.287A8.956 8.956 0 013 17.25c0-1.55.31-3 1.25-4.25m4.5 5.287c-.94-.83-1.5-1.97-1.5-3.287 0-1.317.56-2.457 1.5-3.287m0 6.574A8.956 8.956 0 0012 21a8.956 8.956 0 004.25-1.037M12 21c.94.83 1.5 1.97 1.5 3.287 0 1.317-.56 2.457-1.5 3.287m-1.5-6.574A8.956 8.956 0 0118 17.25c0-1.55-.31-3-1.25-4.25m-4.5 5.287c.94-.83 1.5-1.97 1.5-3.287 0-1.317-.56-2.457-1.5-3.287M3 13.5A8.956 8.956 0 017.25 3a8.956 8.956 0 018.5 0A8.956 8.956 0 0121 13.5" />
    </svg>
);

export default GlobeIcon;