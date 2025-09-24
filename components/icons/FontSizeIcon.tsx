import React from 'react';

interface IconProps {
  className?: string;
}

const FontSizeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 12h3m3 0h-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 12l1.5-4.5M4.5 12l1.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18h6m3 0h-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 18l3-12 3 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default FontSizeIcon;
