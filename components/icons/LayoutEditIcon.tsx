import React from 'react';

interface IconProps {
  className?: string;
}

const LayoutEditIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h4.5m0 0v4.5m0-4.5L3.75 9m16.5 11.25h-4.5m0 0v-4.5m0 4.5l4.5-4.5M3.75 20.25l4.5-4.5M20.25 3.75l-4.5 4.5" />
    </svg>
);
export default LayoutEditIcon;