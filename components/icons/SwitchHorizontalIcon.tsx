import React from 'react';

interface IconProps {
  className?: string;
}

const SwitchHorizontalIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3 21 7.5m0 0L16.5 12M21 7.5H3" />
    </svg>
);

export default SwitchHorizontalIcon;
