import React from 'react';

interface IconProps {
  className?: string;
}

const ScanIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V3m12 18V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h.75m-.75 9h.75m16.5-9h-.75m.75 9h-.75" />
    </svg>
);

export default ScanIcon;
